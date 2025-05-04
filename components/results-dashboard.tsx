"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase-config"
import { collection, getDocs } from "firebase/firestore"
import {
  BarChart,
  PieChart,
  ArrowLeft,
  Filter,
  Download,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"
import Chart from "chart.js/auto"

interface Project {
  id: string
  projectName: string
  projectDescription: string
  evaluationTable: Array<{
    section: string
    weight: number
    criteria: Array<{
      description: string
      maxRating: number
      rating: number
      justification?: string
    }>
  }>
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
      ratings?: Record<string, number>
      justifications?: Record<string, string>
      lastUpdated?: any
      submittedAt?: any
    }
  >
}

interface ResultsDashboardProps {
  user: {
    uid?: string
    email?: string
    role?: string
  } | null
}

export default function ResultsDashboard({ user }: ResultsDashboardProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Chart references
  const overallScoreChartRef = useRef<HTMLCanvasElement | null>(null)
  const overallScoreChartInstance = useRef<Chart | null>(null)
  const sectionScoresChartRef = useRef<HTMLCanvasElement | null>(null)
  const sectionScoresChartInstance = useRef<Chart | null>(null)
  const evaluatorComparisonChartRef = useRef<HTMLCanvasElement | null>(null)
  const evaluatorComparisonChartInstance = useRef<Chart | null>(null)
  const completionStatusChartRef = useRef<HTMLCanvasElement | null>(null)
  const completionStatusChartInstance = useRef<Chart | null>(null)

  // Fetch projects from Firestore
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)

        const projectsCollection = collection(db, "projects")
        const projectsSnapshot = await getDocs(projectsCollection)

        const projectsList = projectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[]

        setProjects(projectsList)

        // If there are projects, select the first one by default
        if (projectsList.length > 0) {
          setSelectedProject(projectsList[0])
        }
      } catch (error: any) {
        console.error("Error fetching projects:", error)
        setError(`Error loading projects: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === "admin") {
      fetchProjects()
    }
  }, [user])

  // Create and update charts when selected project changes
  useEffect(() => {
    if (selectedProject) {
      // Clean up previous chart instances
      if (overallScoreChartInstance.current) {
        overallScoreChartInstance.current.destroy()
      }
      if (sectionScoresChartInstance.current) {
        sectionScoresChartInstance.current.destroy()
      }
      if (evaluatorComparisonChartInstance.current) {
        evaluatorComparisonChartInstance.current.destroy()
      }
      if (completionStatusChartInstance.current) {
        completionStatusChartInstance.current.destroy()
      }

      // Create new charts
      createOverallScoreChart()
      createSectionScoresChart()
      createEvaluatorComparisonChart()
      createCompletionStatusChart()
    }
  }, [selectedProject])

  // Calculate overall score for the selected project
  const calculateOverallScore = () => {
    if (!selectedProject || !selectedProject.evaluationTable) return 0

    let totalWeightedScore = 0
    let totalWeight = 0

    selectedProject.evaluationTable.forEach((section) => {
      const sectionWeight = section.weight
      let sectionScore = 0
      let totalMaxRating = 0

      section.criteria.forEach((criterion) => {
        sectionScore += criterion.rating
        totalMaxRating += criterion.maxRating
      })

      // Calculate section score as a percentage
      const sectionScorePercentage = totalMaxRating > 0 ? sectionScore / totalMaxRating : 0
      totalWeightedScore += sectionScorePercentage * sectionWeight
      totalWeight += sectionWeight
    })

    // Return overall score as a percentage
    return totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0
  }

  // Calculate section scores for the selected project
  const calculateSectionScores = () => {
    if (!selectedProject || !selectedProject.evaluationTable) return []

    return selectedProject.evaluationTable.map((section) => {
      let sectionScore = 0
      let totalMaxRating = 0

      section.criteria.forEach((criterion) => {
        sectionScore += criterion.rating
        totalMaxRating += criterion.maxRating
      })

      // Calculate section score as a percentage
      const scorePercentage = totalMaxRating > 0 ? (sectionScore / totalMaxRating) * 100 : 0

      return {
        section: section.section,
        score: scorePercentage,
        weight: section.weight,
      }
    })
  }

  // Calculate evaluator comparison data
  const calculateEvaluatorComparison = () => {
    if (!selectedProject || !selectedProject.evaluations) return []

    const evaluatorScores: Record<string, number> = {}
    const evaluatorData: Array<{ role: string; score: number; status: string }> = []

    // Calculate score for each evaluator
    Object.entries(selectedProject.evaluations).forEach(([role, evaluation]) => {
      if (evaluation.ratings) {
        let totalScore = 0
        let totalMaxScore = 0

        // Map ratings back to criteria
        selectedProject.evaluationTable.forEach((section, sectionIndex) => {
          section.criteria.forEach((criterion, criterionIndex) => {
            const ratingKey = `${sectionIndex}-${criterionIndex}`
            if (evaluation.ratings && evaluation.ratings[ratingKey] !== undefined) {
              totalScore += evaluation.ratings[ratingKey]
              totalMaxScore += criterion.maxRating
            }
          })
        })

        const scorePercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0
        evaluatorScores[role] = scorePercentage

        evaluatorData.push({
          role,
          score: scorePercentage,
          status: evaluation.status,
        })
      } else {
        evaluatorData.push({
          role,
          score: 0,
          status: evaluation.status,
        })
      }
    })

    return evaluatorData
  }

  // Calculate completion status data
  const calculateCompletionStatus = () => {
    if (!selectedProject || !selectedProject.evaluations) {
      return { completed: 0, inProgress: 0, pending: 0, total: 0 }
    }

    const evaluations = selectedProject.evaluations
    let completed = 0
    let inProgress = 0
    let pending = 0

    Object.values(evaluations).forEach((evaluation) => {
      if (evaluation.status === "completed") {
        completed++
      } else if (evaluation.status === "in_progress") {
        inProgress++
      } else {
        pending++
      }
    })

    const total = completed + inProgress + pending

    return {
      completed,
      inProgress,
      pending,
      total,
    }
  }

  // Create overall score chart
  const createOverallScoreChart = () => {
    if (!overallScoreChartRef.current) return

    const ctx = overallScoreChartRef.current.getContext("2d")
    if (!ctx) return

    const overallScore = calculateOverallScore()

    overallScoreChartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Score", "Remaining"],
        datasets: [
          {
            data: [overallScore, 100 - overallScore],
            backgroundColor: ["rgba(54, 162, 235, 0.8)", "rgba(220, 220, 220, 0.3)"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => `Score: ${context.raw}%`,
            },
          },
        },
      },
    })
  }

  // Create section scores chart
  const createSectionScoresChart = () => {
    if (!sectionScoresChartRef.current) return

    const ctx = sectionScoresChartRef.current.getContext("2d")
    if (!ctx) return

    const sectionScores = calculateSectionScores()

    sectionScoresChartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: sectionScores.map((section) => section.section),
        datasets: [
          {
            label: "Section Score (%)",
            data: sectionScores.map((section) => section.score),
            backgroundColor: "rgba(54, 162, 235, 0.8)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: "Score (%)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Sections",
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              afterLabel: (context) => {
                const index = context.dataIndex
                return `Weight: ${(sectionScores[index].weight * 100).toFixed(1)}%`
              },
            },
          },
        },
      },
    })
  }

  // Create evaluator comparison chart
  const createEvaluatorComparisonChart = () => {
    if (!evaluatorComparisonChartRef.current) return

    const ctx = evaluatorComparisonChartRef.current.getContext("2d")
    if (!ctx) return

    const evaluatorData = calculateEvaluatorComparison()

    evaluatorComparisonChartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: evaluatorData.map((data) => data.role),
        datasets: [
          {
            label: "Evaluator Score (%)",
            data: evaluatorData.map((data) => data.score),
            backgroundColor: evaluatorData.map((data) => {
              if (data.status === "completed") return "rgba(72, 187, 120, 0.8)"
              if (data.status === "in_progress") return "rgba(237, 137, 54, 0.8)"
              return "rgba(160, 174, 192, 0.8)"
            }),
            borderColor: evaluatorData.map((data) => {
              if (data.status === "completed") return "rgba(72, 187, 120, 1)"
              if (data.status === "in_progress") return "rgba(237, 137, 54, 1)"
              return "rgba(160, 174, 192, 1)"
            }),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: "Score (%)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Evaluators",
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              afterLabel: (context) => {
                const index = context.dataIndex
                return `Status: ${evaluatorData[index].status.replace("_", " ")}`
              },
            },
          },
        },
      },
    })
  }

  // Create completion status chart
  const createCompletionStatusChart = () => {
    if (!completionStatusChartRef.current) return

    const ctx = completionStatusChartRef.current.getContext("2d")
    if (!ctx) return

    const statusData = calculateCompletionStatus()

    completionStatusChartInstance.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Completed", "In Progress", "Pending"],
        datasets: [
          {
            data: [statusData.completed, statusData.inProgress, statusData.pending],
            backgroundColor: ["rgba(72, 187, 120, 0.8)", "rgba(237, 137, 54, 0.8)", "rgba(160, 174, 192, 0.8)"],
            borderColor: ["rgba(72, 187, 120, 1)", "rgba(237, 137, 54, 1)", "rgba(160, 174, 192, 1)"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    })
  }

  // Export results as CSV
  const exportResults = () => {
    if (!selectedProject) return

    // Prepare data for CSV
    const rows = [
      ["Project Name", selectedProject.projectName],
      ["Project Description", selectedProject.projectDescription],
      ["Overall Score", `${calculateOverallScore().toFixed(2)}%`],
      [],
      ["Section", "Weight", "Score (%)"],
    ]

    // Add section scores
    const sectionScores = calculateSectionScores()
    sectionScores.forEach((section) => {
      rows.push([section.section, (section.weight * 100).toFixed(1) + "%", section.score.toFixed(2) + "%"])
    })

    // Add evaluator data
    rows.push([])
    rows.push(["Evaluator", "Score (%)", "Status"])

    const evaluatorData = calculateEvaluatorComparison()
    evaluatorData.forEach((data) => {
      rows.push([data.role, data.score.toFixed(2) + "%", data.status.replace("_", " ")])
    })

    // Convert to CSV
    const csvContent = rows.map((row) => row.join(",")).join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${selectedProject.projectName}_results.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle project selection
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value
    const project = projects.find((p) => p.id === projectId) || null
    setSelectedProject(project)
  }

  // Filter projects by status
  const filteredProjects = projects.filter((project) => {
    if (statusFilter === "all") return true

    if (!project.evaluations) return false

    // Check if any evaluator has the selected status
    return Object.values(project.evaluations).some((evaluation) => evaluation.status === statusFilter)
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <button
            onClick={() => router.push("/admin-dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Evaluation Results Dashboard</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Filter className="h-4 w-4 mr-2" />
            <span>Filters</span>
            <ChevronDown className={`h-4 w-4 ml-2 transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          <button
            onClick={exportResults}
            disabled={!selectedProject}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
          >
            <Download className="h-4 w-4 mr-2" />
            <span>Export Results</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No projects found matching the selected filters.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <label htmlFor="project-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Project
            </label>
            <select
              id="project-select"
              value={selectedProject?.id || ""}
              onChange={handleProjectChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {filteredProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.projectName}
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <BarChart className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-800">Overall Score</h3>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="relative h-48 w-48">
                      <canvas ref={overallScoreChartRef}></canvas>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-gray-800">{calculateOverallScore().toFixed(1)}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">Overall weighted score across all sections</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <PieChart className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-800">Completion Status</h3>
                  </div>
                  <div className="h-48">
                    <canvas ref={completionStatusChartRef}></canvas>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <BarChart className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-800">Section Scores</h3>
                  </div>
                  <div className="h-64">
                    <canvas ref={sectionScoresChartRef}></canvas>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <BarChart className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-800">Evaluator Comparison</h3>
                  </div>
                  <div className="h-64">
                    <canvas ref={evaluatorComparisonChartRef}></canvas>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Detailed Evaluation Results</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Section</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Criteria</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b w-24">
                          Max Rating
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b w-24">
                          Avg. Rating
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b w-24">Score %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProject.evaluationTable?.map((section, sectionIndex) => (
                        <React.Fragment key={sectionIndex}>
                          <tr className="bg-gray-100">
                            <td colSpan={5} className="px-4 py-2 font-medium text-gray-700">
                              {section.section} (Weight: {(section.weight * 100).toFixed(1)}%)
                            </td>
                          </tr>
                          {section.criteria.map((criterion, criterionIndex) => {
                            // Calculate average rating from all evaluators
                            let totalRating = criterion.rating
                            let evaluatorCount = 1

                            if (selectedProject.evaluations) {
                              Object.values(selectedProject.evaluations).forEach((evaluation) => {
                                if (
                                  evaluation.ratings &&
                                  evaluation.ratings[`${sectionIndex}-${criterionIndex}`] !== undefined
                                ) {
                                  totalRating += evaluation.ratings[`${sectionIndex}-${criterionIndex}`]
                                  evaluatorCount++
                                }
                              })
                            }

                            const avgRating = evaluatorCount > 0 ? totalRating / evaluatorCount : 0
                            const scorePercentage =
                              criterion.maxRating > 0 ? (avgRating / criterion.maxRating) * 100 : 0

                            return (
                              <tr key={criterionIndex} className="hover:bg-gray-50">
                                <td className="px-4 py-3 border-b text-sm"></td>
                                <td className="px-4 py-3 border-b text-sm">{criterion.description}</td>
                                <td className="px-4 py-3 border-b text-sm text-center">{criterion.maxRating}</td>
                                <td className="px-4 py-3 border-b text-sm text-center">{avgRating.toFixed(1)}</td>
                                <td className="px-4 py-3 border-b text-sm text-center">
                                  <div className="flex items-center justify-center">
                                    <span>{scorePercentage.toFixed(1)}%</span>
                                    <div className="ml-2 h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-blue-500"
                                        style={{ width: `${scorePercentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <div className="flex items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Evaluator Status</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Role</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Last Updated</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProject.evaluators &&
                        Object.entries(selectedProject.evaluators).map(([role, evaluator]) => {
                          const evaluation = selectedProject.evaluations?.[role]
                          const status = evaluation?.status || "pending"

                          return (
                            <tr key={role} className="hover:bg-gray-50">
                              <td className="px-4 py-3 border-b text-sm font-medium">{role}</td>
                              <td className="px-4 py-3 border-b text-sm">{evaluator.email}</td>
                              <td className="px-4 py-3 border-b text-sm">
                                <div className="flex items-center">
                                  {status === "completed" ? (
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                  ) : status === "in_progress" ? (
                                    <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-gray-400 mr-1" />
                                  )}
                                  <span
                                    className={`
                                  ${status === "completed" ? "text-green-600" : ""}
                                  ${status === "in_progress" ? "text-yellow-600" : ""}
                                  ${status === "pending" ? "text-gray-600" : ""}
                                `}
                                  >
                                    {status.replace("_", " ")}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 border-b text-sm">
                                {evaluation?.lastUpdated
                                  ? new Date(evaluation.lastUpdated.toDate()).toLocaleString()
                                  : "N/A"}
                              </td>
                              <td className="px-4 py-3 border-b text-sm">
                                {evaluation?.submittedAt
                                  ? new Date(evaluation.submittedAt.toDate()).toLocaleString()
                                  : "N/A"}
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
