"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase-config"
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore"
import { AlertCircle, Check, Loader2 } from "lucide-react"

interface User {
  id: string
  email: string
  assignedProjects?: string[]
  role?: string
}

interface Project {
  id: string
  projectName: string
  evaluators: Record<string, { uid: string; email: string }>
}

export default function UserProjectsManager() {
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [fixing, setFixing] = useState(false)
  const [fixed, setFixed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [log, setLog] = useState<string[]>([])

  // Add a log entry
  const addLog = (message: string) => {
    setLog((prev) => [...prev, message])
  }

  // Fetch users and projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch users
        const usersSnapshot = await getDocs(collection(db, "users"))
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[]
        setUsers(usersList)
        addLog(`Found ${usersList.length} users`)

        // Fetch projects
        const projectsSnapshot = await getDocs(collection(db, "projects"))
        const projectsList = projectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[]
        setProjects(projectsList)
        addLog(`Found ${projectsList.length} projects`)
      } catch (error: any) {
        console.error("Error fetching data:", error)
        setError(`Error loading data: ${error.message}`)
        addLog(`Error: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fix project assignments
  const handleFixAssignments = async () => {
    try {
      setFixing(true)
      setError(null)
      setFixed(false)
      addLog("Starting to fix project assignments...")

      // For each project
      for (const project of projects) {
        addLog(`Processing project: ${project.projectName} (${project.id})`)

        // For each evaluator in the project
        for (const [role, evaluator] of Object.entries(project.evaluators || {})) {
          if (evaluator && evaluator.uid) {
            addLog(`Processing evaluator: ${evaluator.email} (${evaluator.uid}) as ${role}`)

            // Update the user's assignedProjects array
            const userRef = doc(db, "users", evaluator.uid)
            const userDoc = await getDoc(userRef)

            if (userDoc.exists()) {
              const userData = userDoc.data()
              const assignedProjects = userData.assignedProjects || []

              if (!assignedProjects.includes(project.id)) {
                assignedProjects.push(project.id)
                addLog(`Adding project ${project.id} to user ${evaluator.uid}`)

                // Update the user document
                await setDoc(userRef, { assignedProjects }, { merge: true })
                addLog(`✓ Updated user document`)
              } else {
                addLog(`Project already assigned to user`)
              }
            } else {
              addLog(`⚠️ User document not found for uid: ${evaluator.uid}`)
            }
          }
        }
      }

      // Refresh user data
      const usersSnapshot = await getDocs(collection(db, "users"))
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[]
      setUsers(usersList)

      addLog("✓ Project assignments fixed successfully")
      setFixed(true)
    } catch (error: any) {
      console.error("Error fixing assignments:", error)
      setError(`Error fixing assignments: ${error.message}`)
      addLog(`❌ Error: ${error.message}`)
    } finally {
      setFixing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">User Projects Manager</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-start mb-4">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {fixed && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md flex items-start mb-4">
            <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>Project assignments have been fixed successfully.</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">
              Found {users.length} users and {projects.length} projects.
            </p>
          </div>
          <button
            onClick={handleFixAssignments}
            disabled={fixing || loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {fixing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            <span>{fixing ? "Fixing..." : "Fix Project Assignments"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">User Assignments</h3>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">User</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Role</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Assigned Projects</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{user.email}</td>
                        <td className="px-4 py-2 text-sm">{user.role || "user"}</td>
                        <td className="px-4 py-2 text-sm">
                          {user.assignedProjects?.length ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              {user.assignedProjects.length} projects
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                              No projects
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Operation Log</h3>
            <div className="h-96 overflow-y-auto bg-gray-50 p-4 rounded-md border border-gray-200 font-mono text-sm">
              {log.map((entry, index) => (
                <div key={index} className="mb-1">
                  &gt; {entry}
                </div>
              ))}
              {(loading || fixing) && (
                <div className="animate-pulse text-blue-600">
                  &gt; <span className="inline-block w-2">_</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
