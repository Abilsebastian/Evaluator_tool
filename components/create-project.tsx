"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { db, auth } from "@/lib/firebase-config"
import { collection, doc, getDoc, query, where, getDocs, setDoc } from "firebase/firestore"
import { PlusCircle, Save, Trash2, Plus, Users, ClipboardList, AlertCircle } from "lucide-react"

const defaultEvaluationTable = [
  {
    section: "Project purpose and relevance",
    weight: 0.2,
    criteria: [
      {
        description: "Contribute to the achievement of the objective of the competition",
        maxRating: 5,
        rating: 5,
      },
      {
        description: "The target group is meaningfully involved in the project",
        maxRating: 5,
        rating: 5,
      },
    ],
  },
]

interface User {
  id: string
  email: string
  role?: string
}

interface Evaluators {
  PV1: string
  PV2: string
  VK: string
}

interface ProjectData {
  projectName: string
  projectDescription: string
  evaluators: Evaluators
}

export default function CreateProject() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [projectData, setProjectData] = useState<ProjectData>({
    projectName: "",
    projectDescription: "",
    evaluators: {
      PV1: "",
      PV2: "",
      VK: "",
    },
  })
  const [evaluationTable, setEvaluationTable] = useState(defaultEvaluationTable)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Memoize the search params to prevent re-renders
  const id = searchParams?.get("id")
  const name = searchParams?.get("name")
  const templateParam = searchParams?.get("template")

  // Check current user and permissions
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const user = auth.currentUser
        if (!user) {
          setError("You must be logged in to create or edit projects")
          return
        }

        // Get user data to check role
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (!userDoc.exists()) {
          setError("User profile not found")
          return
        }

        const userData = userDoc.data()
        if (userData.role !== "admin") {
          setError("Only administrators can create or edit projects")
          return
        }

        setCurrentUser({
          uid: user.uid,
          email: user.email,
          role: userData.role,
        })
      } catch (err) {
        console.error("Error checking user permissions:", err)
        setError("Error verifying user permissions")
      }
    }

    checkCurrentUser()
  }, [])

  // Fetch project data if editing or load TestProject as default
  useEffect(() => {
    // Skip if already initialized or if there's an error
    if (initialized || error) return

    const fetchProjectData = async (projectId: string) => {
      try {
        const projectRef = doc(db, "projects", projectId)
        const projectSnapshot = await getDoc(projectRef)

        if (projectSnapshot.exists()) {
          const project = projectSnapshot.data()
          setProjectData({
            projectName: project.projectName || "",
            projectDescription: project.projectDescription || "",
            evaluators: project.evaluators || { PV1: "", PV2: "", VK: "" },
          })
          setEvaluationTable(project.evaluationTable || defaultEvaluationTable)
        } else {
          console.error("Project not found")
          setError("Project not found")
        }
      } catch (error: any) {
        console.error("Error fetching project data:", error)
        setError(`Error loading project: ${error.message}`)
      }
    }

    const fetchTestProject = async () => {
      try {
        let evaluationTableFromTemplate = defaultEvaluationTable

        if (templateParam) {
          try {
            const parsedTemplate = JSON.parse(templateParam)
            if (parsedTemplate.evaluationTable) {
              evaluationTableFromTemplate = parsedTemplate.evaluationTable
            }
          } catch (parseError) {
            console.error("Error parsing template:", parseError)
          }
        } else {
          try {
            const testProjectQuery = query(collection(db, "projects"), where("projectName", "==", "TestProject"))
            const querySnapshot = await getDocs(testProjectQuery)

            if (!querySnapshot.empty) {
              const testProject = querySnapshot.docs[0].data()
              if (testProject.evaluationTable) {
                evaluationTableFromTemplate = testProject.evaluationTable
              }
            }
          } catch (queryError: any) {
            console.error("Error querying TestProject:", queryError)
            if (queryError.code === "permission-denied") {
              setError(
                "You don't have permission to access the template project. Please check your Firebase security rules.",
              )
            }
          }
        }

        setProjectData((prev) => ({
          ...prev,
          projectName: name || "",
          projectDescription: "",
          evaluators: { PV1: "", PV2: "", VK: "" },
        }))

        setEvaluationTable(evaluationTableFromTemplate)
      } catch (error: any) {
        console.error("Error loading template:", error)
        setError(`Error loading template: ${error.message}`)
      }
    }

    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"))
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setUsers(usersList)
      } catch (error: any) {
        console.error("Error fetching users:", error)
        setError(`Error loading users: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    const initializeData = async () => {
      if (id) {
        setProjectId(id)
        await fetchProjectData(id)
      } else {
        await fetchTestProject()
      }
      await fetchUsers()
      setInitialized(true)
    }

    if (currentUser?.role === "admin") {
      initializeData()
    } else if (currentUser !== null) {
      // If user is loaded but not admin
      setLoading(false)
    }
  }, [id, name, templateParam, initialized, error, currentUser])

  // Handle input changes for project data
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProjectData({ ...projectData, [e.target.name]: e.target.value })
  }

  // Handle adding a new section to the evaluation table
  const handleAddSection = () => {
    setEvaluationTable((prevTable) => [
      ...prevTable,
      {
        section: "",
        weight: 0,
        criteria: [],
      },
    ])
  }

  // Handle removing a criterion from a section in the evaluation table
  const handleRemoveCriterion = (sectionIndex: number, criteriaIndex: number) => {
    setEvaluationTable((prevTable) =>
      prevTable.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              criteria: section.criteria.filter((_, cIndex) => cIndex !== criteriaIndex),
            }
          : section,
      ),
    )
  }

  // Handle adding a new criterion to a section in the evaluation table
  const handleAddCriterion = (sectionIndex: number) => {
    setEvaluationTable((prevTable) =>
      prevTable.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              criteria: [...section.criteria, { description: "", maxRating: 0, rating: 0 }],
            }
          : section,
      ),
    )
  }

  // Handle removing a section from the evaluation table
  const handleRemoveSection = (sectionIndex: number) => {
    setEvaluationTable((prevTable) => prevTable.filter((_, index) => index !== sectionIndex))
  }

  // Handle changes in the section fields of the evaluation table
  const handleSectionChange = (sectionIndex: number, field: string, value: any) => {
    setEvaluationTable((prevTable) =>
      prevTable.map((section, index) => (index === sectionIndex ? { ...section, [field]: value } : section)),
    )
  }

  // Handle evaluator assignment
  const handleEvaluatorChange = (role: string, email: string) => {
    setProjectData((prevData) => ({
      ...prevData,
      evaluators: {
        ...prevData.evaluators,
        [role]: email,
      },
    }))
  }

  // Handle changes in the criteria fields of the evaluation table
  const handleCriteriaChange = (sectionIndex: number, criteriaIndex: number, field: string, value: any) => {
    setEvaluationTable((prevTable) =>
      prevTable.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              criteria: section.criteria.map((criterion, cIndex) =>
                cIndex === criteriaIndex ? { ...criterion, [field]: value } : criterion,
              ),
            }
          : section,
      ),
    )
  }

  // Save or update the project
  const handleSaveProject = async () => {
    setSaving(true)
    setError(null)

    try {
      // Verify user is authenticated and has admin role
      if (!currentUser || currentUser.role !== "admin") {
        throw new Error("You don't have permission to save projects")
      }

      // Create project document first
      const projectRef = projectId ? doc(db, "projects", projectId) : doc(collection(db, "projects"))
      const newProjectId = projectId || projectRef.id

      // Prepare project data
      const evaluatorsWithUIDs: Record<string, any> = {}

      // First, gather all evaluator information
      for (const [role, evaluatorEmail] of Object.entries(projectData.evaluators)) {
        if (evaluatorEmail) {
          const userQuery = query(collection(db, "users"), where("email", "==", evaluatorEmail))
          const userSnapshot = await getDocs(userQuery)

          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0]
            const userId = userDoc.id

            // Add evaluator details to the evaluators object
            evaluatorsWithUIDs[role] = {
              email: evaluatorEmail,
              uid: userId,
            }

            // Update the user document to include this project in their assignedProjects array
            try {
              const userRef = doc(db, "users", userId)
              const userDocData = await getDoc(userRef)

              if (userDocData.exists()) {
                const userData = userDocData.data()
                const assignedProjects = userData.assignedProjects || []

                // Add this project to their assignments if not already there
                if (!assignedProjects.includes(newProjectId)) {
                  assignedProjects.push(newProjectId)

                  // Update the user document with the new assignedProjects array
                  await setDoc(userRef, { assignedProjects }, { merge: true })
                  console.log(`Updated user ${userId} with project ${newProjectId}`)
                }
              }
            } catch (userUpdateError) {
              console.error("Error updating user document:", userUpdateError)
              // Continue with project creation even if user update fails
            }
          }
        }
      }

      const projectDataToSave = {
        ...projectData,
        evaluators: evaluatorsWithUIDs,
        evaluationTable,
        createdBy: currentUser.uid,
        updatedAt: new Date(),
      }

      // Add createdAt only for new projects
      if (!projectId) {
        projectDataToSave.createdAt = new Date()
      }

      // Save the project document
      await setDoc(projectRef, projectDataToSave, { merge: true })

      alert(projectId ? "Project updated successfully!" : "Project created successfully!")
      router.push("/admin-dashboard")
    } catch (error: any) {
      console.error("Error saving project:", error)

      if (error.code === "permission-denied") {
        setError("You don't have permission to save this project. Please check your Firebase security rules.")
      } else {
        setError(`Failed to save project: ${error.message}`)
      }
    } finally {
      setSaving(false)
    }
  }

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
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-start mb-4">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
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
        <div className="flex justify-center mt-4">
          <button
            onClick={() => router.push("/admin-dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">{projectId ? "Edit Project" : "Create Project"}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input
              type="text"
              name="projectName"
              value={projectData.projectName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
            <textarea
              name="projectDescription"
              value={projectData.projectDescription}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project description"
              rows={3}
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-800">Assign Evaluators</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["PV1", "PV2", "VK"].map((role) => (
              <div key={role} className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">{role}</label>
                <select
                  value={projectData.evaluators[role as keyof Evaluators]}
                  onChange={(e) => handleEvaluatorChange(role, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an evaluator</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.email}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
          <p>
            Note: Evaluators will be assigned to this project and will be able to see their assignments when they log
            in.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <ClipboardList className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-800">Evaluation Table</h3>
          </div>
          <button
            onClick={handleAddSection}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Section</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {evaluationTable.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={section.section}
                    onChange={(e) => handleSectionChange(sectionIndex, "section", e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Section title"
                  />
                </div>

                <div className="w-full md:w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                  <input
                    type="number"
                    value={section.weight}
                    onChange={(e) => handleSectionChange(sectionIndex, "weight", Number.parseFloat(e.target.value))}
                    min="0"
                    max="1"
                    step="0.01"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end md:self-end">
                  <button
                    onClick={() => handleRemoveSection(sectionIndex)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              <div className="p-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">Criteria</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b w-24">
                        Max Rating
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b w-20">Rating</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.criteria.map((criteria, criteriaIndex) => (
                      <tr key={criteriaIndex} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b">
                          <input
                            type="text"
                            value={criteria.description}
                            onChange={(e) =>
                              handleCriteriaChange(sectionIndex, criteriaIndex, "description", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Criterion description"
                          />
                        </td>
                        <td className="px-4 py-2 border-b">
                          <input
                            type="number"
                            value={criteria.maxRating}
                            onChange={(e) =>
                              handleCriteriaChange(
                                sectionIndex,
                                criteriaIndex,
                                "maxRating",
                                Number.parseInt(e.target.value),
                              )
                            }
                            min="0"
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2 border-b text-center">{criteria.rating}</td>
                        <td className="px-4 py-2 border-b">
                          <button
                            onClick={() => handleRemoveCriterion(sectionIndex, criteriaIndex)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Remove</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={4} className="px-4 py-3">
                        <button
                          onClick={() => handleAddCriterion(sectionIndex)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Criterion</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveProject}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
          >
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>{projectId ? "Update Project" : "Save Project"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
