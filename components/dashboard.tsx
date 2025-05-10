"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase-config"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import {
  ClipboardList,
  CheckCircle,
  Clock,
  AlertTriangle,
  PlusCircle,
  ChevronRight,
  AlertCircle,
  Users,
} from "lucide-react"

type Project = {
  id: string
  projectName: string
  projectDescription?: string
  createdBy: string
  createdAt: any
  status: "pending" | "in_progress" | "completed"
  evaluators?: Record<string, { email: string; uid: string }>
  evaluations?: Record<
    string,
    { status: "pending" | "in_progress" | "completed"; lastUpdated?: any; submittedAt?: any }
  >
}

export default function Dashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProjects() {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        let fetchedProjects: Project[] = []

        if (user.role === "admin") {
          // Admin sees all projects
          const projectsSnapshot = await getDocs(collection(db, "projects"))
          fetchedProjects = projectsSnapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              projectName: data.projectName,
              projectDescription: data.projectDescription,
              createdBy: data.createdBy,
              createdAt: data.createdAt,
              status: getProjectStatus(data),
              evaluators: data.evaluators || {},
              evaluations: data.evaluations || {},
            }
          })
        } else {
          // Regular users see only their assigned projects
          // First get the user document to find assigned projects
          const userDoc = await getDoc(doc(db, "users", user.uid))

          if (userDoc.exists()) {
            const userData = userDoc.data()
            const assignedProjectIds = userData.assignedProjects || []

            // Fetch each assigned project
            const projectPromises = assignedProjectIds.map(async (projectId: string) => {
              try {
                const projectDoc = await getDoc(doc(db, "projects", projectId))
                if (projectDoc.exists()) {
                  const data = projectDoc.data()

                  // Find user's role in this project and their evaluation status
                  let userRole = ""
                  let status: "pending" | "in_progress" | "completed" = "pending"

                  const evaluators = data.evaluators || {}
                  const evaluations = data.evaluations || {}

                  Object.entries(evaluators).forEach(([role, evaluator]: [string, any]) => {
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
                    projectName: data.projectName,
                    projectDescription: data.projectDescription,
                    createdBy: data.createdBy,
                    createdAt: data.createdAt,
                    status: getProjectStatus(data),
                    evaluators: data.evaluators || {},
                    evaluations: data.evaluations || {},
                  }
                }
                return null
              } catch (error) {
                console.error(`Error fetching project ${projectId}:`, error)
                return null
              }
            })

            const results = await Promise.all(projectPromises)
            fetchedProjects = results.filter(Boolean) as Project[]
          }
        }

        setProjects(fetchedProjects)
      } catch (err: any) {
        console.error("Error fetching projects:", err)
        setError(`Failed to load projects: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user])

  // Helper function to determine overall project status
  function getProjectStatus(projectData: any): "pending" | "in_progress" | "completed" {
    const evaluators = projectData.evaluators || {}
    const evaluations = projectData.evaluations || {}

    // Project requires exactly 3 evaluators to be complete
    const requiredEvaluators = 3
    const totalEvaluators = Object.keys(evaluators).length

    // If we don't have enough evaluators assigned, project can't be complete
    if (totalEvaluators < requiredEvaluators) {
      return "pending"
    }

    // Count completed evaluations
    const completedEvaluations = Object.values(evaluations).filter(
      (evaluation: any) => evaluation.status === "completed",
    ).length

    // Project is complete only when all 3 evaluators have submitted
    if (completedEvaluations >= requiredEvaluators) {
      return "completed"
    } else if (completedEvaluations > 0) {
      return "in_progress"
    }

    return "pending"
  }

  // Status icon mapping
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "pending":
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />
    }
  }

  // Status text mapping
  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "in_progress":
        return "In Progress"
      case "pending":
      default:
        return "Pending"
    }
  }

  // Format date helper
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "No date"

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString()
    } catch (err) {
      console.error("Error formatting date:", err)
      return "Invalid date"
    }
  }

  // Calculate completed evaluations
  const getCompletedEvaluations = (project: Project) => {
    if (!project.evaluations) return 0

    return Object.values(project.evaluations).filter((evaluation) => evaluation.status === "completed").length
  }

  // Get total evaluators
  const getTotalEvaluators = (project: Project) => {
    if (!project.evaluators) return 0
    return Object.keys(project.evaluators).length
  }

  return (
    <div className="container py-6 px-4 sm:px-6 lg:px-8 mx-auto">
      {/* Welcome section */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Welcome{user ? `, ${user.email?.split("@")[0]}` : ""}!</h1>
        <p className="mt-2 text-muted-foreground">Here's an overview of your evaluation projects.</p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="card p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
              <h3 className="text-2xl md:text-3xl font-bold mt-1">{projects.length}</h3>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <ClipboardList className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="card p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <h3 className="text-2xl md:text-3xl font-bold mt-1">
                {projects.filter((p) => p.status === "completed").length}
              </h3>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="card p-4 md:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <h3 className="text-2xl md:text-3xl font-bold mt-1">
                {projects.filter((p) => p.status === "in_progress").length}
              </h3>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Projects list */}
      <div className="card overflow-hidden">
        <div className="p-4 md:p-6 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          {user?.role === "admin" && (
            <Link href="/create-project" className="btn btn-primary btn-sm whitespace-nowrap">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Project
            </Link>
          )}
        </div>

        {error && (
          <div className="p-4 md:p-6">
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-4 md:p-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : projects.length > 0 ? (
          <div className="divide-y divide-border">
            {projects.map((project) => (
              <div key={project.id} className="p-4 md:p-6 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start md:items-center">
                    <div className="mt-1 md:mt-0">{getStatusIcon(project.status)}</div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium">{project.projectName}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center mt-1">
                        <span className="text-sm text-muted-foreground">{getStatusText(project.status)}</span>
                        <span className="hidden sm:block mx-2 text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">Created {formatDate(project.createdAt)}</span>
                      </div>
                      {project.projectDescription && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{project.projectDescription}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                    <div className="text-left md:text-right flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {getCompletedEvaluations(project)}/3
                          <span className="text-xs text-muted-foreground ml-1">
                            ({getTotalEvaluators(project)} assigned)
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">Evaluations</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {user?.role === "admin" ? (
                        <>
                          <Link
                            href={`/results-dashboard?projectId=${project.id}`}
                            className={`btn btn-secondary btn-sm whitespace-nowrap ${
                              project.status !== "completed" ? "opacity-50 pointer-events-none" : ""
                            }`}
                          >
                            {project.status === "completed" ? "View Results" : "Awaiting Evaluations"}
                          </Link>
                          <Link
                            href={`/project-assignments?projectId=${project.id}`}
                            className="btn btn-outline btn-sm whitespace-nowrap"
                          >
                            Manage
                          </Link>
                        </>
                      ) : (
                        <Link
                          href={`/evaluation-form/${project.id}`}
                          className="btn btn-primary btn-sm whitespace-nowrap"
                        >
                          {project.status === "completed"
                            ? "View"
                            : project.status === "in_progress"
                              ? "Continue"
                              : "Start"}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 md:p-6 text-center">
            <p className="text-muted-foreground">No projects found.</p>
            {user?.role === "admin" && (
              <Link href="/create-project" className="btn btn-primary btn-sm mt-4">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create your first project
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Quick links - simplified to just one help link */}
      {user && (
        <div className="mt-6 md:mt-8">
          <div className="card overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Help & Resources</h2>
            </div>
            <div className="p-4 md:p-6">
              <Link
                href="/help"
                className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors"
              >
                <span className="font-medium">View User Manual</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
