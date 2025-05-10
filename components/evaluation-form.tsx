"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { db } from "@/lib/firebase-config"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { Save, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"

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

interface EvaluationFormProps {
  user: {
    uid?: string
    email?: string
    role?: string
  } | null
}

export default function EvaluationForm({ user }: EvaluationFormProps) {
  const params = useParams<{ projectId: string }>()
  const projectId = params?.projectId as string
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [justifications, setJustifications] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [evaluatorRole, setEvaluatorRole] = useState<string | null>(null)
  const [evaluationStatus, setEvaluationStatus] = useState<"pending" | "in_progress" | "completed">("pending")
  const [completedEvaluations, setCompletedEvaluations] = useState<number>(0)
  const [totalEvaluators, setTotalEvaluators] = useState<number>(0)
  const router = useRouter()

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectRef = doc(db, "projects", projectId)
        const snapshot = await getDoc(projectRef)
        if (snapshot.exists()) {
          const data = snapshot.data() as ProjectData
          setProjectData(data)

          // Count evaluators and completed evaluations
          const evaluators = data.evaluators || {}
          const evaluations = data.evaluations || {}

          setTotalEvaluators(Object.keys(evaluators).length)
          setCompletedEvaluations(
            Object.values(evaluations).filter((evaluation) => evaluation.status === "completed").length,
          )

          // Find the evaluator role for the current user
          if (user?.uid) {
            const evaluators = data.evaluators || {}
            for (const [role, evaluator] of Object.entries(evaluators)) {
              if (evaluator && evaluator.uid === user.uid) {
                setEvaluatorRole(role)

                // Get evaluation status
                const evaluations = data.evaluations || {}
                const userEvaluation = evaluations[role]

                if (userEvaluation) {
                  setEvaluationStatus(userEvaluation.status || "pending")

                  // Initialize ratings and justifications from saved data
                  // Only use saved ratings if the evaluation is in progress or completed
                  if (userEvaluation.ratings && userEvaluation.status !== "pending") {
                    setRatings(userEvaluation.ratings)
                  } else {
                    // For new or pending evaluations, initialize all ratings to 0
                    initializeRatingsToZero(data.evaluationTable)
                  }

                  if (userEvaluation.justifications && userEvaluation.status !== "pending") {
                    setJustifications(userEvaluation.justifications)
                  } else {
                    initializeJustificationsToEmpty(data.evaluationTable)
                  }
                } else {
                  // For new evaluations, initialize all ratings to 0
                  initializeRatingsToZero(data.evaluationTable)
                  initializeJustificationsToEmpty(data.evaluationTable)
                }
                break
              }
            }
          }

          // If no role found or not initialized yet
          if (!evaluatorRole && user?.role === "admin") {
            initializeRatingsToZero(data.evaluationTable)
            initializeJustificationsToEmpty(data.evaluationTable)
          }
        }
      } catch (error) {
        console.error("Error loading project:", error)
      } finally {
        setLoading(false)
      }
    }

    // Initialize all ratings to 0 regardless of what's in the evaluation table
    const initializeRatingsToZero = (table: Section[]) => {
      const initial: Record<string, number> = {}
      table.forEach((section, i) => {
        section.criteria.forEach((criterion, j) => {
          initial[`${i}-${j}`] = 0 // Always start with 0
        })
      })
      setRatings(initial)
    }

    // Initialize all justifications to empty strings
    const initializeJustificationsToEmpty = (table: Section[]) => {
      const initialJustifications: Record<string, string> = {}
      table.forEach((section, i) => {
        section.criteria.forEach((criterion, j) => {
          initialJustifications[`${i}-${j}`] = "" // Always start with empty string
        })
      })
      setJustifications(initialJustifications)
    }

    if (projectId && user) {
      fetchProjectData()
    }
  }, [projectId, user, evaluatorRole])

  const handleRatingChange = (key: string, value: string) => {
    setRatings({ ...ratings, [key]: Number.parseFloat(value) })
    // Mark as in_progress when user starts rating
    if (evaluationStatus === "pending") {
      setEvaluationStatus("in_progress")
      updateEvaluationStatus("in_progress")
    }
  }

  const handleJustificationChange = (key: string, value: string) => {
    setJustifications({ ...justifications, [key]: value })
    // Mark as in_progress when user starts adding justifications
    if (evaluationStatus === "pending") {
      setEvaluationStatus("in_progress")
      updateEvaluationStatus("in_progress")
    }
  }

  // Update just the status in Firestore
  const updateEvaluationStatus = async (status: "pending" | "in_progress" | "completed") => {
    if (!projectData || !evaluatorRole) return

    try {
      await updateDoc(doc(db, "projects", projectId), {
        [`evaluations.${evaluatorRole}.status`]: status,
        [`evaluations.${evaluatorRole}.lastUpdated`]: serverTimestamp(),
      })
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const handleSubmit = async () => {
    if (!projectData || !evaluatorRole) return

    setSubmitting(true)
    try {
      // Update the evaluation table with ratings and justifications
      const updatedCriteria = projectData.evaluationTable.map((section, i) => ({
        ...section,
        criteria: section.criteria.map((criterion, j) => ({
          ...criterion,
          rating: Number.parseFloat(ratings[`${i}-${j}`].toString()) || 0,
          justification: justifications[`${i}-${j}`] || "",
        })),
      }))

      // Save the evaluation data with status
      await updateDoc(doc(db, "projects", projectId), {
        [`evaluations.${evaluatorRole}`]: {
          status: "completed",
          ratings,
          justifications,
          lastUpdated: serverTimestamp(),
          submittedAt: serverTimestamp(),
        },
        evaluationTable: updatedCriteria,
      })

      setEvaluationStatus("completed")
      setSuccess(true)

      // Increment completed evaluations count
      setCompletedEvaluations((prev) => prev + 1)

      setTimeout(() => {
        setSuccess(false)
        // Redirect to dashboard if all evaluations are complete
        if (completedEvaluations + 1 >= 3) {
          router.push("/landing")
        }
      }, 3000)
    } catch (error) {
      console.error("Submission failed:", error)
      alert("Failed to submit.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!projectData || !evaluatorRole) return

    setSubmitting(true)
    try {
      await updateDoc(doc(db, "projects", projectId), {
        [`evaluations.${evaluatorRole}`]: {
          status: "in_progress",
          ratings,
          justifications,
          lastUpdated: serverTimestamp(),
        },
      })

      alert("Draft saved successfully!")
    } catch (error) {
      console.error("Save failed:", error)
      alert("Failed to save draft.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!projectData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>Project not found or you don't have permission to view it.</span>
        </div>
      </div>
    )
  }

  // Check if user is authorized to evaluate this project
  const isAuthorized = user?.role === "admin" || evaluatorRole !== null

  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>You are not assigned as an evaluator for this project.</span>
        </div>
        <button
          onClick={() => router.push("/landing")}
          className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    )
  }

  // Check if all evaluations are complete
  const allEvaluationsComplete = completedEvaluations >= 3

  // Check if this evaluation is already complete
  const isEvaluationComplete = evaluationStatus === "completed"

  // Show message if project is already complete
  if (allEvaluationsComplete && !isEvaluationComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <p>This project has already received all required evaluations.</p>
            <p className="mt-2">You can view the results in the dashboard.</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/landing")}
          className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Evaluate Project: {projectData.projectName}</h2>
            {evaluatorRole && (
              <p className="text-sm text-gray-600 mt-1">
                You are evaluating as: <span className="font-medium">{evaluatorRole}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Status badge */}
            <div
              className={`px-3 py-1 rounded-full text-sm flex items-center ${
                evaluationStatus === "completed"
                  ? "bg-green-100 text-green-800"
                  : evaluationStatus === "in_progress"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              <span className="capitalize">{evaluationStatus.replace("_", " ")}</span>
            </div>

            {/* Evaluator progress */}
            <div className="text-sm text-gray-600">{completedEvaluations}/3 evaluations completed</div>

            {success && (
              <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm flex items-center">
                <span>Evaluation submitted successfully!</span>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Criteria</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b w-16">Max</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b w-20">Rating</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b w-20">Weight</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Justification</th>
              </tr>
            </thead>
            <tbody>
              {projectData.evaluationTable.map((section, i) => (
                <React.Fragment key={i}>
                  <tr className="bg-gray-100">
                    <td colSpan={5} className="px-4 py-2 font-medium text-gray-700">
                      {section.section}
                    </td>
                  </tr>
                  {section.criteria.map((criterion, j) => {
                    const key = `${i}-${j}`
                    return (
                      <tr key={key} className="hover:bg-gray-50">
                        <td className="px-4 py-3 border-b text-sm">{criterion.description}</td>
                        <td className="px-4 py-3 border-b text-sm text-center">{criterion.maxRating}</td>
                        <td className="px-4 py-3 border-b text-sm">
                          <input
                            type="number"
                            value={ratings[key] || 0}
                            min="0"
                            max={criterion.maxRating}
                            onChange={(e) => handleRatingChange(key, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={evaluationStatus === "completed" && user?.role !== "admin"}
                          />
                        </td>
                        <td className="px-4 py-3 border-b text-sm text-center">{(section.weight * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3 border-b text-sm">
                          <input
                            type="text"
                            value={justifications[key] || ""}
                            onChange={(e) => handleJustificationChange(key, e.target.value)}
                            placeholder="Add your justification here..."
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={evaluationStatus === "completed" && user?.role !== "admin"}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => router.push("/landing")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex gap-3">
            {evaluationStatus !== "completed" && (
              <button
                onClick={handleSaveDraft}
                disabled={submitting}
                className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors disabled:bg-gray-100"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Save Draft</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || (evaluationStatus === "completed" && user?.role !== "admin")}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>{evaluationStatus === "completed" ? "Update Evaluation" : "Submit Evaluation"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
