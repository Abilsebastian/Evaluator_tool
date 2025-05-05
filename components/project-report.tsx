"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase-config"
import { doc, getDoc } from "firebase/firestore"
import { useLanguage } from "@/lib/language-context"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import {
  ArrowLeft,
  Download,
  FileText,
  BarChart,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Printer,
  Mail,
} from "lucide-react"

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
  evaluationTable: Section[]
  evaluators: Record<string, Evaluator>
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

export default function ProjectReport({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf")
  const reportRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { t, language } = useLanguage()

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        setError(null)

        const projectRef = doc(db, "projects", projectId)
        const projectSnapshot = await getDoc(projectRef)

        if (projectSnapshot.exists()) {
          const projectData = {
            id: projectSnapshot.id,
            ...projectSnapshot.data(),
          } as Project

          setProject(projectData)
        } else {
          setError(t("projectNotFound"))
        }
      } catch (err: any) {
        console.error("Error fetching project:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchProject()
    }
  }, [projectId, t])

  // Calculate overall score for the project
  const calculateOverallScore = () => {
    if (!project || !project.evaluationTable) return 0

    let totalWeightedScore = 0
    let totalWeight = 0

    project.evaluationTable.forEach((section) => {
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

  // Calculate section scores for the project
  const calculateSectionScores = () => {
    if (!project || !project.evaluationTable) return []

    return project.evaluationTable.map((section) => {
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

  // Calculate completion status
  const calculateCompletionStatus = () => {
    if (!project || !project.evaluations) {
      return { completed: 0, inProgress: 0, pending: 0, total: 0 }
    }

    const evaluations = project.evaluations
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

  // Export report as PDF
  const exportAsPDF = async () => {
    if (!reportRef.current) return

    try {
      const pdf = new jsPDF("p", "mm", "a4")
      const title = project?.projectName || "Project Report"

      // Add title
      pdf.setFontSize(20)
      pdf.text(title, 20, 20)
      pdf.setFontSize(12)

      // Add date
      const date = new Date().toLocaleDateString()
      pdf.text(`${t("generated")}: ${date}`, 20, 30)

      // Convert HTML content to canvas and add to PDF
      const canvas = await html2canvas(reportRef.current, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL("image/jpeg", 0.7)
      const imgWidth = 170
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Add image to PDF
      pdf.addImage(imgData, "JPEG", 20, 40, imgWidth, imgHeight)

      // Save the PDF
      pdf.save(`${project?.projectName || "project"}_report.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  // Export report as CSV
  const exportAsCSV = () => {
    if (!project) return

    // Prepare data for CSV
    const rows = [
      ["Project Name", project.projectName],
      ["Project Description", project.projectDescription],
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
    rows.push(["Evaluator", "Status", "Last Updated", "Submitted"])

    if (project.evaluators && project.evaluations) {
      Object.entries(project.evaluators).forEach(([role, evaluator]) => {
        const evaluation = project.evaluations?.[role]
        rows.push([
          `${role} (${evaluator.email})`,
          evaluation?.status || "pending",
          evaluation?.lastUpdated ? new Date(evaluation.lastUpdated.toDate()).toLocaleString() : "N/A",
          evaluation?.submittedAt ? new Date(evaluation.submittedAt.toDate()).toLocaleString() : "N/A",
        ])
      })
    }

    // Add criteria details
    rows.push([])
    rows.push(["Section", "Criteria", "Max Rating", "Rating", "Score %"])

    project.evaluationTable.forEach((section) => {
      section.criteria.forEach((criterion) => {
        const scorePercentage = criterion.maxRating > 0 ? (criterion.rating / criterion.maxRating) * 100 : 0
        rows.push([
          section.section,
          criterion.description,
          criterion.maxRating.toString(),
          criterion.rating.toString(),
          scorePercentage.toFixed(1) + "%",
        ])
      })
    })

    // Convert to CSV
    const csvContent = rows.map((row) => row.join(",")).join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${project.projectName}_report.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle export based on selected format
  const handleExport = () => {
    if (exportFormat === "pdf") {
      exportAsPDF()
    } else {
      exportAsCSV()
    }
  }

  // Print report
  const handlePrint = () => {
    window.print()
  }

  // Email report
  const handleEmail = () => {
    // This would typically integrate with an email service
    // For now, we'll just show an alert
    alert(t("emailFeatureNotImplemented"))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || t("errorLoadingProject")}
        </div>
        <button
          onClick={() => router.back()}
          className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("back")}</span>
        </button>
      </div>
    )
  }

  const overallScore = calculateOverallScore()
  const sectionScores = calculateSectionScores()
  const completionStatus = calculateCompletionStatus()
  const createdDate = project.createdAt ? project.createdAt.toDate().toLocaleDateString() : "N/A"

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 print:hidden">
        <div className="flex items-center mb-4 md:mb-0">
          <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>{t("back")}</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-800">{t("projectReport")}</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setExportFormat("pdf")}
              className={`px-3 py-2 flex items-center gap-1 ${
                exportFormat === "pdf" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-700"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => setExportFormat("csv")}
              className={`px-3 py-2 flex items-center gap-1 ${
                exportFormat === "csv" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-700"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>CSV</span>
            </button>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            <span>{t("export")}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            <Printer className="h-4 w-4" />
            <span>{t("print")}</span>
          </button>

          <button
            onClick={handleEmail}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            <Mail className="h-4 w-4" />
            <span>{t("email")}</span>
          </button>
        </div>
      </div>

      {/* Report content */}
      <div ref={reportRef} className="bg-white rounded-lg shadow-md p-6 print:shadow-none print:p-0">
        {/* Project header */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{project.projectName}</h1>
          <p className="text-gray-600 mb-4">{project.projectDescription}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {t("created")}: {createdDate}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {t("evaluators")}: {Object.keys(project.evaluators || {}).length}
              </span>
            </div>
          </div>
        </div>

        {/* Summary section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("executiveSummary")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall score */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-800">{t("overallScore")}</h3>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-32 w-32">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800">{overallScore.toFixed(1)}%</span>
                  </div>
                  <svg viewBox="0 0 36 36" className="h-32 w-32">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#eee"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeDasharray={`${overallScore}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Completion status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-gray-800">{t("completionStatus")}</h3>
              </div>
              <div className="flex justify-center items-center h-32">
                <div className="grid grid-cols-3 gap-4 w-full">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{completionStatus.completed}</div>
                    <div className="text-sm text-gray-600">{t("completed")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{completionStatus.inProgress}</div>
                    <div className="text-sm text-gray-600">{t("inProgress")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">{completionStatus.pending}</div>
                    <div className="text-sm text-gray-600">{t("pending")}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top sections */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-800">{t("topSections")}</h3>
              </div>
              <div className="h-32 overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                        {t("section")}
                      </th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                        {t("score")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionScores
                      .sort((a, b) => b.score - a.score)
                      .map((section, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="py-2 text-sm text-gray-800">{section.section}</td>
                          <td className="py-2 text-sm text-gray-800 text-right">{section.score.toFixed(1)}%</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Section scores */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("sectionScores")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">{t("section")}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b w-24">{t("weight")}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b w-24">{t("score")}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                    {t("visualization")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sectionScores.map((section, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b text-sm font-medium">{section.section}</td>
                    <td className="px-4 py-3 border-b text-sm">{(section.weight * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 border-b text-sm">{section.score.toFixed(1)}%</td>
                    <td className="px-4 py-3 border-b text-sm">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${section.score}%` }}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Evaluator status */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("evaluatorStatus")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">{t("role")}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">{t("email")}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">{t("status")}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">{t("lastUpdated")}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">{t("submitted")}</th>
                </tr>
              </thead>
              <tbody>
                {project.evaluators &&
                  Object.entries(project.evaluators).map(([role, evaluator]) => {
                    const evaluation = project.evaluations?.[role]
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
                              {t(status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-b text-sm">
                          {evaluation?.lastUpdated ? new Date(evaluation.lastUpdated.toDate()).toLocaleString() : "N/A"}
                        </td>
                        <td className="px-4 py-3 border-b text-sm">
                          {evaluation?.submittedAt ? new Date(evaluation.submittedAt.toDate()).toLocaleString() : "N/A"}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed criteria */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("detailedCriteria")}</h2>
          {project.evaluationTable.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {section.section} ({(section.weight * 100).toFixed(1)}%)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">
                        {t("criteria")}
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b w-20">
                        {t("maxRating")}
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b w-20">
                        {t("rating")}
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b w-24">
                        {t("score")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.criteria.map((criterion, criterionIndex) => {
                      const scorePercentage =
                        criterion.maxRating > 0 ? (criterion.rating / criterion.maxRating) * 100 : 0
                      return (
                        <tr key={criterionIndex} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border-b text-sm">{criterion.description}</td>
                          <td className="px-4 py-2 border-b text-sm text-center">{criterion.maxRating}</td>
                          <td className="px-4 py-2 border-b text-sm text-center">{criterion.rating}</td>
                          <td className="px-4 py-2 border-b text-sm">
                            <div className="flex items-center">
                              <span className="mr-2">{scorePercentage.toFixed(1)}%</span>
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full"
                                  style={{ width: `${scorePercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Report footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <p>
            {t("reportGenerated")}: {new Date().toLocaleString()}
          </p>
          <p>LAPAS Evaluator Tool</p>
        </div>
      </div>
    </div>
  )
}
