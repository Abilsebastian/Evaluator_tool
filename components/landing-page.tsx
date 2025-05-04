"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { db, auth } from "@/lib/firebase-config"
import { collection, getDocs, addDoc, doc, getDoc, deleteDoc } from "firebase/firestore"
import { ClipboardCheck, PlusCircle, AlertCircle, CheckCircle, Clock, AlertTriangle, Trash2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface Project {
  id: string
  projectName: string
  projectDescription: string
  createdBy: string
  createdAt: {
    toDate: () => Date
  }
  evaluators: Record<
    string,
    {
      email: string
      uid: string
    }
  >
  evaluations?: Record<
    string,
    {
      status: "pending" | "in_progress" | "completed"
      lastUpdated?: any
      submittedAt?: any
    }
  >
  userRole?: string
  status?: "pending" | "in_progress" | "completed"
}

interface LandingPageProps {
  user: {
    uid?: string
    email?: string
    role?: string
  } | null
}

export default function LandingPage({ user }: LandingPageProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [projectData, setProjectData] = useState({
    projectName: "",
    projectDescription: "",
  })
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProjectData({ ...projectData, [e.target.name]: e.target.value })
  }

  // Function to redirect to the evaluation form page
  const handleEvaluate = (projectId: string) => {
    router.push(`/evaluation-form/${projectId}`)
  }

  // Function to store project data in Firestore
  const handleCreateProject = async () => {
    if (user?.role === "admin") {
      try {
        if (!auth.currentUser) {
          throw new Error("User not authenticated")
        }

        await addDoc(collection(db, "projects"), {
          ...projectData,
          createdBy: user.uid,
          createdAt: new Date(),
        })
        alert("Project created successfully!")
        setProjectData({ projectName: "", projectDescription: "" }) // Reset form
      } catch (error: any) {
        console.error("Error creating project:", error)
        if (error.code === "permission-denied") {
          alert("You don't have permission to create projects. Please contact your administrator.")
        } else {
          alert("Failed to create project. Please try again.")
        }
      }
    } else {
      alert("You don't have permission to create a project.")
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (user?.role === "admin") {
      // Show confirmation dialog
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone.",
      )

      if (confirmDelete) {
        try {
          if (!auth.currentUser) {
            throw new Error("User not authenticated")
          }

          // Delete the project from Firestore
          await deleteDoc(doc(db, "projects", projectId))

          // Update the UI by removing the deleted project
          setAssignedProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId))

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
    } else {
      alert("You don't have permission to delete projects.")
    }
  }

  // Fetch projects based on user role
  useEffect(() => {
    if (!user?.uid || !auth.currentUser) {
      setLoading(false)
      return
    }

    const fetchProjects = async () => {
      setLoading(true)
      setError(null)
      try {
        let projects: Project[] = []

        if (user.role === "admin") {
          // Admin sees all projects - use a direct approach
          try {
            const projectsCollection = collection(db, "projects")
            const projectsSnapshot = await getDocs(projectsCollection)
            projects = projectsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              userRole: "admin",
            })) as Project[]
          } catch (adminError: any) {
            console.error("Error fetching projects as admin:", adminError)
            setError(`Error loading projects: ${adminError.message}`)
            return
          }
        } else {
          // For regular users, fetch projects individually by ID
          // First, get the user document to find assigned project IDs
          try {
            console.log("Fetching projects for regular user:", user.uid)
            const userDoc = await getDoc(doc(db, "users", user.uid))

            if (!userDoc.exists()) {
              console.log("User document not found")
              setAssignedProjects([])
              setLoading(false)
              return
            }

            const userData = userDoc.data()
            console.log("User data:", userData)
            const assignedProjectIds = userData.assignedProjects || []
            console.log("Assigned project IDs:", assignedProjectIds)

            // If user has assigned projects, fetch each one individually
            if (assignedProjectIds.length > 0) {
              const projectPromises = assignedProjectIds.map(async (projectId: string) => {
                try {
                  console.log("Fetching project:", projectId)
                  const projectDoc = await getDoc(doc(db, "projects", projectId))
                  if (projectDoc.exists()) {
                    const projectData = projectDoc.data()
                    console.log("Project data found:", projectData.projectName)

                    // Find user's role in this project
                    let userRole = ""
                    let status: "pending" | "in_progress" | "completed" = "pending"

                    const evaluators = projectData.evaluators || {}
                    const evaluations = projectData.evaluations || {}

                    Object.entries(evaluators).forEach(([role, evaluator]) => {
                      if (evaluator && evaluator.uid === user.uid) {
                        userRole = role
                        // Get status from evaluations if available
                        if (evaluations[role]) {
                          status = evaluations[role].status || "pending"
                        }
                      }
                    })

                    return {
                      id: projectDoc.id,
                      ...projectData,
                      userRole,
                      status,
                    }
                  }
                  console.log("Project not found:", projectId)
                  return null
                } catch (error) {
                  console.error(`Error fetching project ${projectId}:`, error)
                  return null
                }
              })

              const fetchedProjects = await Promise.all(projectPromises)
              projects = fetchedProjects.filter(Boolean) as Project[]
              console.log("Fetched projects:", projects.length)
            } else {
              console.log("User has no assigned projects")
            }
          } catch (userDocError: any) {
            console.error("Error fetching user document:", userDocError)
            setError(`Error loading user data: ${userDocError.message}`)
            return
          }
        }

        setAssignedProjects(projects)
      } catch (error: any) {
        console.error("Error fetching projects:", error)
        if (error.code === "permission-denied") {
          setError(t("permissionError"))
        } else {
          setError(`${t("error")}: ${error.message}`)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user, t])

  // Safe way to copy link to clipboard
  const handleCopyLink = (projectId: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/evaluation-form/${projectId}`
      navigator.clipboard.writeText(url)
      alert("Evaluation link copied to clipboard!")
    }
  }

  // Get status icon based on project status
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

  // Filter projects based on status
  const filteredProjects = assignedProjects.filter((project) => {
    if (statusFilter === "all") return true
    return project.status === statusFilter
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Admin Dashboard Button - Repositioned at the top */}
      {user?.role === "admin" && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{t("adminTools")}</h2>
              <p className="text-gray-600">{t("adminToolsDesc")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => router.push("/admin-dashboard")}
              >
                <ClipboardCheck className="h-5 w-5" />
                <span>{t("adminDashboard")}</span>
              </button>
              <button
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                onClick={() => router.push("/results-dashboard")}
              >
                <CheckCircle className="h-5 w-5" />
                <span>{t("resultsDashboard")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <main>
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t("welcome")}</h2>
          {user?.role === "admin" ? (
            <p className="text-gray-600">{t("adminWelcome")}</p>
          ) : (
            <p className="text-gray-600">{t("userWelcome")}</p>
          )}
        </div>

        {/* Display assigned projects */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {user?.role === "admin" ? t("allProjects") : t("yourAssignedProjects")}
            </h3>

            {/* Status filter */}
            {assignedProjects.length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="status-filter" className="text-sm text-gray-600">
                  {t("filterByStatus")}
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t("all")}</option>
                  <option value="pending">{t("pending")}</option>
                  <option value="in_progress">{t("inProgress")}</option>
                  <option value="completed">{t("completed")}</option>
                </select>
              </div>
            )}
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-start mb-4">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p>{error}</p>
                {error.includes("permission") && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
                    <h4 className="font-medium text-blue-800 mb-2">{t("howToAccess")}</h4>
                    <p className="text-sm text-blue-700">{t("accessWays")}</p>
                  </div>
                )}
              </div>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-medium text-gray-800 mb-2">{project.projectName}</h4>
                      <div className="flex items-center">
                        {getStatusIcon(project.status)}
                        <span
                          className={`ml-1 text-xs px-2 py-1 rounded-full ${
                            project.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : project.status === "in_progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {t(project.status || "pending")}
                        </span>
                      </div>
                    </div>

                    {project.projectDescription && (
                      <p className="text-sm text-gray-600 mb-3">{project.projectDescription}</p>
                    )}

                    {project.userRole && (
                      <p className="text-xs text-gray-500 mb-4">
                        {t("yourRole")} <span className="font-medium">{project.userRole}</span>
                      </p>
                    )}

                    <div className="flex justify-between items-center">
                      {/* For non-admin users who are evaluators */}
                      {user?.role !== "admin" && (
                        <button
                          onClick={() => router.push(`/evaluation-form/${project.id}`)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          {project.status === "completed" ? t("viewSubmission") : t("continueEvaluation")}
                        </button>
                      )}

                      {/* For admin users */}
                      {user?.role === "admin" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopyLink(project.id)}
                            className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-2 rounded-md hover:bg-green-100 transition-colors text-sm"
                          >
                            <span>{t("copyLink")}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-2 rounded-md hover:bg-red-100 transition-colors text-sm"
                            title="Delete project"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>{t("delete")}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-6">
              <div className="text-center mb-4">
                <p className="text-gray-500">
                  {statusFilter === "all"
                    ? user?.role === "admin"
                      ? t("noProjectsAdmin")
                      : t("noProjectsUser")
                    : t("noFilteredProjects", { status: t(statusFilter) })}
                </p>
              </div>

              {user?.role !== "admin" && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-md">
                  <h4 className="font-medium text-blue-800 mb-2">{t("howToAccess")}</h4>
                  <div className="space-y-3 text-sm text-blue-700">
                    <p>{t("accessWays")}</p>
                    <ol className="list-decimal list-inside space-y-2 ml-2">
                      <li>
                        <strong>{t("directLinks")}</strong>
                      </li>
                      <li>
                        <strong>{t("dashboardAccess")}</strong>
                      </li>
                    </ol>
                    <p className="mt-3 pt-3 border-t border-blue-200">{t("contactAdmin")}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {assignedProjects.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
              <h4 className="font-medium text-blue-800 mb-2">{t("statusLegend")}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{t("pendingDesc")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-700">{t("inProgressDesc")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">{t("completedDesc")}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Project creation form for admins */}
        {user?.role === "admin" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("createNewProject")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <input
                  type="text"
                  name="projectName"
                  value={projectData.projectName}
                  onChange={handleInputChange}
                  placeholder={t("projectName")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <textarea
                  name="projectDescription"
                  value={projectData.projectDescription}
                  onChange={handleInputChange}
                  placeholder={t("projectDescription")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={1}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCreateProject}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="h-5 w-5" />
                <span>{t("createProject")}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
