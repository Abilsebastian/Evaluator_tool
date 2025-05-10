"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { ArrowLeft, Download, FileText, AlertCircle, CheckCircle, Users } from "lucide-react"

interface Criterion {
  description: string
  maxRating: number
  rating: number
  justification?: string
}

interface Section {
  section: string
  weight: number
  criteria: Criterion[]
}

interface ProjectData {
  projectName: string
  projectDescription: string
  evaluationTable: Section[]
  evaluators: Record<string, any>
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

export default function ResultsDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId")

  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [projectLoading, setProjectLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aggregatedResults, setAggregatedResults] = useState<any[]>([])
  const [sectionScores, setSectionScores] = useState<any[]>([])
  const [evaluatorComparison, setEvaluatorComparison] = useState<any[]>([])
  const [overallScore, setOverallScore] = useState<number>(0)
  const [completedEvaluations, setCompletedEvaluations] = useState<number>(0)
  const [totalEvaluators, setTotalEvaluators] = useState<number>(0)
  const [completedProjects, setCompletedProjects] = useState<any[]>([])
  const [sortField, setSortField] = useState<"name" | "date" | "score">("score")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [projectScores, setProjectScores] = useState<Record<string, number>>({})
  const [projectsLoading, setProjectsLoading] = useState(true)

  useEffect(() => {
    async function fetchProjectData() {
      if (!projectId) {
        return
      }

      setProjectLoading(true)
      try {
        const projectRef = doc(db, "projects", projectId)
        const projectSnap = await getDoc(projectRef)

        if (!projectSnap.exists()) {
          setError("Project not found")
          setProjectLoading(false)
          return
        }

        const data = projectSnap.data() as ProjectData
        setProjectData(data)

        // Count evaluators and completed evaluations
        const evaluators = data.evaluators || {}
        const evaluations = data.evaluations || {}

        setTotalEvaluators(Object.keys(evaluators).length)
        setCompletedEvaluations(
          Object.values(evaluations).filter((evaluation) => evaluation.status === "completed").length,
        )

        // Only process results if we have 3 completed evaluations
        const completedEvals = Object.entries(evaluations).filter(
          ([_, evaluation]) => evaluation.status === "completed",
        )

        if (completedEvals.length >= 3) {
          processResults(data, completedEvals)
        } else {
          setError("This project doesn't have all 3 evaluations completed yet")
        }
      } catch (err: any) {
        console.error("Error fetching project:", err)
        setError(`Failed to load project: ${err.message}`)
      } finally {
        setProjectLoading(false)
      }
    }

    function processResults(data: ProjectData, completedEvaluations: [string, any][]) {
      // Process aggregated results
      const evaluationTable = data.evaluationTable || []
      let totalWeightedScore = 0
      let totalWeight = 0

      // Process section scores
      const sectionScoresData = evaluationTable.map((section) => {
        const criteriaCount = section.criteria.length
        let sectionTotal = 0
        let sectionMax = 0

        section.criteria.forEach((criterion) => {
          sectionTotal += criterion.rating || 0
          sectionMax += criterion.maxRating || 0
        })

        const sectionScore = sectionMax > 0 ? (sectionTotal / sectionMax) * 100 : 0
        const weightedScore = sectionScore * section.weight

        totalWeightedScore += weightedScore
        totalWeight += section.weight

        return {
          name: section.section,
          score: Math.round(sectionScore),
          weight: Math.round(section.weight * 100),
          weightedScore: Math.round(weightedScore),
        }
      })

      setSectionScores(sectionScoresData)

      // Calculate overall score
      const finalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0
      setOverallScore(Math.round(finalScore))

      // Process criteria scores for bar chart
      const aggregatedData = evaluationTable.flatMap((section) =>
        section.criteria.map((criterion) => {
          const maxScore = criterion.maxRating || 0
          const actualScore = criterion.rating || 0
          const percentage = maxScore > 0 ? (actualScore / maxScore) * 100 : 0

          return {
            name:
              criterion.description.length > 30
                ? criterion.description.substring(0, 30) + "..."
                : criterion.description,
            fullName: criterion.description,
            score: Math.round(percentage),
            actual: actualScore,
            max: maxScore,
            section: section.section,
          }
        }),
      )

      setAggregatedResults(aggregatedData)

      // Process evaluator comparison data
      const evaluatorData: Record<string, Record<string, number>> = {}

      // Initialize evaluator data structure
      completedEvaluations.forEach(([role]) => {
        evaluatorData[role] = {}
      })

      // Fill in scores by section for each evaluator
      evaluationTable.forEach((section, sectionIndex) => {
        completedEvaluations.forEach(([role, evaluation]) => {
          const ratings = evaluation.ratings || {}
          let sectionTotal = 0
          let sectionMax = 0

          section.criteria.forEach((criterion, criterionIndex) => {
            const key = `${sectionIndex}-${criterionIndex}`
            const rating = ratings[key] || 0
            sectionTotal += rating
            sectionMax += criterion.maxRating || 0
          })

          const sectionScore = sectionMax > 0 ? (sectionTotal / sectionMax) * 100 : 0
          evaluatorData[role][section.section] = Math.round(sectionScore)
        })
      })

      // Transform data for radar chart
      const comparisonData = sectionScoresData.map((section) => {
        const result: Record<string, any> = {
          section: section.name,
        }

        Object.entries(evaluatorData).forEach(([role, scores]) => {
          result[role] = scores[section.name] || 0
        })

        return result
      })

      setEvaluatorComparison(comparisonData)
    }

    fetchProjectData()
  }, [projectId])

  async function calculateProjectScores(projects: any[]) {
    const scores: Record<string, number> = {}

    for (const project of projects) {
      if (!project.evaluationTable) continue

      let totalWeightedScore = 0
      let totalWeight = 0

      // Calculate overall score using the same logic as for individual projects
      project.evaluationTable.forEach((section: any) => {
        let sectionTotal = 0
        let sectionMax = 0

        section.criteria.forEach((criterion: any) => {
          sectionTotal += criterion.rating || 0
          sectionMax += criterion.maxRating || 0
        })

        const sectionScore = sectionMax > 0 ? (sectionTotal / sectionMax) * 100 : 0
        const weightedScore = sectionScore * section.weight

        totalWeightedScore += weightedScore
        totalWeight += section.weight
      })

      const finalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0
      scores[project.id] = Math.round(finalScore)
    }

    return scores
  }

  function sortProjects(
    projects: any[],
    field: "name" | "date" | "score",
    direction: "asc" | "desc",
    scores: Record<string, number> = {},
  ) {
    const sortedProjects = [...projects]

    sortedProjects.sort((a, b) => {
      let comparison = 0

      if (field === "name") {
        comparison = a.projectName.localeCompare(b.projectName)
      } else if (field === "date") {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0)
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0)
        comparison = dateB.getTime() - dateA.getTime()
      } else if (field === "score") {
        const scoreA = scores[a.id] || 0
        const scoreB = scores[b.id] || 0
        comparison = scoreB - scoreA
      }

      return direction === "asc" ? comparison * -1 : comparison
    })

    setCompletedProjects(sortedProjects)
  }

  const handleSortChange = (field: "name" | "date" | "score") => {
    // If clicking the same field, toggle direction
    const newDirection = field === sortField && sortDirection === "desc" ? "asc" : "desc"
    setSortField(field)
    setSortDirection(newDirection)
    sortProjects(completedProjects, field, newDirection, projectScores)
  }

  useEffect(() => {
    async function fetchCompletedProjects() {
      setProjectsLoading(true)
      try {
        const projectsRef = collection(db, "projects")
        const projectsSnapshot = await getDocs(projectsRef)

        const projects = projectsSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((project) => {
            // Check if project has 3 completed evaluations
            const evaluations = project.evaluations || {}
            const completedEvaluations = Object.values(evaluations).filter(
              (evaluation: any) => evaluation.status === "completed",
            ).length
            return completedEvaluations >= 3
          })

        // Calculate scores for all projects
        const scores = await calculateProjectScores(projects)
        setProjectScores(scores)

        // Apply initial sorting
        sortProjects(projects, sortField, sortDirection, scores)
      } catch (err: any) {
        console.error("Error fetching completed projects:", err)
      } finally {
        setProjectsLoading(false)
        setLoading(false)
      }
    }

    fetchCompletedProjects()
  }, [])

  const handleSelectProject = (projectId: string) => {
    router.push(`/results-dashboard?projectId=${projectId}`)
  }

  const handleExportPDF = () => {
    // Implement PDF export functionality
    alert("PDF export functionality would be implemented here")
  }

  const handleExportCSV = () => {
    // Implement CSV export functionality
    alert("CSV export functionality would be implemented here")
  }

  // Show loading state while fetching projects
  if (loading) {
    return (
      <div className="container py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Project List Section */}
      {!projectId && (
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Completed Project Results</h1>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <div className="flex border rounded-md overflow-hidden">
                <button
                  className={`px-3 py-1.5 text-sm ${
                    sortField === "name" ? "bg-primary text-white" : "bg-background hover:bg-muted"
                  }`}
                  onClick={() => handleSortChange("name")}
                >
                  Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                </button>
                <button
                  className={`px-3 py-1.5 text-sm border-l ${
                    sortField === "date" ? "bg-primary text-white" : "bg-background hover:bg-muted"
                  }`}
                  onClick={() => handleSortChange("date")}
                >
                  Date {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
                </button>
                <button
                  className={`px-3 py-1.5 text-sm border-l ${
                    sortField === "score" ? "bg-primary text-white" : "bg-background hover:bg-muted"
                  }`}
                  onClick={() => handleSortChange("score")}
                >
                  Score {sortField === "score" && (sortDirection === "asc" ? "↑" : "↓")}
                </button>
              </div>
            </div>
          </div>

          {projectsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : completedProjects.length > 0 ? (
            <div className="card overflow-hidden">
              <div className="p-4 md:p-6 border-b border-border">
                <h2 className="text-xl font-semibold">Select a project to view detailed results</h2>
              </div>
              <div className="divide-y divide-border">
                {completedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 md:p-6 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleSelectProject(project.id)}
                  >
                    <div className="flex items-start">
                      <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-4">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <h3 className="text-lg font-medium">{project.projectName}</h3>
                          {projectScores[project.id] !== undefined && (
                            <div
                              className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                                projectScores[project.id] >= 80
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                                  : projectScores[project.id] >= 60
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                              }`}
                            >
                              Score: {projectScores[project.id]}%
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.projectDescription?.substring(0, 100)}
                          {project.projectDescription?.length > 100 ? "..." : ""}
                        </p>
                        <div className="flex items-center mt-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4 mr-1" />
                          <span>
                            {
                              Object.values(project.evaluations || {}).filter(
                                (evaluation: any) => evaluation.status === "completed",
                              ).length
                            }{" "}
                            evaluations
                          </span>
                          <span className="mx-2">•</span>
                          <span>
                            Created:{" "}
                            {project.createdAt?.toDate?.()
                              ? new Date(project.createdAt.toDate()).toLocaleDateString()
                              : new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="text-muted-foreground">No completed projects found.</p>
            </div>
          )}
        </div>
      )}

      {/* Existing Project Detail Content - only show if projectId is provided */}
      {projectId && (
        <>
          {projectLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{error}</p>
                {completedEvaluations < 3 && (
                  <p className="mt-2">
                    This project has {completedEvaluations} of 3 required evaluations completed. Results will be
                    available when all evaluations are submitted.
                  </p>
                )}
              </div>
            </div>
          ) : projectData ? (
            <>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                  <button
                    onClick={() => {
                      router.push("/results-dashboard", undefined, { shallow: false })
                    }}
                    className="group flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 hover:bg-muted active:bg-muted/80 transition-colors duration-200 mb-4"
                    aria-label="Back to all results"
                  >
                    <ArrowLeft className="h-4 w-4 text-primary group-hover:translate-x-[-2px] transition-transform duration-200" />
                    <span className="font-medium">Back to All Results</span>
                  </button>
                  <h1 className="text-2xl md:text-3xl font-bold">{projectData.projectName}</h1>
                  <p className="text-muted-foreground mt-1">{projectData.projectDescription}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button onClick={handleExportPDF} className="btn btn-outline btn-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Export PDF</span>
                  </button>
                  <button onClick={handleExportCSV} className="btn btn-outline btn-sm flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Status and summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                      <h3 className="text-3xl font-bold mt-1">{overallScore}%</h3>
                    </div>
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        overallScore >= 80
                          ? "bg-green-100 dark:bg-green-900/20"
                          : overallScore >= 60
                            ? "bg-amber-100 dark:bg-amber-900/20"
                            : "bg-red-100 dark:bg-red-900/20"
                      }`}
                    >
                      <span
                        className={`text-lg font-bold ${
                          overallScore >= 80 ? "text-green-500" : overallScore >= 60 ? "text-amber-500" : "text-red-500"
                        }`}
                      >
                        {overallScore >= 80
                          ? "A"
                          : overallScore >= 70
                            ? "B"
                            : overallScore >= 60
                              ? "C"
                              : overallScore >= 50
                                ? "D"
                                : "F"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Evaluation Status</p>
                      <div className="flex items-center mt-1">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <h3 className="text-xl font-bold">Complete</h3>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Evaluators</p>
                      <div className="flex items-center mt-1">
                        <h3 className="text-xl font-bold">{completedEvaluations}/3 Completed</h3>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section scores */}
              <div className="card p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Section Scores</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectionScores} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip
                        formatter={(value, name) => [`${value}%`, name === "score" ? "Score" : "Weight"]}
                        labelFormatter={(label) => `Section: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="score" name="Score (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="weight" name="Weight (%)" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Evaluator comparison */}
              <div className="card p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Evaluator Comparison</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} data={evaluatorComparison}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="section" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      {Object.keys(projectData.evaluators || {})
                        .slice(0, 3)
                        .map((role, index) => (
                          <Radar
                            key={role}
                            name={role}
                            dataKey={role}
                            stroke={index === 0 ? "#3b82f6" : index === 1 ? "#10b981" : "#f59e0b"}
                            fill={index === 0 ? "#3b82f6" : index === 1 ? "#10b981" : "#f59e0b"}
                            fillOpacity={0.3}
                          />
                        ))}
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed criteria scores */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Detailed Criteria Scores</h2>
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={aggregatedResults}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Score"]}
                        labelFormatter={(label) =>
                          aggregatedResults.find((item) => item.name === label)?.fullName || label
                        }
                      />
                      <Legend />
                      <Bar dataKey="score" name="Score (%)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  )
}
