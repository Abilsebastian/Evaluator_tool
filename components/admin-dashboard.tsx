"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  PlusCircle,
  Edit,
  AlertCircle,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart,
  UserPlusIcon as UsersPlus,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  FileText,
  FilePlus,
  Users,
  Calendar,
} from "lucide-react"
import { collection, getDocs, doc, deleteDoc, query, where } from "firebase/firestore"
import { db, auth } from "@/lib/firebase-config"

interface Evaluator {
  email: string
  uid: string
  status?: "pending" | "in_progress" | "completed"
  lastUpdated?: any
  submittedAt?: any
}

interface Project {
  id: string
  projectName: string
  projectDescription: string
  createdBy: string
  createdAt: {
    toDate: () => Date
  }
  evaluators: Record<string, Evaluator>
  evaluations?: Record<
    string,
    {
      status: "pending" | "in_progress" | "completed"
      lastUpdated?: any
      submittedAt?: any
    }
  >
}

interface AdminDashboardProps {
  user: {
    uid?: string
    email?: string
    role?: string
  } | null
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const router = useRouter()

  // Fetch projects from Firestore
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)

        // Make sure we have a user and they're authenticated
        if (!user?.uid || !auth.currentUser) {
          throw new Error("User not authenticated")
        }

        // If user is admin, fetch all projects
        // Otherwise, fetch only projects created by or assigned to this user
        let projectsQuery

        if (user.role === "admin") {
          projectsQuery = collection(db, "projects")
        } else {
          // For non-admin users, only fetch projects they created
          projectsQuery = query(collection(db, "projects"), where("createdBy", "==", user.uid))
        }

        const querySnapshot = await getDocs(projectsQuery)
        const projectsList = querySnapshot.docs.map((doc) => {
          const data = doc.data()

          // Merge evaluation status into evaluators for easier display
          const evaluators = { ...data.evaluators } || {}
          const evaluations = data.evaluations || {}

          // Add status to each evaluator
          Object.keys(evaluators).forEach((role) => {
            if (evaluators[role] && evaluations[role]) {
              evaluators[role] = {
                ...evaluators[role],
                status: evaluations[role].status || "pending",
                lastUpdated: evaluations[role].lastUpdated,
                submittedAt: evaluations[role].submittedAt,
              }
            } else if (evaluators[role]) {
              evaluators[role] = {
                ...evaluators[role],
                status: "pending",
              }
            }
          })

          return {
            id: doc.id,
            ...data,
            evaluators,
          }
        }) as Project[]

        setProjects(projectsList)
      } catch (error: any) {
        console.error("Error fetching projects:", error)

        if (error.code === "permission-denied") {
          setError("You don't have permission to access these projects. Please contact your administrator.")
        } else {
          setError(`Error loading projects: ${error.message}`)
        }
      } finally {
        setLoading(false)
      }
    }

    if (user?.uid) {
      fetchProjects()
    }
  }, [user])

  // Navigate to create project page
  const handleCreateProject = (mode: "template" | "scratch") => {
    if (user && user.role === "admin") {
      router.push(`/create-project?mode=${mode}`)
    } else {
      alert("You don't have permission to create a project.")
    }
  }

  // Redirect to CreateProject page with project data for editing
  const handleEditProject = (project: Project) => {
    if (user && user.role === "admin") {
      router.push(`/create-project?id=${project.id}`)
    } else {
      alert("You don't have permission to edit this project.")
    }
  }

  // Copy evaluation link to clipboard
  const handleCopyLink = (projectId: string) => {
    // Use a safe way to access window that works with SSR
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/evaluation-form/${projectId}`
      navigator.clipboard.writeText(url)
      alert("Evaluation link copied to clipboard!")
    }
  }

  // Get status icon based on evaluator status
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "pending":
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />
    }
  }

  // Format date from Firestore timestamp
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    try {
      return timestamp.toDate().toLocaleString()
    } catch (e) {
      return "Invalid date"
    }
  }

  // Calculate project completion percentage
  const calculateCompletionPercentage = (project: Project) => {
    const evaluators = Object.values(project.evaluators || {})
    if (evaluators.length === 0) return 0

    const completed = evaluators.filter((e) => e.status === "completed").length
    const inProgress = evaluators.filter((e) => e.status === "in_progress").length

    // Count in-progress as half complete
    return Math.round(((completed + inProgress * 0.5) / evaluators.length) * 100)
  }

  // Get overall status of a project
  const getProjectStatus = (project: Project) => {
    const evaluators = Object.values(project.evaluators || {})
    if (evaluators.length === 0) return "pending"

    const completed = evaluators.filter((e) => e.status === "completed").length
    const inProgress = evaluators.filter((e) => e.status === "in_progress").length

    if (completed === evaluators.length) return "completed"
    if (completed > 0 || inProgress > 0) return "in_progress"
    return "pending"
  }

  // Handle project deletion
  const handleDeleteProject = async (projectId: string) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm("Are you sure you want to delete this project? This action cannot be undone.")

    if (confirmDelete) {
      try {
        if (!auth.currentUser) {
          throw new Error("User not authenticated")
        }

        // Delete the project from Firestore
        await deleteDoc(doc(db, "projects", projectId))

        // Update the UI by removing the deleted project
        setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId))

        alert("Project deleted successfully!")
      } catch (error: any) {
        console.error("Error deleting project:", error)
        if (error.code === "permission-denied") {
          alert("You don't have permission to delete projects. Please contact your administrator.")
        } else {
          alert(`Failed to delete project: ${error.message}`)
        }
      }
    }
  }

  // Filter and search projects
  const filteredProjects = projects
    .filter((project) => {
      // Status filter
      if (statusFilter !== "all") {
        const projectStatus = getProjectStatus(project)
        if (projectStatus !== statusFilter) return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          project.projectName.toLowerCase().includes(query) ||
          (project.projectDescription && project.projectDescription.toLowerCase().includes(query))
        )
      }

      return true
    })
    .sort((a, b) => {
      // Sort by creation date (newest first)
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
      }
      return 0
    })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header section with create buttons */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Project Management</h3>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => router.push("/results-dashboard")}
              className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              <BarChart className="h-5 w-5" />
              <span>Results Dashboard</span>
            </button>

            <button
              onClick={() => router.push("/project-assignments")}
              className="flex items-center justify-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition-colors"
            >
              <UsersPlus className="h-5 w-5" />
              <span>Fix Assignments</span>
            </button>

            <button
              onClick={() => router.push("/product-showcase")}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <FileText className="h-5 w-5" />
              <span>Product Showcase PDF</span>
            </button>

            <div className="relative group">
              <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                <PlusCircle className="h-5 w-5" />
                <span>Create Project</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              <div className="absolute right-0 mt-1 w-60 bg-white rounded-md shadow-lg overflow-hidden z-20 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300">
                {/* Add a transparent overlay to extend the hover area */}
                <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent"></div>
                <div className="py-1">
                  <button
                    onClick={() => handleCreateProject("template")}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                    <span>Use Default Template</span>
                  </button>
                  <button
                    onClick={() => handleCreateProject("scratch")}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FilePlus className="h-4 w-4 mr-2 text-green-600" />
                    <span>Start from Scratch</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 text-gray-600" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-600"}`}
              >
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-2 h-2 bg-current rounded-sm"></div>
                  <div className="w-2 h-2 bg-current rounded-sm"></div>
                  <div className="w-2 h-2 bg-current rounded-sm"></div>
                  <div className="w-2 h-2 bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-600"}`}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="w-4 h-1 bg-current rounded-sm"></div>
                  <div className="w-4 h-1 bg-current rounded-sm"></div>
                  <div className="w-4 h-1 bg-current rounded-sm"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="p-4 bg-gray-50 rounded-md mb-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Projects display */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Projects</h3>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-start mb-4">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p>{error}</p>
              {error.includes("permission") && (
                <p className="mt-2">
                  <a href="/firebase-help" className="text-blue-600 hover:underline">
                    Learn how to fix Firebase permission issues
                  </a>
                </p>
              )}
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? "No projects match your search criteria"
                : statusFilter !== "all"
                  ? `No projects with status "${statusFilter.replace("_", " ")}" found`
                  : "Get started by creating your first project"}
            </p>
            <button
              onClick={() => handleCreateProject("template")}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Project
            </button>
          </div>
        ) : viewMode === "grid" ? (
          // Grid view
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const completionPercentage = calculateCompletionPercentage(project)
              const projectStatus = getProjectStatus(project)
              const evaluatorCount = Object.keys(project.evaluators || {}).length

              return (
                <div
                  key={project.id}
                  className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-medium text-gray-800 truncate">{project.projectName}</h4>
                      <div
                        className={`px-2 py-1 text-xs rounded-full ${
                          projectStatus === "completed"
                            ? "bg-green-100 text-green-800"
                            : projectStatus === "in_progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {projectStatus.replace("_", " ")}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {project.projectDescription || "No description provided"}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        Created: {project.createdAt ? project.createdAt.toDate().toLocaleDateString() : "N/A"}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Completion</span>
                        <span>{completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            completionPercentage === 100
                              ? "bg-green-500"
                              : completionPercentage > 50
                                ? "bg-blue-500"
                                : completionPercentage > 0
                                  ? "bg-yellow-500"
                                  : "bg-gray-300"
                          }`}
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {evaluatorCount} evaluator{evaluatorCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEditProject(project)}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span className="text-xs">Edit</span>
                      </button>

                      <button
                        onClick={() => handleCopyLink(project.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="text-xs">Copy Link</span>
                      </button>

                      <button
                        onClick={() => router.push(`/results-dashboard?projectId=${project.id}`)}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100"
                      >
                        <BarChart className="h-3.5 w-3.5" />
                        <span className="text-xs">View Results</span>
                      </button>

                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="text-xs">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          // List view
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Project Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Created At</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Completion</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => {
                  const completionPercentage = calculateCompletionPercentage(project)
                  const projectStatus = getProjectStatus(project)

                  return (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b">
                        <div className="font-medium text-gray-800">{project.projectName}</div>
                      </td>
                      <td className="px-4 py-3 border-b text-sm text-gray-600 max-w-xs truncate">
                        {project.projectDescription || "No description"}
                      </td>
                      <td className="px-4 py-3 border-b text-sm text-gray-600">
                        {project.createdAt ? project.createdAt.toDate().toLocaleString() : "N/A"}
                      </td>
                      <td className="px-4 py-3 border-b">
                        <div
                          className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                            projectStatus === "completed"
                              ? "bg-green-100 text-green-800"
                              : projectStatus === "in_progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {getStatusIcon(projectStatus)}
                          <span className="ml-1 capitalize">{projectStatus.replace("_", " ")}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${
                                completionPercentage === 100
                                  ? "bg-green-500"
                                  : completionPercentage > 50
                                    ? "bg-blue-500"
                                    : completionPercentage > 0
                                      ? "bg-yellow-500"
                                      : "bg-gray-300"
                              }`}
                              style={{ width: `${completionPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">{completionPercentage}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditProject(project)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleCopyLink(project.id)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Copy Link</span>
                          </button>
                          <button
                            onClick={() => router.push(`/results-dashboard?projectId=${project.id}`)}
                            className="flex items-center gap-1 text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            <BarChart className="h-4 w-4" />
                            <span>View Results</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">Evaluation Status Legend</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">Pending: Evaluator hasn't started</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-700">In Progress: Evaluation started but not submitted</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">Completed: Evaluation submitted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
