"use client"

import type React from "react"

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
} from "lucide-react"
import { collection, getDocs, query, where } from "firebase/firestore"
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
  const [newProject, setNewProject] = useState({
    projectName: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
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

  // Handle input changes for the new project form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value })
  }

  // Redirect to CreateProject page for creating a new project
  const handleCreateProject = async () => {
    if (user && user.role === "admin") {
      try {
        // Fetch the "TestProject" data from Firestore
        const testProjectRef = collection(db, "projects")
        const querySnapshot = await getDocs(testProjectRef)
        const testProject = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .find((project: any) => project.projectName === "TestProject")

        if (testProject) {
          // Pass the "TestProject" data along with user input to the CreateProject page
          router.push(
            `/create-project?name=${encodeURIComponent(newProject.projectName)}&template=${encodeURIComponent(JSON.stringify(testProject))}`,
          )
        } else {
          alert("TestProject template not found.")
        }
      } catch (error: any) {
        console.error("Error fetching TestProject:", error)
        if (error.code === "permission-denied") {
          alert("You don't have permission to access the template project. Please contact your administrator.")
        } else {
          alert("Failed to fetch TestProject template.")
        }
      }
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

  // Filter projects based on status
  const filteredProjects = projects.filter((project) => {
    if (statusFilter === "all") return true

    // Check if any evaluator has the selected status
    return Object.values(project.evaluators || {}).some((evaluator) => evaluator.status === statusFilter)
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0">Create New Project</h3>

          <div className="flex gap-4">
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

            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                name="projectName"
                value={newProject.projectName}
                onChange={handleInputChange}
                placeholder="Project Name"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCreateProject}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Create Project</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Saved Projects</h3>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-sm text-gray-600">
              Filter by status:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Project Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Created At</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                    Evaluators & Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">
                      {statusFilter === "all"
                        ? "No projects created yet :)"
                        : `No projects with status "${statusFilter.replace("_", " ")}" found.`}
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b text-sm">{project.projectName}</td>
                      <td className="px-4 py-3 border-b text-sm">{project.projectDescription}</td>
                      <td className="px-4 py-3 border-b text-sm">
                        {project.createdAt ? project.createdAt.toDate().toLocaleString() : "N/A"}
                      </td>
                      <td className="px-4 py-3 border-b text-sm">
                        <ul className="space-y-2">
                          {Object.entries(project.evaluators || {}).map(([role, evaluator]) =>
                            evaluator ? (
                              <li key={role} className="flex items-center gap-2">
                                {getStatusIcon(evaluator.status)}
                                <span className="font-medium">{role}:</span> {evaluator.email}
                                <span
                                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                    evaluator.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : evaluator.status === "in_progress"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {evaluator.status || "pending"}
                                </span>
                                {evaluator.lastUpdated && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    Updated: {formatDate(evaluator.lastUpdated)}
                                  </span>
                                )}
                              </li>
                            ) : null,
                          )}
                        </ul>
                      </td>
                      <td className="px-4 py-3 border-b text-sm">
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
                            title="Copy evaluation link to clipboard"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Copy Link</span>
                          </button>
                          <button
                            onClick={() => router.push(`/evaluation-form/${project.id}`)}
                            className="flex items-center gap-1 text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
