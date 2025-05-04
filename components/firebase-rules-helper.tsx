export default function FirebaseRulesHelper() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto my-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Firebase Security Rules Guide</h2>

      <div className="prose">
        <p>
          If you're seeing "Missing or insufficient permissions" errors, you need to update your Firebase security
          rules. Here are updated rules that allow evaluators to see their assigned projects when they log in:
        </p>

        <div className="bg-gray-50 p-4 rounded-md my-4 overflow-x-auto">
          <pre className="text-sm">
            {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function to check if user is an evaluator for this project
    function isEvaluator(projectData) {
      return request.auth != null && 
             (projectData.evaluators.PV1.uid == request.auth.uid || 
              projectData.evaluators.PV2.uid == request.auth.uid || 
              projectData.evaluators.VK.uid == request.auth.uid);
    }
    
    // Helper function to check if project is in user's assignedProjects array
    function isAssignedProject(projectId) {
      return request.auth != null &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.assignedProjects != null &&
             projectId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.assignedProjects;
    }
    
    // Users collection rules
    match /users/{userId} {
      // Users can read and write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Admins can read all user documents (for assigning evaluators)
      allow read: if isAdmin();
      
      // Allow admins to update any user document
      allow update: if isAdmin();
    }
    
    // Projects collection rules
    match /projects/{projectId} {
      // Admins have full access to all projects
      allow create, read, update, delete: if isAdmin();
      
      // Evaluators can read projects they're assigned to, either by evaluator role or by assigned projects array
      allow read: if request.auth != null && 
                    (isEvaluator(resource.data) || isAssignedProject(projectId));
      
      // Evaluators can update only their evaluation data
      allow update: if request.auth != null && 
                     isEvaluator(resource.data) &&
                     request.resource.data.diff(resource.data).affectedKeys()
                       .hasOnly(['evaluationTable', 'evaluations']);
    }
  }
}`}
          </pre>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-2">Key Changes in These Rules</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>
            <strong>Assigned Projects Tracking:</strong> These rules now check if a project ID is in the user's
            assignedProjects array in their user document.
          </li>
          <li>
            <strong>User Document Updates:</strong> Admins can update the assignedProjects field in user documents.
          </li>
          <li>
            <strong>Direct Project Access:</strong> Evaluators can access projects directly by ID if they're assigned to
            them.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-2">How to Update Your Rules</h3>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>
            Go to the{" "}
            <a
              href="https://console.firebase.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Firebase Console
            </a>
          </li>
          <li>Select your project</li>
          <li>In the left sidebar, click on "Firestore Database"</li>
          <li>Click on the "Rules" tab</li>
          <li>Replace the existing rules with the ones provided above</li>
          <li>Click "Publish"</li>
        </ol>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">Implementation Note</h4>
          <p className="text-sm text-blue-700">
            The code now tracks assigned projects in the user document, which provides better security and performance.
            When an admin assigns an evaluator to a project, the project ID is added to the evaluator's user document in
            an "assignedProjects" array. This allows evaluators to see only their assigned projects without needing to
            query all projects.
          </p>
        </div>
      </div>
    </div>
  )
}
