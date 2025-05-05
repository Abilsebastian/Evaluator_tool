"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import {
  Book,
  Users,
  ClipboardList,
  CheckCircle,
  Home,
  Settings,
  Search,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Mail,
  ExternalLink,
  PlusCircle,
} from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export default function UserManual() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [activeSection, setActiveSection] = useState<string>("introduction")
  const [searchQuery, setSearchQuery] = useState("")

  // Function to generate PDF from the manual content
  const generatePDF = async () => {
    const manualElement = document.getElementById("user-manual-content")
    if (!manualElement) return

    try {
      const pdf = new jsPDF("p", "mm", "a4")
      const title =
        language === "en" ? "LAPAS Evaluator Tool - User Manual" : "LAPAS Vērtēšanas Rīks - Lietotāja Rokasgrāmata"

      // Add title
      pdf.setFontSize(20)
      pdf.text(title, 20, 20)
      pdf.setFontSize(12)

      // Get current date
      const date = new Date().toLocaleDateString()
      pdf.text(`Generated: ${date}`, 20, 30)

      // Add table of contents placeholder
      pdf.text("Table of Contents", 20, 40)
      pdf.text("1. Introduction", 25, 50)
      pdf.text("2. Getting Started", 25, 55)
      pdf.text("3. User Interface", 25, 60)
      pdf.text("4. Administrator Guide", 25, 65)
      pdf.text("5. Evaluator Guide", 25, 70)
      pdf.text("6. Troubleshooting", 25, 75)

      // Add page break
      pdf.addPage()

      // Convert HTML content to canvas and add to PDF
      const sections = manualElement.querySelectorAll(".manual-section")
      let yOffset = 20

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement
        const canvas = await html2canvas(section, {
          scale: 1.5,
          useCORS: true,
          logging: false,
          allowTaint: true,
        })

        const imgData = canvas.toDataURL("image/jpeg", 0.7)
        const imgWidth = 170
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        if (yOffset + imgHeight > 270) {
          pdf.addPage()
          yOffset = 20
        }

        pdf.addImage(imgData, "JPEG", 20, yOffset, imgWidth, imgHeight)
        yOffset += imgHeight + 10
      }

      // Save the PDF
      pdf.save(language === "en" ? "LAPAS_Evaluator_Tool_Manual.pdf" : "LAPAS_Vertesanas_Riks_Rokasgramata.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  // Filter sections based on search query
  const filterSections = (title: string, content: string) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return title.toLowerCase().includes(query) || content.toLowerCase().includes(query)
  }

  // Table of contents data
  const tableOfContents = [
    { id: "introduction", title: language === "en" ? "Introduction" : "Ievads" },
    { id: "getting-started", title: language === "en" ? "Getting Started" : "Darba Sākšana" },
    { id: "user-interface", title: language === "en" ? "User Interface" : "Lietotāja Saskarne" },
    { id: "admin-guide", title: language === "en" ? "Administrator Guide" : "Administratora Ceļvedis" },
    { id: "evaluator-guide", title: language === "en" ? "Evaluator Guide" : "Vērtētāja Ceļvedis" },
    { id: "troubleshooting", title: language === "en" ? "Troubleshooting" : "Problēmu Novēršana" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <Book className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">
                {language === "en" ? "User Manual" : "Lietotāja Rokasgrāmata"}
              </h2>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={language === "en" ? "Search manual..." : "Meklēt rokasgrāmatā..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <nav>
              <ul className="space-y-1">
                {tableOfContents.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveSection(item.id)
                        document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })
                      }}
                      className={`flex items-center w-full px-3 py-2 text-left rounded-md transition-colors ${
                        activeSection === item.id
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {activeSection === item.id ? (
                        <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
                      )}
                      <span>{item.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={generatePDF}
                className="flex items-center justify-center w-full gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>{language === "en" ? "Download PDF" : "Lejupielādēt PDF"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:w-3/4">
          <div className="bg-white rounded-lg shadow-md p-6" id="user-manual-content">
            {/* Introduction */}
            <section
              id="introduction"
              className={`manual-section mb-12 ${
                filterSections(
                  language === "en" ? "Introduction" : "Ievads",
                  language === "en"
                    ? "Welcome to the LAPAS Evaluator Tool, a comprehensive platform designed to streamline the project evaluation process."
                    : "Laipni lūgti LAPAS Vērtēšanas Rīkā, visaptverošā platformā, kas izstrādāta, lai optimizētu projektu novērtēšanas procesu.",
                )
                  ? ""
                  : "hidden"
              }`}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{language === "en" ? "Introduction" : "Ievads"}</h2>
              <div className="prose max-w-none">
                <p>
                  {language === "en"
                    ? "Welcome to the LAPAS Evaluator Tool, a comprehensive platform designed to streamline the project evaluation process. This tool allows administrators to create projects, assign evaluators, and collect structured feedback through customizable evaluation forms."
                    : "Laipni lūgti LAPAS Vērtēšanas Rīkā, visaptverošā platformā, kas izstrādāta, lai optimizētu projektu novērtēšanas procesu. Šis rīks ļauj administratoriem izveidot projektus, piešķirt vērtētājus un apkopot strukturētu atgriezenisko saiti, izmantojot pielāgojamas novērtēšanas veidlapas."}
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">
                  {language === "en" ? "Purpose of this Manual" : "Šīs Rokasgrāmatas Mērķis"}
                </h3>
                <p>
                  {language === "en"
                    ? "This user manual provides comprehensive guidance on how to use the LAPAS Evaluator Tool effectively. Whether you're an administrator setting up projects or an evaluator providing assessments, this guide will walk you through all the features and functionalities of the system."
                    : "Šī lietotāja rokasgrāmata sniedz visaptverošus norādījumus par to, kā efektīvi izmantot LAPAS Vērtēšanas Rīku. Neatkarīgi no tā, vai esat administrators, kas izveido projektus, vai vērtētājs, kas sniedz novērtējumus, šis ceļvedis jūs iepazīstinās ar visām sistēmas funkcijām un iespējām."}
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">
                  {language === "en" ? "System Overview" : "Sistēmas Pārskats"}
                </h3>
                <p>
                  {language === "en"
                    ? "The LAPAS Evaluator Tool is a web-based application that facilitates the evaluation of projects according to predefined criteria. The system supports multiple user roles, each with specific permissions and capabilities:"
                    : "LAPAS Vērtēšanas Rīks ir tīmekļa lietojumprogramma, kas atvieglo projektu novērtēšanu saskaņā ar iepriekš noteiktiem kritērijiem. Sistēma atbalsta vairākas lietotāju lomas, katrai ar specifiskām atļaujām un iespējām:"}
                </p>

                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>
                    <strong>{language === "en" ? "Administrators" : "Administratori"}</strong>:{" "}
                    {language === "en"
                      ? "Can create and manage projects, assign evaluators, and view evaluation results."
                      : "Var izveidot un pārvaldīt projektus, piešķirt vērtētājus un skatīt novērtējumu rezultātus."}
                  </li>
                  <li>
                    <strong>{language === "en" ? "Evaluators" : "Vērtētāji"}</strong>:{" "}
                    {language === "en"
                      ? "Can access assigned projects and complete evaluation forms."
                      : "Var piekļūt piešķirtajiem projektiem un aizpildīt novērtējuma veidlapas."}
                  </li>
                </ul>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-6">
                  <p className="text-blue-700">
                    {language === "en"
                      ? "The LAPAS Evaluator Tool is designed to be intuitive and user-friendly, with a clean interface that guides users through the evaluation process."
                      : "LAPAS Vērtēšanas Rīks ir izstrādāts, lai būtu intuitīvs un lietotājam draudzīgs, ar tīru saskarni, kas vada lietotājus caur novērtēšanas procesu."}
                  </p>
                </div>
              </div>
            </section>

            {/* Getting Started */}
            <section
              id="getting-started"
              className={`manual-section mb-12 ${
                filterSections(
                  language === "en" ? "Getting Started" : "Darba Sākšana",
                  language === "en"
                    ? "This section covers the basics of accessing and using the LAPAS Evaluator Tool."
                    : "Šajā sadaļā ir aprakstīti LAPAS Vērtēšanas Rīka piekļuves un lietošanas pamati.",
                )
                  ? ""
                  : "hidden"
              }`}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {language === "en" ? "Getting Started" : "Darba Sākšana"}
              </h2>
              <div className="prose max-w-none">
                <p>
                  {language === "en"
                    ? "This section covers the basics of accessing and using the LAPAS Evaluator Tool."
                    : "Šajā sadaļā ir aprakstīti LAPAS Vērtēšanas Rīka piekļuves un lietošanas pamati."}
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">
                  {language === "en" ? "System Requirements" : "Sistēmas Prasības"}
                </h3>
                <p>
                  {language === "en"
                    ? "The LAPAS Evaluator Tool is a web-based application that works on most modern browsers. For the best experience, we recommend using the latest version of:"
                    : "LAPAS Vērtēšanas Rīks ir tīmekļa lietojumprogramma, kas darbojas lielākajā daļā moderno pārlūkprogrammu. Lai iegūtu labāko pieredzi, mēs iesakām izmantot jaunāko versiju:"}
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Google Chrome</li>
                  <li>Mozilla Firefox</li>
                  <li>Microsoft Edge</li>
                  <li>Safari</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">
                  {language === "en" ? "Accessing the System" : "Piekļuve Sistēmai"}
                </h3>
                <p>
                  {language === "en"
                    ? "To access the LAPAS Evaluator Tool, open your web browser and navigate to the application URL provided by your organization."
                    : "Lai piekļūtu LAPAS Vērtēšanas Rīkam, atveriet savu tīmekļa pārlūkprogrammu un dodieties uz lietojumprogrammas URL, ko nodrošina jūsu organizācija."}
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">
                  {language === "en" ? "Registration" : "Reģistrācija"}
                </h3>
                <p>
                  {language === "en"
                    ? "If you're a new user, you'll need to register for an account:"
                    : "Ja esat jauns lietotājs, jums būs jāreģistrējas kontam:"}
                </p>
                <ol className="list-decimal pl-6 mt-2 space-y-3">
                  <li>
                    {language === "en"
                      ? 'Click on the "Register" button on the login page.'
                      : 'Noklikšķiniet uz pogas "Reģistrēties" pieteikšanās lapā.'}
                  </li>
                  <li>
                    {language === "en"
                      ? "Enter your email address and create a password."
                      : "Ievadiet savu e-pasta adresi un izveidojiet paroli."}
                  </li>
                  <li>
                    {language === "en"
                      ? 'Click "Register" to create your account.'
                      : 'Noklikšķiniet uz "Reģistrēties", lai izveidotu savu kontu.'}
                  </li>
                </ol>

                <div className="bg-gray-100 p-4 rounded-md mt-4 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <HelpCircle className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">{language === "en" ? "Note" : "Piezīme"}</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {language === "en"
                          ? "After registration, an administrator will need to assign you a role (Administrator or Evaluator) before you can access all features of the system."
                          : "Pēc reģistrācijas administratoram būs jāpiešķir jums loma (Administrators vai Vērtētājs), pirms jūs varēsiet piekļūt visām sistēmas funkcijām."}
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-6 mb-3">{language === "en" ? "Logging In" : "Pieteikšanās"}</h3>
                <p>
                  {language === "en"
                    ? "To log in to the LAPAS Evaluator Tool:"
                    : "Lai pieteiktos LAPAS Vērtēšanas Rīkā:"}
                </p>
                <ol className="list-decimal pl-6 mt-2 space-y-3">
                  <li>{language === "en" ? "Navigate to the login page." : "Dodieties uz pieteikšanās lapu."}</li>
                  <li>
                    {language === "en"
                      ? "Enter your email address and password."
                      : "Ievadiet savu e-pasta adresi un paroli."}
                  </li>
                  <li>{language === "en" ? 'Click "Sign In".' : 'Noklikšķiniet uz "Ieiet".'}</li>
                </ol>

                <div className="border border-gray-200 rounded-lg overflow-hidden mt-6">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h4 className="font-medium text-gray-700">
                      {language === "en" ? "Login Screen" : "Pieteikšanās Ekrāns"}
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="bg-white border border-gray-300 rounded-lg p-6 max-w-md mx-auto">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">
                          {language === "en" ? "Sign in to your account" : "Ieiet savā kontā"}
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {language === "en" ? "Email address" : "E-pasta adrese"}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                              user@example.com
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {language === "en" ? "Password" : "Parole"}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Settings className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                              ••••••••
                            </div>
                          </div>
                        </div>
                        <div>
                          <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600">
                            {language === "en" ? "Sign In" : "Ieiet"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-3">
                  {language === "en" ? "Changing Language" : "Valodas Maiņa"}
                </h3>
                <p>
                  {language === "en"
                    ? "The LAPAS Evaluator Tool supports both English and Latvian languages. To change the language:"
                    : "LAPAS Vērtēšanas Rīks atbalsta gan angļu, gan latviešu valodu. Lai mainītu valodu:"}
                </p>
                <ol className="list-decimal pl-6 mt-2 space-y-3">
                  <li>
                    {language === "en"
                      ? "Click on the language icon in the top navigation bar."
                      : "Noklikšķiniet uz valodas ikonas augšējā navigācijas joslā."}
                  </li>
                  <li>
                    {language === "en"
                      ? "Select your preferred language from the dropdown menu."
                      : "Izvēlieties vēlamo valodu no nolaižamās izvēlnes."}
                  </li>
                </ol>
                <p className="mt-2">
                  {language === "en"
                    ? "Your language preference will be saved for future sessions."
                    : "Jūsu valodas preference tiks saglabāta nākamajām sesijām."}
                </p>
              </div>
            </section>

            {/* User Interface */}
            <section
              id="user-interface"
              className={`manual-section mb-12 ${
                filterSections(
                  language === "en" ? "User Interface" : "Lietotāja Saskarne",
                  language === "en"
                    ? "This section provides an overview of the LAPAS Evaluator Tool user interface."
                    : "Šajā sadaļā ir sniegts pārskats par LAPAS Vērtēšanas Rīka lietotāja saskarni.",
                )
                  ? ""
                  : "hidden"
              }`}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {language === "en" ? "User Interface" : "Lietotāja Saskarne"}
              </h2>
              <div className="prose max-w-none">
                <p>
                  {language === "en"
                    ? "This section provides an overview of the LAPAS Evaluator Tool user interface."
                    : "Šajā sadaļā ir sniegts pārskats par LAPAS Vērtēšanas Rīka lietotāja saskarni."}
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">{language === "en" ? "Navigation" : "Navigācija"}</h3>
                <p>
                  {language === "en"
                    ? "The main navigation elements of the LAPAS Evaluator Tool include:"
                    : "LAPAS Vērtēšanas Rīka galvenie navigācijas elementi ietver:"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-gray-800">{language === "en" ? "Home Button" : "Sākuma Poga"}</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {language === "en"
                        ? "Located in the top navigation bar, this button returns you to the landing page."
                        : "Atrodas augšējā navigācijas joslā, šī poga atgriež jūs sākumlapā."}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-gray-800">
                        {language === "en" ? "Admin Dashboard" : "Administratora Panelis"}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {language === "en"
                        ? "For administrators, this provides access to project management features."
                        : "Administratoriem šis nodrošina piekļuvi projektu pārvaldības funkcijām."}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardList className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-gray-800">
                        {language === "en" ? "Projects List" : "Projektu Saraksts"}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {language === "en"
                        ? "Displays all projects you have access to, based on your role."
                        : "Parāda visus projektus, kuriem jums ir piekļuve, pamatojoties uz jūsu lomu."}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-gray-800">
                        {language === "en" ? "Results Dashboard" : "Rezultātu Panelis"}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {language === "en"
                        ? "For administrators, this provides access to evaluation results and analytics."
                        : "Administratoriem šis nodrošina piekļuvi novērtējumu rezultātiem un analītikai."}
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-3">{language === "en" ? "Landing Page" : "Sākumlapa"}</h3>
                <p>
                  {language === "en"
                    ? "The landing page is the first screen you see after logging in. It provides an overview of your assigned projects and quick access to key features."
                    : "Sākumlapa ir pirmais ekrāns, ko redzat pēc pieteikšanās. Tā sniedz pārskatu par jums piešķirtajiem projektiem un ātru piekļuvi galvenajām funkcijām."}
                </p>

                <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h4 className="font-medium text-gray-700">
                      {language === "en" ? "Landing Page Layout" : "Sākumlapas Izkārtojums"}
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="bg-white border border-gray-300 rounded-lg p-6">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                          {language === "en" ? "Welcome!" : "Laipni lūgti!"}
                        </h2>
                        <p className="text-gray-600">
                          {language === "en"
                            ? "Below you can see all projects assigned to you for evaluation."
                            : "Zemāk jūs varat redzēt visus jums piešķirtos projektus novērtēšanai."}
                        </p>
                      </div>

                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          {language === "en" ? "Your Assigned Projects" : "Jums Piešķirtie Projekti"}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-800 mb-2">Project Example</h4>
                            <p className="text-sm text-gray-600 mb-4">
                              {language === "en"
                                ? "This is an example project description."
                                : "Šis ir projekta apraksta piemērs."}
                            </p>
                            <div className="flex justify-end">
                              <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
                                {language === "en" ? "Continue Evaluation" : "Turpināt Novērtējumu"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-3">
                  {language === "en" ? "Admin Dashboard" : "Administratora Panelis"}
                </h3>
                <p>
                  {language === "en"
                    ? "The Admin Dashboard provides administrators with tools to manage projects, evaluators, and view results."
                    : "Administratora Panelis nodrošina administratoriem rīkus projektu pārvaldībai, vērtētāju piešķiršanai un rezultātu skatīšanai."}
                </p>

                <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h4 className="font-medium text-gray-700">
                      {language === "en" ? "Admin Dashboard Features" : "Administratora Paneļa Funkcijas"}
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                        <PlusCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-gray-800">
                            {language === "en" ? "Create Project" : "Izveidot Projektu"}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {language === "en"
                              ? "Create new evaluation projects with custom criteria."
                              : "Izveidojiet jaunus novērtēšanas projektus ar pielāgotiem kritērijiem."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-gray-800">
                            {language === "en" ? "Assign Evaluators" : "Piešķirt Vērtētājus"}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {language === "en"
                              ? "Assign evaluators to projects and manage their roles."
                              : "Piešķiriet vērtētājus projektiem un pārvaldiet viņu lomas."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-gray-800">
                            {language === "en" ? "View Results" : "Skatīt Rezultātus"}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {language === "en"
                              ? "Access comprehensive evaluation results and analytics."
                              : "Piekļūstiet visaptverošiem novērtējumu rezultātiem un analītikai."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-3">
                  {language === "en" ? "Evaluation Form" : "Novērtējuma Veidlapa"}
                </h3>
                <p>
                  {language === "en"
                    ? "The Evaluation Form is where evaluators provide their assessments of projects based on predefined criteria."
                    : "Novērtējuma Veidlapa ir vieta, kur vērtētāji sniedz savu projektu novērtējumu, pamatojoties uz iepriekš noteiktiem kritērijiem."}
                </p>

                <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h4 className="font-medium text-gray-700">
                      {language === "en" ? "Evaluation Form Layout" : "Novērtējuma Veidlapas Izkārtojums"}
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="bg-white border border-gray-300 rounded-lg p-6">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                          {language === "en"
                            ? "Evaluate Project: Example Project"
                            : "Novērtēt Projektu: Piemēra Projekts"}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {language === "en" ? "You are evaluating as: Evaluator 1" : "Jūs vērtējat kā: Vērtētājs 1"}
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">
                                {language === "en" ? "Criteria" : "Kritēriji"}
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b w-16">
                                {language === "en" ? "Max" : "Maks"}
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b w-20">
                                {language === "en" ? "Rating" : "Vērtējums"}
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">
                                {language === "en" ? "Justification" : "Pamatojums"}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-gray-100">
                              <td colSpan={4} className="px-4 py-2 font-medium text-gray-700">
                                {language === "en" ? "Project purpose and relevance" : "Projekta mērķis un nozīmīgums"}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 border-b text-sm">
                                {language === "en"
                                  ? "Contribute to the achievement of the objective of the competition"
                                  : "Veicina konkursa mērķa sasniegšanu"}
                              </td>
                              <td className="px-4 py-2 border-b text-sm text-center">5</td>
                              <td className="px-4 py-2 border-b text-sm">
                                <input
                                  type="number"
                                  className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                  min="0"
                                  max="5"
                                  defaultValue="0"
                                />
                              </td>
                              <td className="px-4 py-2 border-b text-sm">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                  placeholder={
                                    language === "en"
                                      ? "Add your justification here..."
                                      : "Pievienojiet savu pamatojumu šeit..."
                                  }
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-6 flex justify-end gap-3">
                        <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700">
                          {language === "en" ? "Save Draft" : "Saglabāt Melnrakstu"}
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
                          {language === "en" ? "Submit Evaluation" : "Iesniegt Novērtējumu"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Administrator Guide */}
            <section
              id="admin-guide"
              className={`manual-section mb-12 ${
                filterSections(
                  language === "en" ? "Administrator Guide" : "Administratora Ceļvedis",
                  language === "en"
                    ? "This section provides detailed instructions for administrators on how to manage projects, evaluators, and view results."
                    : "Šajā sadaļā ir sniegti detalizēti norādījumi administratoriem par to, kā pārvaldīt projektus, vērtētājus un skatīt rezultātus.",
                )
                  ? ""
                  : "hidden"
              }`}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {language === "en" ? "Administrator Guide" : "Administratora Ceļvedis"}
              </h2>
              <div className="prose max-w-none">
                <p>
                  {language === "en"
                    ? "This section provides detailed instructions for administrators on how to manage projects, evaluators, and view results."
                    : "Šajā sadaļā ir sniegti detalizēti norādījumi administratoriem par to, kā pārvaldīt projektus, vērtētājus un skatīt rezultātus."}
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">
                  {language === "en" ? "Creating a New Project" : "Jauna Projekta Izveidošana"}
                </h3>
                <p>
                  {language === "en"
                    ? "To create a new project in the LAPAS Evaluator Tool:"
                    : "Lai izveidotu jaunu projektu LAPAS Vērtēšanas Rīkā:"}
                </p>
                <ol className="list-decimal pl-6 mt-2 space-y-3">
                  <li>
                    {language === "en"
                      ? 'Navigate to the Admin Dashboard by clicking on the "Admin Dashboard" button in the landing page.'
                      : 'Dodieties uz Administratora Paneli, noklikšķinot uz pogas "Administratora Panelis" sākumlapā.'}
                  </li>
                  <li>
                    {language === "en"
                      ? 'Click on the "Create Project" button.'
                      : 'Noklikšķiniet uz pogas "Izveidot Projektu".'}
                  </li>
                  <li>
                    {language === "en"
                      ? "Choose whether to create a project from a template or from scratch."
                      : "Izvēlieties, vai izveidot projektu no veidnes vai no nulles."}
                  </li>
                  <li>
                    {language === "en"
                      ? "Fill in the project details, including name and description."
                      : "Aizpildiet projekta detaļas, ieskaitot nosaukumu un aprakstu."}
                  </li>
                  <li>
                    {language === "en"
                      ? "Assign evaluators to the project by selecting their email addresses from the dropdown menus."
                      : "Piešķiriet vērtētājus projektam, izvēloties viņu e-pasta adreses no nolaižamajām izvēlnēm."}
                  </li>
                  <li>
                    {language === "en"
                      ? "Define the evaluation criteria, including sections, weights, and individual criteria."
                      : "Definējiet novērtēšanas kritērijus, ieskaitot sadaļas, svarus un individuālos kritērijus."}
                  </li>
                  <li>{language === "en" ? 'Click "Save Project".' : 'Noklikšķiniet uz "Saglabāt Projektu".'}</li>
                </ol>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
                  <p className="text-yellow-700">
                    {language === "en"
                      ? "Tip: When creating a project from a template, you can save time by using predefined evaluation criteria that can be customized as needed."
                      : "Padoms: Veidojot projektu no veidnes, jūs varat ietaupīt laiku, izmantojot iepriekš definētus novērtēšanas kritērijus, kurus var pielāgot pēc vajadzības."}
                  </p>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-3">
                  {language === "en" ? "Managing Projects" : "Projektu Pārvaldība"}
                </h3>
                <p>
                  {language === "en"
                    ? "As an administrator, you can manage existing projects in the following ways:"
                    : "Kā administrators jūs varat pārvaldīt esošos projektus šādos veidos:"}
                </p>

                <h4 className="text-lg font-medium mt-4 mb-2">
                  {language === "en" ? "Editing a Project" : "Projekta Rediģēšana"}
                </h4>
                <ol className="list-decimal pl-6 mt-2 space-y-2">
                  <li>
                    {language === "en" ? "Navigate to the Admin Dashboard." : "Dodieties uz Administratora Paneli."}
                  </li>
                  <li>
                    {language === "en"
                      ? "Find the project you want to edit in the projects list."
                      : "Atrodiet projektu, ko vēlaties rediģēt, projektu sarakstā."}
                  </li>
                  <li>
                    {language === "en"
                      ? 'Click the "Edit" button next to the project.'
                      : 'Noklikšķiniet uz pogas "Rediģēt" blakus projektam.'}
                  </li>
                  <li>
                    {language === "en"
                      ? "Make your changes to the project details, evaluators, or criteria."
                      : "Veiciet izmaiņas projekta detaļās, vērtētājos vai kritērijos."}
                  </li>
                  <li>
                    {language === "en"
                      ? 'Click "Update Project" to save your changes.'
                      : 'Noklikšķiniet uz "Atjaunināt Projektu", lai saglabātu izmaiņas.'}
                  </li>
                </ol>

                <h4 className="text-lg font-medium mt-4 mb-2">
                  {language === "en" ? "Deleting a Project" : "Projekta Dzēšana"}
                </h4>
                <ol className="list-decimal pl-6 mt-2 space-y-2">
                  <li>
                    {language === "en" ? "Navigate to the Admin Dashboard." : "Dodieties uz Administratora Paneli."}
                  </li>
                  <li>
                    {language === "en"
                      ? "Find the project you want to delete in the projects list."
                      : "Atrodiet projektu, ko vēlaties dzēst, projektu sarakstā."}
                  </li>
                  <li>
                    {language === "en"
                      ? 'Click the "Delete" button next to the project.'
                      : 'Noklikšķiniet uz pogas "Dzēst" blakus projektam.'}
                  </li>
                  <li>
                    {language === "en"
                      ? "Confirm the deletion when prompted."
                      : "Apstipriniet dzēšanu, kad tiek prasīts."}
                  </li>
                </ol>

                <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-2">
                  <p className="text-red-700">
                    {language === "en"
                      ? "Warning: Deleting a project will permanently remove all associated data, including evaluations. This action cannot be undone."
                      : "Brīdinājums: Projekta dzēšana neatgriezeniski noņems visus saistītos datus, ieskaitot novērtējumus. Šo darbību nevar atsaukt."}
                  </p>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-3">
                  {language === "en" ? "Viewing Evaluation Results" : "Novērtējumu Rezultātu Skatīšana"}
                </h3>
                <p>
                  {language === "en"
                    ? "The Results Dashboard provides comprehensive analytics and visualizations of evaluation data:"
                    : "Rezultātu Panelis nodrošina visaptverošu novērtējuma datu analītiku un vizualizācijas:"}
                </p>
                <ol className="list-decimal pl-6 mt-2 space-y-3">
                  <li>
                    {language === "en"
                      ? 'Navigate to the Results Dashboard by clicking on the "Results Dashboard" button in the Admin Dashboard or landing page.'
                      : 'Dodieties uz Rezultātu Paneli, noklikšķinot uz pogas "Rezultātu Panelis" Administratora Panelī vai sākumlapā.'}
                  </li>
                  <li>
                    {language === "en"
                      ? "Select a project from the dropdown menu to view its evaluation results."
                      : "Izvēlieties projektu no nolaižamās izvēlnes, lai skatītu tā novērtējuma rezultātus."}
                  </li>
                  <li>
                    {language === "en"
                      ? "Explore the various charts and tables that display evaluation data, including:"
                      : "Izpētiet dažādas diagrammas un tabulas, kas attēlo novērtējuma datus, ieskaitot:"}
                    <ul className="list-disc pl-6 mt-1 space-y-1">
                      <li>
                        {language === "en"
                          ? "Overall score and completion status"
                          : "Kopējais rezultāts un pabeigšanas statuss"}
                      </li>
                      <li>{language === "en" ? "Section scores" : "Sadaļu rezultāti"}</li>
                      <li>{language === "en" ? "Evaluator comparison" : "Vērtētāju salīdzinājums"}</li>
                      <li>{language === "en" ? "Detailed evaluation results" : "Detalizēti novērtējuma rezultāti"}</li>
                    </ul>
                  </li>
                  <li>
                    {language === "en"
                      ? 'Use the "Export Results" button to download the evaluation data as a CSV file for further analysis.'
                      : 'Izmantojiet pogu "Eksportēt Rezultātus", lai lejupielādētu novērtējuma datus kā CSV failu tālākai analīzei.'}
                  </li>
                </ol>

                <div className="border border-gray-200 rounded-lg overflow-hidden mt-6">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h4 className="font-medium text-gray-700">
                      {language === "en" ? "Results Dashboard Example" : "Rezultātu Paneļa Piemērs"}
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="bg-white border border-gray-300 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-800 mb-3">
                            {language === "en" ? "Overall Score" : "Kopējais Rezultāts"}
                          </h5>
                          <div className="flex justify-center">
                            <div className="relative h-32 w-32">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl font-bold text-gray-800">78.5%</span>
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
                                  strokeDasharray="78.5, 100"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-800 mb-3">
                            {language === "en" ? "Completion Status" : "Pabeigšanas Statuss"}
                          </h5>
                          <div className="flex justify-center items-center h-32">
                            <div className="grid grid-cols-3 gap-4 w-full">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">2</div>
                                <div className="text-sm text-gray-600">
                                  {language === "en" ? "Completed" : "Pabeigti"}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">1</div>
                                <div className="text-sm text-gray-600">
                                  {language === "en" ? "In Progress" : "Procesā"}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-400">0</div>
                                <div className="text-sm text-gray-600">{language === "en" ? "Pending" : "Gaida"}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-3">
                          {language === "en" ? "Section Scores" : "Sadaļu Rezultāti"}
                        </h5>
                        <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center">
                          <p className="text-gray-500">
                            {language === "en"
                              ? "Chart visualization would appear here"
                              : "Šeit parādītos diagrammas vizualizācija"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Evaluator Guide */}
            <section
              id="evaluator-guide"
              className={`manual-section mb-12 ${
                filterSections(
                  language === "en" ? "Evaluator Guide" : "Vērtētāja Ceļvedis",
                  language === "en"
                    ? "This section provides detailed instructions for evaluators on how to complete evaluation forms."
                    : "Šajā sadaļā ir sniegti detalizēti norādījumi vērtētājiem par to, kā aizpildīt novērtējuma veidlapas.",
                )
                  ? ""
                  : "hidden"
              }`}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {language === "en" ? "Evaluator Guide" : "Vērtētāja Ceļvedis"}
              </h2>
              <div className="prose max-w-none">
                <p>
                  {language === "en"
                    ? "This section provides detailed instructions for evaluators on how to complete evaluation forms."
                    : "Šajā sadaļā ir sniegti detalizēti norādījumi vērtētājiem par to, kā aizpildīt novērtējuma veidlapas."}
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">
                  {language === "en" ? "Accessing Assigned Projects" : "Piekļuve Piešķirtajiem Projektiem"}
                </h3>
                <p>
                  {language === "en"
                    ? "As an evaluator, you can access projects that have been assigned to you in two ways:"
                    : "Kā vērtētājs jūs varat piekļūt jums piešķirtajiem projektiem divos veidos:"}
                </p>
                <ol className="list-decimal pl-6 mt-2 space-y-3">
                  <li>
                    <strong>{language === "en" ? "Through the Landing Page" : "Caur Sākumlapu"}</strong>:{" "}
                    {language === "en"
                      ? "After logging in, you will see all projects assigned to you on the landing page. Click on a project to access its evaluation form."
                      : "Pēc pieteikšanās jūs redzēsiet visus jums piešķirtos projektus sākumlapā. Noklikšķiniet uz projekta, lai piekļūtu tā novērtējuma veidlapai."}
                  </li>
                  <li>
                    <strong>{language === "en" ? "Through Direct Links" : "Caur Tiešajām Saitēm"}</strong>:{" "}
                    {language === "en"
                      ? "Administrators may send you direct links to evaluation forms via email. Clicking on these links will take you directly to the evaluation form for the specific project."
                      : "Administratori var nosūtīt jums tiešās saites uz novērtējuma veidlapām e-pastā. Noklikšķinot uz šīm saitēm, jūs tiksiet tieši uz konkrētā projekta novērtējuma veidlapu."}
                  </li>
                </ol>

                <h3 className="text-xl font-semibold mt-8 mb-3">
                  {language === "en" ? "Completing an Evaluation" : "Novērtējuma Aizpildīšana"}
                </h3>
                <p>
                  {language === "en"
                    ? "To complete an evaluation for an assigned project:"
                    : "Lai aizpildītu piešķirtā projekta novērtējumu:"}
                </p>
                <ol className="list-decimal pl-6 mt-2 space-y-3">
                  <li>
                    {language === "en"
                      ? "Access the evaluation form by clicking on the project from the landing page or using a direct link."
                      : "Piekļūstiet novērtējuma veidlapai, noklikšķinot uz projekta sākumlapā vai izmantojot tiešo saiti."}
                  </li>
                  <li>
                    {language === "en"
                      ? "Review the project details at the top of the form to understand what you are evaluating."
                      : "Pārskatiet projekta detaļas veidlapas augšdaļā, lai saprastu, ko jūs vērtējat."}
                  </li>
                  <li>
                    {language === "en"
                      ? 'For each criterion, provide a rating by entering a number in the "Rating" field. The rating should not exceed the maximum value shown.'
                      : 'Katram kritērijam sniedziet vērtējumu, ievadot skaitli laukā "Vērtējums". Vērtējums nedrīkst pārsniegt parādīto maksimālo vērtību.'}
                  </li>
                  <li>
                    {language === "en"
                      ? 'Provide a justification for each rating in the "Justification" field. This helps administrators understand the reasoning behind your evaluation.'
                      : 'Sniedziet pamatojumu katram vērtējumam laukā "Pamatojums". Tas palīdz administratoriem saprast jūsu novērtējuma pamatojumu.'}
                  </li>
                  <li>
                    {language === "en"
                      ? 'You can save your progress at any time by clicking the "Save Draft" button. This allows you to return and complete the evaluation later.'
                      : 'Jūs varat saglabāt savu progresu jebkurā laikā, noklikšķinot uz pogas "Saglabāt Melnrakstu". Tas ļauj jums atgriezties un pabeigt novērtējumu vēlāk.'}
                  </li>
                  <li>
                    {language === "en"
                      ? 'Once you have completed all ratings and justifications, click the "Submit Evaluation" button to finalize your evaluation.'
                      : 'Kad esat pabeidzis visus vērtējumus un pamatojumus, noklikšķiniet uz pogas "Iesniegt Novērtējumu", lai pabeigtu savu novērtējumu.'}
                  </li>
                </ol>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                  <p className="text-blue-700">
                    {language === "en"
                      ? "Note: Once you submit an evaluation, it cannot be changed unless an administrator allows you to make further edits. Make sure your evaluation is complete and accurate before submitting."
                      : "Piezīme: Kad esat iesniedzis novērtējumu, to nevar mainīt, ja vien administrators neatļauj veikt papildu labojumus. Pārliecinieties, ka jūsu novērtējums ir pilnīgs un precīzs pirms iesniegšanas."}
                  </p>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-3">
                  {language === "en" ? "Understanding Evaluation Status" : "Novērtējuma Statusa Izpratne"}
                </h3>
                <p>
                  {language === "en"
                    ? "Your evaluations can have one of three statuses:"
                    : "Jūsu novērtējumiem var būt viens no trim statusiem:"}
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-3">
                  <li>
                    <strong>{language === "en" ? "Pending" : "Gaida"}</strong>:{" "}
                    {language === "en"
                      ? "You have not started the evaluation yet."
                      : "Jūs vēl neesat sācis novērtējumu."}
                  </li>
                  <li>
                    <strong>{language === "en" ? "In Progress" : "Procesā"}</strong>:{" "}
                    {language === "en"
                      ? "You have started the evaluation but have not submitted it yet. Your progress is saved as a draft."
                      : "Jūs esat sācis novērtējumu, bet vēl neesat to iesniedzis. Jūsu progress ir saglabāts kā melnraksts."}
                  </li>
                  <li>
                    <strong>{language === "en" ? "Completed" : "Pabeigts"}</strong>:{" "}
                    {language === "en"
                      ? "You have submitted your evaluation."
                      : "Jūs esat iesniedzis savu novērtējumu."}
                  </li>
                </ul>

                <h3 className="text-xl font-semibold mt-8 mb-3">
                  {language === "en" ? "Best Practices for Evaluators" : "Labākās Prakses Vērtētājiem"}
                </h3>
                <p>
                  {language === "en"
                    ? "To provide effective evaluations, consider the following best practices:"
                    : "Lai sniegtu efektīvus novērtējumus, apsveriet šādas labākās prakses:"}
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-3">
                  <li>
                    {language === "en"
                      ? "Read all project materials thoroughly before beginning your evaluation."
                      : "Rūpīgi izlasiet visus projekta materiālus pirms novērtējuma sākšanas."}
                  </li>
                  <li>
                    {language === "en"
                      ? "Be objective and consistent in your ratings across all projects you evaluate."
                      : "Esiet objektīvs un konsekvents savos vērtējumos visos projektos, ko vērtējat."}
                  </li>
                  <li>
                    {language === "en"
                      ? "Provide detailed justifications that explain your reasoning for each rating."
                      : "Sniedziet detalizētus pamatojumus, kas izskaidro jūsu vērtējuma iemeslus katram kritērijam."}
                  </li>
                  <li>
                    {language === "en"
                      ? "Save your work frequently to avoid losing progress."
                      : "Bieži saglabājiet savu darbu, lai izvairītos no progresa zaudēšanas."}
                  </li>
                  <li>
                    {language === "en"
                      ? "Complete evaluations by the deadline provided by the administrator."
                      : "Pabeidziet novērtējumus līdz administratora norādītajam termiņam."}
                  </li>
                </ul>
              </div>
            </section>

            {/* Troubleshooting */}
            <section
              id="troubleshooting"
              className={`manual-section mb-12 ${
                filterSections(
                  language === "en" ? "Troubleshooting" : "Problēmu Novēršana",
                  language === "en"
                    ? "This section provides solutions to common issues you may encounter while using the LAPAS Evaluator Tool."
                    : "Šajā sadaļā ir sniegti risinājumi biežākajām problēmām, ar kurām jūs varat saskarties, izmantojot LAPAS Vērtēšanas Rīku.",
                )
                  ? ""
                  : "hidden"
              }`}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {language === "en" ? "Troubleshooting" : "Problēmu Novēršana"}
              </h2>
              <div className="prose max-w-none">
                <p>
                  {language === "en"
                    ? "This section provides solutions to common issues you may encounter while using the LAPAS Evaluator Tool."
                    : "Šajā sadaļā ir sniegti risinājumi biežākajām problēmām, ar kurām jūs varat saskarties, izmantojot LAPAS Vērtēšanas Rīku."}
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">
                  {language === "en" ? "Login Issues" : "Pieteikšanās Problēmas"}
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">
                      {language === "en" ? "I can't log in to my account" : "Es nevaru pieteikties savā kontā"}
                    </h4>
                    <p className="text-gray-600 mb-2">
                      {language === "en"
                        ? "If you're having trouble logging in, try the following:"
                        : "Ja jums ir problēmas ar pieteikšanos, mēģiniet sekojošo:"}
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      <li>
                        {language === "en"
                          ? "Make sure you're using the correct email address and password."
                          : "Pārliecinieties, ka izmantojat pareizo e-pasta adresi un paroli."}
                      </li>
                      <li>
                        {language === "en"
                          ? "Check if Caps Lock is turned on."
                          : "Pārbaudiet, vai nav ieslēgts Caps Lock."}
                      </li>
                      <li>
                        {language === "en"
                          ? "Clear your browser cache and cookies, then try again."
                          : "Notīriet pārlūkprogrammas kešatmiņu un sīkdatnes, pēc tam mēģiniet vēlreiz."}
                      </li>
                      <li>
                        {language === "en"
                          ? "Try using a different browser."
                          : "Mēģiniet izmantot citu pārlūkprogrammu."}
                      </li>
                      <li>
                        {language === "en"
                          ? 'If you\'ve forgotten your password, use the "Forgot Password" link on the login page to reset it.'
                          : 'Ja esat aizmirsis paroli, izmantojiet saiti "Aizmirsu Paroli" pieteikšanās lapā, lai to atiestatītu.'}
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">
                      {language === "en"
                        ? "I registered but can't access all features"
                        : "Es reģistrējos, bet nevaru piekļūt visām funkcijām"}
                    </h4>
                    <p className="text-gray-600">
                      {language === "en"
                        ? "After registration, an administrator needs to assign you a role (Administrator or Evaluator) before you can access all features. Contact your organization's administrator if you need access."
                        : "Pēc reģistrācijas administratoram ir jāpiešķir jums loma (Administrators vai Vērtētājs), pirms jūs varat piekļūt visām funkcijām. Sazinieties ar savas organizācijas administratoru, ja jums nepieciešama piekļuve."}
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-3">
                  {language === "en" ? "Evaluation Form Issues" : "Novērtējuma Veidlapas Problēmas"}
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">
                      {language === "en" ? "My changes aren't being saved" : "Manas izmaiņas netiek saglabātas"}
                    </h4>
                    <p className="text-gray-600 mb-2">
                      {language === "en"
                        ? "If your evaluation form changes aren't being saved:"
                        : "Ja jūsu novērtējuma veidlapas izmaiņas netiek saglabātas:"}
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      <li>
                        {language === "en"
                          ? 'Make sure you\'re clicking the "Save Draft" button after making changes.'
                          : 'Pārliecinieties, ka noklikšķināt uz pogas "Saglabāt Melnrakstu" pēc izmaiņu veikšanas.'}
                      </li>
                      <li>
                        {language === "en"
                          ? "Check your internet connection to ensure you're online."
                          : "Pārbaudiet savu interneta savienojumu, lai pārliecinātos, ka esat tiešsaistē."}
                      </li>
                      <li>
                        {language === "en"
                          ? "Try refreshing the page and making your changes again."
                          : "Mēģiniet atsvaidzināt lapu un veikt izmaiņas vēlreiz."}
                      </li>
                      <li>
                        {language === "en"
                          ? "If you've already submitted the evaluation, you cannot make changes unless an administrator allows it."
                          : "Ja esat jau iesniedzis novērtējumu, jūs nevarat veikt izmaiņas, ja vien administrators to neatļauj."}
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">
                      {language === "en" ? "I can't submit my evaluation" : "Es nevaru iesniegt savu novērtējumu"}
                    </h4>
                    <p className="text-gray-600 mb-2">
                      {language === "en"
                        ? "If you're having trouble submitting your evaluation:"
                        : "Ja jums ir problēmas ar novērtējuma iesniegšanu:"}
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      <li>
                        {language === "en"
                          ? "Make sure all required fields are filled out."
                          : "Pārliecinieties, ka visi obligātie lauki ir aizpildīti."}
                      </li>
                      <li>
                        {language === "en"
                          ? "Check that all ratings are within the allowed range (not exceeding the maximum value)."
                          : "Pārbaudiet, vai visi vērtējumi ir atļautajā diapazonā (nepārsniedz maksimālo vērtību)."}
                      </li>
                      <li>
                        {language === "en"
                          ? "Try saving your work as a draft first, then submitting."
                          : "Mēģiniet vispirms saglabāt savu darbu kā melnrakstu, pēc tam iesniegt."}
                      </li>
                      <li>
                        {language === "en"
                          ? "Check your internet connection and try again."
                          : "Pārbaudiet savu interneta savienojumu un mēģiniet vēlreiz."}
                      </li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-3">
                  {language === "en" ? "Technical Issues" : "Tehniskās Problēmas"}
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">
                      {language === "en"
                        ? "The application is slow or unresponsive"
                        : "Lietojumprogramma ir lēna vai nereaģē"}
                    </h4>
                    <p className="text-gray-600 mb-2">
                      {language === "en"
                        ? "If the LAPAS Evaluator Tool is running slowly or not responding:"
                        : "Ja LAPAS Vērtēšanas Rīks darbojas lēni vai nereaģē:"}
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      <li>{language === "en" ? "Try refreshing the page." : "Mēģiniet atsvaidzināt lapu."}</li>
                      <li>
                        {language === "en"
                          ? "Clear your browser cache and cookies."
                          : "Notīriet pārlūkprogrammas kešatmiņu un sīkdatnes."}
                      </li>
                      <li>
                        {language === "en"
                          ? "Close other browser tabs and applications to free up system resources."
                          : "Aizveriet citas pārlūkprogrammas cilnes un lietojumprogrammas, lai atbrīvotu sistēmas resursus."}
                      </li>
                      <li>
                        {language === "en"
                          ? "Try using a different browser."
                          : "Mēģiniet izmantot citu pārlūkprogrammu."}
                      </li>
                      <li>
                        {language === "en"
                          ? "Check your internet connection speed."
                          : "Pārbaudiet sava interneta savienojuma ātrumu."}
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">
                      {language === "en" ? "I'm seeing error messages" : "Es redzu kļūdu ziņojumus"}
                    </h4>
                    <p className="text-gray-600 mb-2">
                      {language === "en"
                        ? "If you encounter error messages while using the application:"
                        : "Ja jūs sastopat kļūdu ziņojumus, izmantojot lietojumprogrammu:"}
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      <li>
                        {language === "en"
                          ? "Take note of the exact error message text."
                          : "Pierakstiet precīzo kļūdas ziņojuma tekstu."}
                      </li>
                      <li>
                        {language === "en"
                          ? "Try refreshing the page and attempting the action again."
                          : "Mēģiniet atsvaidzināt lapu un mēģināt darbību vēlreiz."}
                      </li>
                      <li>
                        {language === "en"
                          ? "Check if you have the necessary permissions for the action you're trying to perform."
                          : "Pārbaudiet, vai jums ir nepieciešamās atļaujas darbībai, ko mēģināt veikt."}
                      </li>
                      <li>
                        {language === "en"
                          ? "Contact support with the error message details if the problem persists."
                          : "Sazinieties ar atbalstu, norādot kļūdas ziņojuma detaļas, ja problēma saglabājas."}
                      </li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-3">
                  {language === "en" ? "Getting Help" : "Palīdzības Saņemšana"}
                </h3>
                <p>
                  {language === "en"
                    ? "If you need additional assistance with the LAPAS Evaluator Tool, you can:"
                    : "Ja jums nepieciešama papildu palīdzība ar LAPAS Vērtēšanas Rīku, jūs varat:"}
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-3">
                  <li>
                    {language === "en"
                      ? "Contact your organization's administrator for help with access issues or questions about specific projects."
                      : "Sazinieties ar savas organizācijas administratoru, lai saņemtu palīdzību ar piekļuves problēmām vai jautājumiem par konkrētiem projektiem."}
                  </li>
                  <li>
                    {language === "en"
                      ? "Email technical support at support@lapas.lv for assistance with technical issues."
                      : "Nosūtiet e-pastu tehniskajam atbalstam uz support@lapas.lv, lai saņemtu palīdzību ar tehniskām problēmām."}
                  </li>
                  <li>
                    {language === "en"
                      ? "Refer to this user manual for guidance on using the system."
                      : "Skatiet šo lietotāja rokasgrāmatu, lai saņemtu norādījumus par sistēmas izmantošanu."}
                  </li>
                </ul>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6 flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">
                      {language === "en" ? "Contact Support" : "Sazināties ar Atbalstu"}
                    </h4>
                    <p className="text-blue-700 mb-4">
                      {language === "en"
                        ? "For technical support or questions about the LAPAS Evaluator Tool, please contact:"
                        : "Tehniskajam atbalstam vai jautājumiem par LAPAS Vērtēšanas Rīku, lūdzu, sazinieties:"}
                    </p>
                    <div className="flex items-center gap-2">
                      <a
                        href="mailto:support@lapas.lv"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <span>support@lapas.lv</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
