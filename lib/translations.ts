export type Language = "en" | "lv"

export type TranslationKey =
  | "signIn"
  | "signOut"
  | "email"
  | "password"
  | "register"
  | "or"
  | "signingIn"
  | "home"
  | "adminDashboard"
  | "createProject"
  | "projectAssignments"
  | "evaluationForm"
  | "resultsDashboard"
  | "userManual"
  | "viewUserManual"
  | "forgotPassword"
  | "resetPassword"
  | "resetPasswordInstructions"
  | "sendResetLink"
  | "sendingResetLink"
  | "resetLinkSent"
  | "checkEmailForInstructions"
  | "didntReceiveEmail"
  | "tryAgain"
  | "backToSignIn"
  | "emailNotFound"
  | "invalidEmail"
  | "tooManyRequests"
  | "resetPasswordError"
  | "openMenu"
  | "closeMenu"
  | "newEvaluation"
  | "newEvaluationAssigned"
  | "projectCompleted"
  | "projectEvaluationCompleted"
  | "notifications"
  | "noNotifications"
  | "markAllAsRead"
  | "profile"
  | "settings"
  | "logout"
  | "allRightsReserved"
  | "help"
  | "privacyPolicy"
  | "termsOfService"
  | "visitLAPAS"
  | "madeWith"
  | "forLAPAS"
  | "changeLanguage"
  | "adminTools"
  | "adminToolsDesc"
  | "allProjects"
  | "yourAssignedProjects"
  | "filterByStatus"
  | "all"
  | "pending"
  | "inProgress"
  | "completed"
  | "permissionError"
  | "error"
  | "projectName"
  | "projectDescription"
  | "createProject"
  | "yourRole"
  | "continueEvaluation"
  | "viewSubmission"
  | "copyLink"
  | "delete"
  | "noProjectsAdmin"
  | "noProjectsUser"
  | "noFilteredProjects"
  | "howToAccess"
  | "accessWays"
  | "contactAdmin"
  | "statusLegend"
  | "pendingDesc"
  | "inProgressDesc"
  | "completedDesc"
  | "createNewProject"
  | "preferencesSaved"

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    signIn: "Sign in",
    signOut: "Sign out",
    email: "Email",
    password: "Password",
    register: "Register",
    or: "Or",
    signingIn: "Signing in...",
    home: "Home",
    adminDashboard: "Admin Dashboard",
    createProject: "Create Project",
    projectAssignments: "Project Assignments",
    evaluationForm: "Evaluation Form",
    resultsDashboard: "Results Dashboard",
    userManual: "User Manual",
    viewUserManual: "View User Manual",
    forgotPassword: "Forgot password?",
    resetPassword: "Reset Password",
    resetPasswordInstructions: "Enter your email address and we'll send you a link to reset your password.",
    sendResetLink: "Send Reset Link",
    sendingResetLink: "Sending...",
    resetLinkSent: "Reset Link Sent",
    checkEmailForInstructions: "Check your email for instructions to reset your password.",
    didntReceiveEmail: "Didn't receive the email?",
    tryAgain: "Try again",
    backToSignIn: "Back to Sign In",
    emailNotFound: "No account found with this email address.",
    invalidEmail: "Please enter a valid email address.",
    tooManyRequests: "Too many requests. Please try again later.",
    resetPasswordError: "Failed to send password reset email. Please try again.",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    newEvaluation: "New Evaluation",
    newEvaluationAssigned: "A new evaluation has been assigned to you.",
    projectCompleted: "Project Completed",
    projectEvaluationCompleted: "The evaluation for a project has been completed.",
    notifications: "Notifications",
    noNotifications: "No notifications",
    markAllAsRead: "Mark all as read",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    allRightsReserved: "All rights reserved.",
    help: "Help",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    visitLAPAS: "Visit LAPAS",
    madeWith: "Made with",
    forLAPAS: "for LAPAS",
    changeLanguage: "Change language",
    adminTools: "Admin Tools",
    adminToolsDesc: "Manage projects, evaluators, and view results.",
    allProjects: "All Projects",
    yourAssignedProjects: "Your Assigned Projects",
    filterByStatus: "Filter by Status",
    all: "All",
    pending: "Pending",
    inProgress: "In Progress",
    completed: "Completed",
    permissionError: "You don't have permission to access this resource.",
    error: "Error",
    projectName: "Project Name",
    projectDescription: "Project Description",
    createProject: "Create Project",
    yourRole: "Your role",
    continueEvaluation: "Continue Evaluation",
    viewSubmission: "View Submission",
    copyLink: "Copy Link",
    delete: "Delete",
    noProjectsAdmin: "No projects found. Start by creating a new project.",
    noProjectsUser: "No projects assigned to you yet.",
    noFilteredProjects: "No projects found matching the {status} status.",
    howToAccess: "How to Access Projects",
    accessWays: "There are two ways to access projects:",
    contactAdmin: "If you don't see any projects, contact your administrator to be assigned to a project.",
    statusLegend: "Status Legend",
    pendingDesc: "Evaluator hasn't started the evaluation yet.",
    inProgressDesc: "Evaluator has started the evaluation but not submitted it yet.",
    completedDesc: "Evaluator has submitted the evaluation.",
    createNewProject: "Create New Project",
    preferencesSaved: "Preferences saved!",
  },
  lv: {
    signIn: "Ieiet",
    signOut: "Iziet",
    email: "E-pasts",
    password: "Parole",
    register: "Reģistrēties",
    or: "Vai",
    signingIn: "Ieiet...",
    home: "Sākums",
    adminDashboard: "Administratora Panelis",
    createProject: "Izveidot Projektu",
    projectAssignments: "Projektu Piešķiršana",
    evaluationForm: "Novērtējuma Forma",
    resultsDashboard: "Rezultātu Panelis",
    userManual: "Lietotāja Rokasgrāmata",
    viewUserManual: "Skatīt Lietotāja Rokasgrāmatu",
    forgotPassword: "Aizmirsi paroli?",
    resetPassword: "Atiestatīt Paroli",
    resetPasswordInstructions: "Ievadiet savu e-pasta adresi, un mēs nosūtīsim jums saiti, lai atiestatītu paroli.",
    sendResetLink: "Nosūtīt Atiestatīšanas Saiti",
    sendingResetLink: "Nosūta...",
    resetLinkSent: "Atiestatīšanas Saite Nosūtīta",
    checkEmailForInstructions: "Pārbaudiet savu e-pastu, lai iegūtu norādījumus paroles atiestatīšanai.",
    didntReceiveEmail: "Nesaņēmāt e-pastu?",
    tryAgain: "Mēģiniet vēlreiz",
    backToSignIn: "Atpakaļ uz Ieiet",
    emailNotFound: "Nav atrasts konts ar šo e-pasta adresi.",
    invalidEmail: "Lūdzu, ievadiet derīgu e-pasta adresi.",
    tooManyRequests: "Pārāk daudz pieprasījumu. Lūdzu, mēģiniet vēlāk.",
    resetPasswordError: "Neizdevās nosūtīt paroles atiestatīšanas e-pastu. Lūdzu, mēģiniet vēlreiz.",
    openMenu: "Atvērt izvēlni",
    closeMenu: "Aizvērt izvēlni",
    newEvaluation: "Jauns Vērtējums",
    newEvaluationAssigned: "Jums ir piešķirts jauns vērtējums.",
    projectCompleted: "Projekts Pabeigts",
    projectEvaluationCompleted: "Projekta novērtēšana ir pabeigta.",
    notifications: "Paziņojumi",
    noNotifications: "Nav paziņojumu",
    markAllAsRead: "Atzīmēt visu kā lasītu",
    profile: "Profils",
    settings: "Iestatījumi",
    logout: "Iziet",
    allRightsReserved: "Visas tiesības aizsargātas.",
    help: "Palīdzība",
    privacyPolicy: "Privātuma Politika",
    termsOfService: "Lietošanas Noteikumi",
    visitLAPAS: "Apmeklēt LAPAS",
    madeWith: "Izveidots ar",
    forLAPAS: "priekš LAPAS",
    changeLanguage: "Mainīt valodu",
    adminTools: "Administratora Rīki",
    adminToolsDesc: "Pārvaldīt projektus, vērtētājus un skatīt rezultātus.",
    allProjects: "Visi Projekti",
    yourAssignedProjects: "Jums Piešķirtie Projekti",
    filterByStatus: "Filtrēt pēc Statusa",
    all: "Visi",
    pending: "Gaida",
    inProgress: "Procesā",
    completed: "Pabeigts",
    permissionError: "Jums nav atļaujas piekļūt šim resursam.",
    error: "Kļūda",
    projectName: "Projekta Nosaukums",
    projectDescription: "Projekta Apraksts",
    createProject: "Izveidot Projektu",
    yourRole: "Jūsu loma",
    continueEvaluation: "Turpināt Novērtējumu",
    viewSubmission: "Skatīt Iesniegumu",
    copyLink: "Kopēt Saiti",
    delete: "Dzēst",
    noProjectsAdmin: "Nav atrasts neviens projekts. Sāciet, izveidojot jaunu projektu.",
    noProjectsUser: "Jums vēl nav piešķirts neviens projekts.",
    noFilteredProjects: "Nav atrasts neviens projekts, kas atbilst statusam {status}.",
    howToAccess: "Kā Piekļūt Projektiem",
    accessWays: "Ir divi veidi, kā piekļūt projektiem:",
    contactAdmin: "Ja neredzat nevienu projektu, sazinieties ar administratoru, lai tiktu piešķirts projektam.",
    statusLegend: "Statusa Leģenda",
    pendingDesc: "Vērtētājs vēl nav sācis novērtēšanu.",
    inProgressDesc: "Vērtētājs ir sācis novērtēšanu, bet vēl nav to iesniedzis.",
    completedDesc: "Vērtētājs ir iesniedzis novērtējumu.",
    createNewProject: "Izveidot Jaunu Projektu",
    preferencesSaved: "Preferences saglabātas!",
  },
}

export function getTranslation(language: Language, key: TranslationKey, replacements?: Record<string, string>): string {
  let translation = translations[language][key] || key

  if (replacements) {
    Object.entries(replacements).forEach(([key, value]) => {
      translation = translation.replace(new RegExp(`\\{${key}\\}`, "g"), value)
    })
  }

  return translation
}
