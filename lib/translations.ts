export type Language = "en" | "lv"

export type TranslationKey =
  | "welcome"
  | "adminWelcome"
  | "userWelcome"
  | "adminTools"
  | "adminToolsDesc"
  | "adminDashboard"
  | "resultsDashboard"
  | "allProjects"
  | "yourAssignedProjects"
  | "filterByStatus"
  | "all"
  | "pending"
  | "inProgress"
  | "completed"
  | "noProjects"
  | "noProjectsAdmin"
  | "noProjectsUser"
  | "noFilteredProjects"
  | "howToAccess"
  | "accessWays"
  | "directLinks"
  | "dashboardAccess"
  | "contactAdmin"
  | "statusLegend"
  | "pendingDesc"
  | "inProgressDesc"
  | "completedDesc"
  | "createNewProject"
  | "projectName"
  | "projectDescription"
  | "createProject"
  | "copyLink"
  | "delete"
  | "viewSubmission"
  | "continueEvaluation"
  | "yourRole"
  | "home"
  | "logout"
  | "email"
  | "password"
  | "signIn"
  | "signingIn"
  | "register"
  | "or"
  | "loading"
  | "error"
  | "permissionError"
  | "language"
  | "english"
  | "latvian"
  | "edit"
  | "viewResults"
  | "userManual"
  | "viewUserManual"
  | "customizePdfSections"
  | "selectAll"
  | "deselectAll"
  | "savePreferences"
  | "preferencesSaved"
  | "heroSection"
  | "overviewSection"
  | "keyFeaturesSection"
  | "userRolesSection"
  | "workflowSection"
  | "benefitsSection"
  | "technicalSpecsSection"
  | "callToActionSection"
  | "theme"
  | "lightTheme"
  | "darkTheme"
  | "blueTheme"
  | "greenTheme"
  | "purpleTheme"
  | "themeSettings"
  | "chooseTheme"
  | "applyTheme"
  | "themeApplied"
  | "projectAssignments"
  | "help"

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    welcome: "Welcome!",
    adminWelcome: "As an administrator, you can manage all projects and evaluations.",
    userWelcome:
      "Below you can see all projects assigned to you for evaluation. Click on the project name to view details.",
    adminTools: "Administrator Tools",
    adminToolsDesc: "Access administrative features and project management tools",
    adminDashboard: "Admin Dashboard",
    resultsDashboard: "Results Dashboard",
    allProjects: "All Projects",
    yourAssignedProjects: "Your Assigned Projects",
    filterByStatus: "Filter by status:",
    all: "All",
    pending: "Pending",
    inProgress: "In Progress",
    completed: "Completed",
    noProjects: "No projects found.",
    noProjectsAdmin: "No projects found. Create your first project below.",
    noProjectsUser: "You don't have any projects assigned to you yet.",
    noFilteredProjects: "You don't have any {status} evaluations.",
    howToAccess: "How to Access Your Evaluations",
    accessWays: "There are two ways to access your evaluation forms:",
    directLinks: "Direct links: Your administrator may send you direct links to your evaluation forms via email.",
    dashboardAccess:
      "Dashboard access: Once an administrator assigns you to a project, it will appear here automatically.",
    contactAdmin:
      "If you believe you should have access to a project that isn't showing up here, please contact your administrator.",
    statusLegend: "Evaluation Status Legend",
    pendingDesc: "Pending: You haven't started yet",
    inProgressDesc: "In Progress: You've started but not submitted",
    completedDesc: "Completed: You've submitted your evaluation",
    createNewProject: "Create a New Project",
    projectName: "Project Name",
    projectDescription: "Project Description",
    createProject: "Create Project",
    copyLink: "Copy Link",
    delete: "Delete",
    viewSubmission: "View Submission",
    continueEvaluation: "Continue Evaluation",
    yourRole: "Your role:",
    home: "Home",
    logout: "Logout",
    email: "Email address",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in...",
    register: "Register a new account",
    or: "Or",
    loading: "Loading...",
    error: "Error",
    permissionError:
      "You don't have permission to access these projects. Please check with your administrator for direct links to your evaluation forms.",
    language: "Language",
    english: "English",
    latvian: "Latvian",
    edit: "Edit",
    viewResults: "View Results",
    userManual: "User Manual",
    viewUserManual: "View User Manual",
    customizePdfSections: "Customize PDF Sections",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    savePreferences: "Save Preferences",
    preferencesSaved: "Preferences saved!",
    heroSection: "Hero Section",
    overviewSection: "Overview",
    keyFeaturesSection: "Key Features",
    userRolesSection: "User Roles",
    workflowSection: "Workflow",
    benefitsSection: "Benefits",
    technicalSpecsSection: "Technical Specifications",
    callToActionSection: "Call to Action",
    theme: "Theme",
    lightTheme: "Light",
    darkTheme: "Dark",
    blueTheme: "Blue",
    greenTheme: "Green",
    purpleTheme: "Purple",
    themeSettings: "Theme Settings",
    chooseTheme: "Choose a theme",
    applyTheme: "Apply Theme",
    themeApplied: "Theme applied successfully",
    projectAssignments: "Project Assignments",
    help: "Help",
  },
  lv: {
    welcome: "Laipni lūgti!",
    adminWelcome: "Kā administrators, jūs varat pārvaldīt visus projektus un novērtējumus.",
    userWelcome:
      "Zemāk jūs varat redzēt visus jums piešķirtos projektus novērtēšanai. Noklikšķiniet uz projekta nosaukuma, lai skatītu detaļas.",
    adminTools: "Administratora Rīki",
    adminToolsDesc: "Piekļūstiet administratīvajām funkcijām un projektu pārvaldības rīkiem",
    adminDashboard: "Administratora Panelis",
    resultsDashboard: "Rezultātu Panelis",
    allProjects: "Visi Projekti",
    yourAssignedProjects: "Jums Piešķirtie Projekti",
    filterByStatus: "Filtrēt pēc statusa:",
    all: "Visi",
    pending: "Gaida",
    inProgress: "Procesā",
    completed: "Pabeigts",
    noProjects: "Nav atrasti projekti.",
    noProjectsAdmin: "Nav atrasti projekti. Izveidojiet savu pirmo projektu zemāk.",
    noProjectsUser: "Jums vēl nav piešķirtu projektu.",
    noFilteredProjects: "Jums nav neviena {status} novērtējuma.",
    howToAccess: "Kā Piekļūt Jūsu Novērtējumiem",
    accessWays: "Ir divi veidi, kā piekļūt jūsu novērtējuma formām:",
    directLinks:
      "Tiešās saites: Jūsu administrators var nosūtīt jums tiešās saites uz jūsu novērtējuma formām e-pastā.",
    dashboardAccess: "Paneļa piekļuve: Kad administrators jums piešķir projektu, tas automātiski parādīsies šeit.",
    contactAdmin:
      "Ja jūs uzskatāt, ka jums vajadzētu būt piekļuvei projektam, kas šeit neparādās, lūdzu, sazinieties ar savu administratoru.",
    statusLegend: "Novērtējuma Statusa Apzīmējumi",
    pendingDesc: "Gaida: Jūs vēl neesat sācis",
    inProgressDesc: "Procesā: Jūs esat sācis, bet neesat iesniedzis",
    completedDesc: "Pabeigts: Jūs esat iesniedzis savu novērtējumu",
    createNewProject: "Izveidot Jaunu Projektu",
    projectName: "Projekta Nosaukums",
    projectDescription: "Projekta Apraksts",
    createProject: "Izveidot Projektu",
    copyLink: "Kopēt Saiti",
    delete: "Dzēst",
    viewSubmission: "Skatīt Iesniegumu",
    continueEvaluation: "Turpināt Novērtējumu",
    yourRole: "Jūsu loma:",
    home: "Sākums",
    logout: "Iziet",
    email: "E-pasta adrese",
    password: "Parole",
    signIn: "Ieiet",
    signingIn: "Ieiet...",
    register: "Reģistrēt jaunu kontu",
    or: "Vai",
    loading: "Ielāde...",
    error: "Kļūda",
    permissionError:
      "Jums nav piekļuves šiem projektiem. Lūdzu, sazinieties ar savu administratoru, lai iegūtu tiešās saites uz jūsu novērtējuma formām.",
    language: "Valoda",
    english: "Angļu",
    latvian: "Latviešu",
    edit: "Rediģēt",
    viewResults: "Skatīt Rezultātus",
    userManual: "Lietotāja Rokasgrāmata",
    viewUserManual: "Skatīt Lietotāja Rokasgrāmatu",
    customizePdfSections: "Pielāgot PDF Sadaļas",
    selectAll: "Atlasīt Visus",
    deselectAll: "Noņemt Visus",
    savePreferences: "Saglabāt Preferences",
    preferencesSaved: "Preferences saglabātas!",
    heroSection: "Galvenā Sadaļa",
    overviewSection: "Pārskats",
    keyFeaturesSection: "Galvenās Funkcijas",
    userRolesSection: "Lietotāju Lomas",
    workflowSection: "Darba Plūsma",
    benefitsSection: "Priekšrocības",
    technicalSpecsSection: "Tehniskās Specifikācijas",
    callToActionSection: "Aicinājums Rīkoties",
    theme: "Tēma",
    lightTheme: "Gaišs",
    darkTheme: "Tumšs",
    blueTheme: "Zils",
    greenTheme: "Zaļš",
    purpleTheme: "Violets",
    themeSettings: "Tēmas iestatījumi",
    chooseTheme: "Izvēlieties tēmu",
    applyTheme: "Pielietot tēmu",
    themeApplied: "Tēma veiksmīgi pielietota",
    projectAssignments: "Projektu Piešķiršana",
    help: "Palīdzība",
  },
}

export function getTranslation(lang: Language, key: TranslationKey, replacements?: Record<string, string>): string {
  let text = translations[lang][key] || key

  if (replacements) {
    Object.entries(replacements).forEach(([key, value]) => {
      text = text.replace(`{${key}}`, value)
    })
  }

  return text
}
