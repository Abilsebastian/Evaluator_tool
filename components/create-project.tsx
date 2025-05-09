"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { db, auth } from "@/lib/firebase-config"
import { collection, doc, getDoc, query, where, getDocs, setDoc } from "firebase/firestore"
import {
  PlusCircle,
  Save,
  Trash2,
  Plus,
  Users,
  ClipboardList,
  AlertCircle,
  FileText,
  FilePlus,
  Copy,
  ArrowLeft,
} from "lucide-react"

// Default empty template for starting from scratch
const emptyTemplate = {
  section: "New Section",
  weight: 0.2,
  criteria: [
    {
      description: "New criterion",
      maxRating: 5,
      rating: 0,
    },
  ],
}

// Default evaluation template with predefined sections
const defaultEvaluationTable = [
  {
    section: "Projekta mērķis un atbilstība ",
    weight: 0.2,
    criteria: [
      {
        description: "Dod ieguldījumu konkursa mērķa sasniegšanā: “Iedvesmot un iesaistīt Eiropas Savienības pilsoņus, jo īpaši jauniešus un tos, kas ir mazāk informēti par globāliem izaicinājumiem un mazāk saistīti ar tām, uzņemties kopīgu atbildību, lai izveidotu iekļaujošāku, līdztiesīgāku un ilgtspējīgāku pasauli.”",
        maxRating: 5,
        rating: 0,
      },
      {
        description: "Projektā tiek jēgpilni iesaistīta mērķa grupa",
        maxRating: 5,
        rating: 0,
      },
      {
        description: "Projekts palielina mērķgrupas kritisko izpratni par globāliem izaicinājumiem",
        maxRating: 5,
        rating: 0,
      },
    ],
  },
  {
    section: "Latvijas un Eiropas Savienības pilsoņu mērķa grupu zināšanas un iesaiste",
    weight: 0.3,
    criteria: [
      {
        description: "Iesniedzējs pierāda specifiskas zināšanas par mērķa grupu un spēju to sasniegt",
        maxRating: 5,
        rating: 0,
      },
      {
        description: "Iesniedzējs ir iekļāvis mērķa grupu(-as) pieteikuma izstrādē",
        maxRating: 5,
        rating: 0,
      },
      {
        description: "Projekta komunikācijas kanālu un metožu izvēle ir piemērota, lai jēgpilni iesaistītu mērķa grupu un radītu tai kritisku izpratni par globāliem izaicinājumiem",
        maxRating: 5,
        rating: 0,
      },
      {
        description: "Projekts sasniedz mērķa grupu, kas definēta kā “mazāk jutīga” pret globālajiem izaicinājumiem, un/vai projekts sasniedz mērķa grupu, kas definēta kā “jaunieši”",
        maxRating: 5,
        rating: 0,
      },
      {
        description: "Projekta aktivitātes spēs motivēt mērķa grupu(-as) jēgpilni iesaistīties (virzīties augšup iesaistes piramīdā) un/vai kritiski apzināties problēmas, uz kurām norāda projekta pieteikums",
        maxRating: 5,
        rating: 0,
      },
    ],
  },
  {
    section: "Globālo Dienvidu iesaiste",
    weight: 0.3,
    criteria: [
      {
        description: "Projekta pieteikumā ir iesaistīti cilvēki, kurus tieši skārusi globālo izaicinājumu ietekme, tiem darbojoties kā partneriem, stāstītājiem, dalībniekiem vai ieņemot citu lomu projekta izstrādē un īstenošanā un nodrošinot kvalificētu un ētisku iesaisti",
        maxRating: 5,
        rating: 0,
      },
      {
        description: "Projekta pieteikumā ir iesaistītas ieinteresētās personas piedāvātajām darbībām",
        maxRating: 5,
        rating: 0,
      },
    ],
  },
  {
    section: "Pārmaiņu teorijas piemērošana",
    weight: 0.2,
    criteria: [
      {
        description: "Izvēlētās aktivitātes ir atbilstošas un pietiekamas, lai radītu rīcības izmaiņas, ko ar piedāvāto projektu cenšas panākt",
        maxRating: 5,
        rating: 0,
      },
      {
        description: "Izvēlētās aktivitātes ir atbilstošas un pietiekamas, lai sasniegtu izvēlēto mērķa grupu(-as)",
        maxRating: 5,
        rating: 0,
      },
      {
        description: "Izvēlēto aktivitāšu sākuma punkts ir līdzdalības piramīdā un cik lielā mērā tās parāda, kā šīs aktivitātes virza mērķa grupu(-as) no viena piramīdas līmeņa uz nākamo",
        maxRating: 5,
        rating: 0,
      },
      {
        description: "Piedāvātā projekta rezultāti ir izmērāmi",
        maxRating: 5,
        rating: 0,
      },
      {
        description: "Piedāvātā projekta rezultāti, visticamāk, tiks izmantoti pat pēc projekta beigām",
        maxRating: 5,
        rating: 0,
      },
      {
        description: "Projekts veicina dzimumu līdztiesību, izmantojot transformatīvo un",
        maxRating: 5,
        rating: 0,
      },
    ],
  },
  {
    section: "Kapacitāte",
    weight: 0.2,
    criteria: [
      {
        description: "Projekta iesniedzējam un partnerim ir atbilstoša kapacitāte (administratīvā, finanšu, saturiskā), lai īstenotu aktivitātes saistībā ar plānoto mērķi, metodēm un mērķa grupāms",
        maxRating: 5,
        rating: 0,
      },
      {
        description: "Projekta iesniedzējam ir nepieciešamās zināšanas un pieredze īstenot aktivitātes, tostarp komunikācijas prasmes un piekļuve attiecīgajiem mērķa grupas komunikācijas kanāliem",
        maxRating: 5,
        rating: 0,
      },
      {
        description: "Piedāvātās aktivitātes ir saistītas ar iesniedzējorganizācijas(-u) mērķiem, darbību, misiju un/vai vīzijum",
        maxRating: 5,
        rating: 0,
      },
    ],
  },
  {
    section: "Izmaksu efektivitāte",
    weight: 0.2,
    criteria: [
      {
        description: "Projekta izmaksu līmenis ir pamatoti saistīts ar aktivitātēm, sagaidāmajiem rezultātiem un kopējo budžetu",
        maxRating: 5,
        rating: 0,
      },
      {
        description: "Aktivtāšu izmaksu līmenis ir pamatoti saistīts ar sasniegto un iesaistīto ES pilsoņu skaitu",
        maxRating: 5,
        rating: 0,
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
  const [creationMode, setCreationMode] = useState<"template" | "scratch" | null>(null)
  const [step, setStep] = useState<"select" | "details" | "evaluators" | "criteria">("select")

  // Memoize the search params to prevent re-renders
  const id = searchParams?.get("id")
  const name = searchParams?.get("name")
  const templateParam = searchParams?.get("template")
  const mode = searchParams?.get("mode") as "template" | "scratch" | null

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

  // Set creation mode from URL parameter if provided
  useEffect(() => {
    if (mode && (mode === "template" || mode === "scratch")) {
      setCreationMode(mode)
      setStep("details")

      // Initialize with appropriate template
      if (mode === "scratch") {
        setEvaluationTable([{ ...emptyTemplate }])
      }
    }
  }, [mode])

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
          setStep("details")
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
      } else if (creationMode === "template" || mode === "template") {
        await fetchTestProject()
      } else if (creationMode === "scratch" || mode === "scratch") {
        setEvaluationTable([{ ...emptyTemplate }])
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
  }, [id, name, templateParam, initialized, error, currentUser, creationMode, mode])

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

  // Handle mode selection
  const handleModeSelection = (mode: "template" | "scratch") => {
    setCreationMode(mode)

    if (mode === "template") {
      // Load default template
      setEvaluationTable(defaultEvaluationTable)
    } else {
      // Start with empty template
      setEvaluationTable([{ ...emptyTemplate }])
    }

    setStep("details")
  }

  // Handle navigation between steps
  const handleNextStep = () => {
    if (step === "details") {
      setStep("evaluators")
    } else if (step === "evaluators") {
      setStep("criteria")
    }
  }

  const handlePreviousStep = () => {
    if (step === "criteria") {
      setStep("evaluators")
    } else if (step === "evaluators") {
      setStep("details")
    } else if (step === "details" && !projectId) {
      setStep("select")
      setCreationMode(null)
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

  // Step 1: Select creation mode
  if (step === "select") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.push("/admin-dashboard")}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span>Back</span>
            </button>
            <h2 className="text-xl font-bold text-gray-800">Create New Project</h2>
          </div>

          <p className="text-gray-600 mb-8">Choose how you want to create your new project:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => handleModeSelection("template")}
              className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md"
            >
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Use Default Template</h3>
              <p className="text-gray-600 text-center">
                Start with our predefined evaluation criteria and customize as needed.
              </p>
              <div className="mt-4 text-center">
                <span className="inline-flex items-center text-blue-600 font-medium">
                  <Copy className="h-4 w-4 mr-1" />4 sections, 8 criteria included
                </span>
              </div>
            </div>

            <div
              onClick={() => handleModeSelection("scratch")}
              className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md"
            >
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <FilePlus className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Start from Scratch</h3>
              <p className="text-gray-600 text-center">
                Create a completely custom project with your own evaluation criteria.
              </p>
              <div className="mt-4 text-center">
                <span className="inline-flex items-center text-green-600 font-medium">
                  <Plus className="h-4 w-4 mr-1" />
                  Build your own structure
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Progress indicator */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push("/admin-dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back</span>
          </button>
          <h2 className="text-xl font-bold text-gray-800">{projectId ? "Edit Project" : "Create Project"}</h2>
        </div>

        <div className="relative">
          <div className="flex mb-4">
            <div className={`flex-1 text-center ${step === "details" ? "font-semibold text-blue-600" : ""}`}>
              Project Details
            </div>
            <div className={`flex-1 text-center ${step === "evaluators" ? "font-semibold text-blue-600" : ""}`}>
              Assign Evaluators
            </div>
            <div className={`flex-1 text-center ${step === "criteria" ? "font-semibold text-blue-600" : ""}`}>
              Evaluation Criteria
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{
                width: step === "details" ? "33.3%" : step === "evaluators" ? "66.6%" : "100%",
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Step content */}
      {step === "details" && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-6">Project Details</h3>

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

          <div className="flex justify-between">
            <button
              onClick={handlePreviousStep}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleNextStep}
              disabled={!projectData.projectName}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              Next: Assign Evaluators
            </button>
          </div>
        </div>
      )}

      {step === "evaluators" && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-800">Assign Evaluators</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

          <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md mb-6">
            <p>
              Note: Evaluators will be assigned to this project and will be able to see their assignments when they log
              in.
            </p>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePreviousStep}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Back to Project Details
            </button>
            <button onClick={handleNextStep} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Next: Evaluation Criteria
            </button>
          </div>
        </div>
      )}

      {step === "criteria" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <ClipboardList className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-800">Evaluation Criteria</h3>
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

          <div className="flex justify-between mt-6">
            <button
              onClick={handlePreviousStep}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Back to Evaluators
            </button>
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
      )}
    </div>
  )
}
