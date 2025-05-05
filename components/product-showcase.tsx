"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import {
  Download,
  CheckCircle,
  Users,
  BarChart,
  ClipboardList,
  Shield,
  Globe,
  Zap,
  FileText,
  PieChart,
  Layers,
  Settings,
} from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import React from "react"
import { translations } from "@/lib/translations"

export default function ProductShowcase() {
  const router = useRouter()
  const { language } = useLanguage()
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  // First, add a new state for tracking selected sections at the top of the component
  // Add this after the existing useState declarations
  const [selectedSections, setSelectedSections] = useState({
    hero: true,
    overview: true,
    keyFeatures: true,
    userRoles: true,
    workflow: true,
    benefits: true,
    technicalSpecs: true,
    callToAction: true,
  })

  // Add a function to handle section toggling
  const toggleSection = (section: string) => {
    setSelectedSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }))
  }

  // Add a function to select/deselect all sections
  const toggleAllSections = (value: boolean) => {
    setSelectedSections({
      hero: value,
      overview: value,
      keyFeatures: value,
      userRoles: value,
      workflow: value,
      benefits: value,
      technicalSpecs: value,
      callToAction: value,
    })
  }

  // Add a function to save preferences to localStorage
  const savePreferences = () => {
    localStorage.setItem("pdfSectionPreferences", JSON.stringify(selectedSections))
    alert(language === "en" ? translations.en.preferencesSaved : translations.lv.preferencesSaved)
  }

  // Add a function to load preferences from localStorage
  const loadPreferences = () => {
    const savedPreferences = localStorage.getItem("pdfSectionPreferences")
    if (savedPreferences) {
      setSelectedSections(JSON.parse(savedPreferences))
    }
  }

  // Add a useEffect to load preferences on component mount
  React.useEffect(() => {
    loadPreferences()
  }, [])

  // Now, modify the generatePDF function to only include selected sections
  // Update the generatePDF function to filter sections based on selectedSections
  const generatePDF = async () => {
    setGenerating(true)
    setProgress(10)

    try {
      const pdf = new jsPDF("p", "mm", "a4")
      const title =
        language === "en" ? "LAPAS Evaluator Tool - Product Overview" : "LAPAS Vērtēšanas Rīks - Produkta Pārskats"

      // Add title
      pdf.setFontSize(24)
      pdf.setTextColor(0, 102, 204) // Blue color for title
      pdf.text(title, 20, 20)

      setProgress(20)

      // Add subtitle
      pdf.setFontSize(14)
      pdf.setTextColor(100, 100, 100) // Gray color for subtitle
      const subtitle =
        language === "en"
          ? "A comprehensive solution for project evaluation and management"
          : "Visaptveroša projektu novērtēšanas un pārvaldības sistēma"
      pdf.text(subtitle, 20, 30)

      // Add date
      pdf.setFontSize(10)
      pdf.setTextColor(150, 150, 150)
      const date = new Date().toLocaleDateString()
      pdf.text(`Generated: ${date}`, 20, 40)

      setProgress(30)

      // Add company info
      pdf.setFontSize(10)
      pdf.setTextColor(0, 0, 0)
      pdf.text("LAPAS", 20, 50)
      pdf.text("Email: info@lapas.lv", 20, 55)
      pdf.text("Website: www.lapas.lv", 20, 60)

      // Add horizontal line
      pdf.setDrawColor(220, 220, 220)
      pdf.line(20, 65, 190, 65)

      setProgress(40)

      // Get all sections and filter based on selectedSections
      const showcaseElement = document.getElementById("product-showcase-content")
      if (!showcaseElement) return

      const allSections = showcaseElement.querySelectorAll(".showcase-section")
      const sectionsToInclude = Array.from(allSections).filter((section) => {
        const sectionName = section.getAttribute("data-section")
        return sectionName && selectedSections[sectionName as keyof typeof selectedSections]
      })

      let yOffset = 70

      for (let i = 0; i < sectionsToInclude.length; i++) {
        setProgress(40 + Math.floor((i / sectionsToInclude.length) * 50))

        const section = sectionsToInclude[i] as HTMLElement
        const canvas = await html2canvas(section, {
          scale: 1.5,
          useCORS: true,
          logging: false,
          allowTaint: true,
        })

        const imgData = canvas.toDataURL("image/jpeg", 0.9)
        const imgWidth = 170
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        if (yOffset + imgHeight > 270) {
          pdf.addPage()
          yOffset = 20
        }

        pdf.addImage(imgData, "JPEG", 20, yOffset, imgWidth, imgHeight)
        yOffset += imgHeight + 10
      }

      setProgress(90)

      // Add footer to all pages
      const pageCount = pdf.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text(
          `LAPAS Evaluator Tool - ${language === "en" ? "Confidential" : "Konfidenciāli"} - Page ${i} of ${pageCount}`,
          20,
          285,
        )
      }

      setProgress(95)

      // Save the PDF
      pdf.save(language === "en" ? "LAPAS_Evaluator_Tool_Overview.pdf" : "LAPAS_Vertesanas_Riks_Parskats.pdf")
      setProgress(100)

      // Reset after a delay
      setTimeout(() => {
        setGenerating(false)
        setProgress(0)
      }, 2000)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
      setGenerating(false)
      setProgress(0)
    }
  }

  // Now, add the customization panel UI between the progress bar and the content
  // Add this after the progress bar section and before the product-showcase-content div
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {language === "en" ? "LAPAS Evaluator Tool" : "LAPAS Vērtēšanas Rīks"}
        </h1>
        <button
          onClick={generatePDF}
          disabled={generating}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {generating ? (
            <>
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{language === "en" ? "Generating..." : "Ģenerē..."}</span>
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              <span>{language === "en" ? "Download PDF" : "Lejupielādēt PDF"}</span>
            </>
          )}
        </button>
      </div>

      {generating && (
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            {language === "en" ? "Generating PDF..." : "PDF ģenerēšana..."} {progress}%
          </p>
        </div>
      )}

      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {language === "en" ? "Customize PDF Sections" : "Pielāgot PDF Sadaļas"}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => toggleAllSections(true)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              {language === "en" ? "Select All" : "Atlasīt Visus"}
            </button>
            <button
              onClick={() => toggleAllSections(false)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              {language === "en" ? "Deselect All" : "Noņemt Visus"}
            </button>
            <button
              onClick={savePreferences}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
            >
              {language === "en" ? "Save Preferences" : "Saglabāt Preferences"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="section-hero"
              checked={selectedSections.hero}
              onChange={() => toggleSection("hero")}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="section-hero" className="text-sm font-medium text-gray-700">
              {language === "en" ? "Hero Section" : "Galvenā Sadaļa"}
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="section-overview"
              checked={selectedSections.overview}
              onChange={() => toggleSection("overview")}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="section-overview" className="text-sm font-medium text-gray-700">
              {language === "en" ? "Overview" : "Pārskats"}
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="section-keyFeatures"
              checked={selectedSections.keyFeatures}
              onChange={() => toggleSection("keyFeatures")}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="section-keyFeatures" className="text-sm font-medium text-gray-700">
              {language === "en" ? "Key Features" : "Galvenās Funkcijas"}
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="section-userRoles"
              checked={selectedSections.userRoles}
              onChange={() => toggleSection("userRoles")}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="section-userRoles" className="text-sm font-medium text-gray-700">
              {language === "en" ? "User Roles" : "Lietotāju Lomas"}
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="section-workflow"
              checked={selectedSections.workflow}
              onChange={() => toggleSection("workflow")}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="section-workflow" className="text-sm font-medium text-gray-700">
              {language === "en" ? "Workflow" : "Darba Plūsma"}
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="section-benefits"
              checked={selectedSections.benefits}
              onChange={() => toggleSection("benefits")}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="section-benefits" className="text-sm font-medium text-gray-700">
              {language === "en" ? "Benefits" : "Priekšrocības"}
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="section-technicalSpecs"
              checked={selectedSections.technicalSpecs}
              onChange={() => toggleSection("technicalSpecs")}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="section-technicalSpecs" className="text-sm font-medium text-gray-700">
              {language === "en" ? "Technical Specs" : "Tehniskās Specifikācijas"}
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="section-callToAction"
              checked={selectedSections.callToAction}
              onChange={() => toggleSection("callToAction")}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="section-callToAction" className="text-sm font-medium text-gray-700">
              {language === "en" ? "Call to Action" : "Aicinājums Rīkoties"}
            </label>
          </div>
        </div>
      </div>

      <div id="product-showcase-content" className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Hero Section */}
        <div
          className="showcase-section bg-gradient-to-r from-blue-600 to-blue-800 text-white p-12"
          data-section="hero"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">
              {language === "en" ? "LAPAS Evaluator Tool" : "LAPAS Vērtēšanas Rīks"}
            </h1>
            <p className="text-xl mb-8">
              {language === "en"
                ? "A comprehensive solution for project evaluation and management"
                : "Visaptveroša projektu novērtēšanas un pārvaldības sistēma"}
            </p>
            <div className="flex justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                <Users className="h-6 w-6" />
                <span>{language === "en" ? "Multi-user Platform" : "Vairāku lietotāju platforma"}</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                <BarChart className="h-6 w-6" />
                <span>{language === "en" ? "Advanced Analytics" : "Uzlabota analītika"}</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                <Globe className="h-6 w-6" />
                <span>{language === "en" ? "Multilingual" : "Daudzvalodu"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="showcase-section p-12" data-section="overview">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {language === "en" ? "System Overview" : "Sistēmas Pārskats"}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {language === "en"
                ? "The LAPAS Evaluator Tool is a web-based application designed to streamline the project evaluation process. It provides a structured framework for evaluating projects according to predefined criteria, collecting feedback from multiple evaluators, and analyzing results."
                : "LAPAS Vērtēšanas Rīks ir tīmekļa lietojumprogramma, kas izstrādāta, lai optimizētu projektu novērtēšanas procesu. Tā nodrošina strukturētu ietvaru projektu novērtēšanai saskaņā ar iepriekš noteiktiem kritērijiem, vāc atsauksmes no vairākiem vērtētājiem un analizē rezultātus."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  {language === "en" ? "Secure & Reliable" : "Droša un Uzticama"}
                </h3>
                <p className="text-gray-600">
                  {language === "en"
                    ? "Built with modern web technologies and secure authentication, ensuring your evaluation data is protected and accessible only to authorized users."
                    : "Veidota ar mūsdienu tīmekļa tehnoloģijām un drošu autentifikāciju, nodrošinot, ka jūsu novērtējuma dati ir aizsargāti un pieejami tikai pilnvarotiem lietotājiem."}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  {language === "en" ? "Efficient Workflow" : "Efektīva Darba Plūsma"}
                </h3>
                <p className="text-gray-600">
                  {language === "en"
                    ? "Streamlines the entire evaluation process from project creation to final results analysis, saving time and reducing administrative overhead."
                    : "Optimizē visu novērtēšanas procesu no projekta izveides līdz galīgo rezultātu analīzei, ietaupot laiku un samazinot administratīvo slogu."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="showcase-section bg-gray-50 p-12" data-section="keyFeatures">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {language === "en" ? "Key Features" : "Galvenās Funkcijas"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {language === "en" ? "Customizable Evaluation Forms" : "Pielāgojamas Novērtējuma Veidlapas"}
                </h3>
                <p className="text-gray-600">
                  {language === "en"
                    ? "Create evaluation forms with custom criteria, weightings, and rating scales tailored to your specific project requirements."
                    : "Izveidojiet novērtējuma veidlapas ar pielāgotiem kritērijiem, svērumiem un vērtēšanas skalām, kas pielāgotas jūsu konkrētajām projekta prasībām."}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {language === "en" ? "Multi-Evaluator Support" : "Vairāku Vērtētāju Atbalsts"}
                </h3>
                <p className="text-gray-600">
                  {language === "en"
                    ? "Assign multiple evaluators to each project, each with their own role and evaluation form, ensuring comprehensive assessment."
                    : "Piešķiriet vairākus vērtētājus katram projektam, katram ar savu lomu un novērtējuma veidlapu, nodrošinot visaptverošu novērtējumu."}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                  <BarChart className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {language === "en" ? "Advanced Analytics" : "Uzlabota Analītika"}
                </h3>
                <p className="text-gray-600">
                  {language === "en"
                    ? "Visualize evaluation results with interactive charts and graphs, making it easy to identify trends and insights."
                    : "Vizualizējiet novērtējuma rezultātus ar interaktīvām diagrammām un grafikiem, atvieglojot tendenču un ieskatu identificēšanu."}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {language === "en" ? "Comprehensive Documentation" : "Visaptveroša Dokumentācija"}
                </h3>
                <p className="text-gray-600">
                  {language === "en"
                    ? "Detailed user manual and help resources available in multiple languages to support all users."
                    : "Detalizēta lietotāja rokasgrāmata un palīdzības resursi pieejami vairākās valodās, lai atbalstītu visus lietotājus."}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                  <PieChart className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {language === "en" ? "Results Dashboard" : "Rezultātu Panelis"}
                </h3>
                <p className="text-gray-600">
                  {language === "en"
                    ? "Centralized dashboard for viewing all evaluation results, with filtering and export capabilities."
                    : "Centralizēts panelis visu novērtējumu rezultātu skatīšanai ar filtrēšanas un eksportēšanas iespējām."}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {language === "en" ? "Multilingual Support" : "Daudzvalodu Atbalsts"}
                </h3>
                <p className="text-gray-600">
                  {language === "en"
                    ? "Full support for multiple languages, including English and Latvian, with easy language switching."
                    : "Pilns atbalsts vairākām valodām, ieskaitot angļu un latviešu, ar vienkāršu valodas pārslēgšanu."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Roles Section */}
        <div className="showcase-section p-12" data-section="userRoles">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {language === "en" ? "User Roles & Permissions" : "Lietotāju Lomas un Atļaujas"}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {language === "en"
                ? "The LAPAS Evaluator Tool supports different user roles, each with specific permissions and capabilities:"
                : "LAPAS Vērtēšanas Rīks atbalsta dažādas lietotāju lomas, katrai ar specifiskām atļaujām un iespējām:"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  {language === "en" ? "Administrators" : "Administratori"}
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{language === "en" ? "Create and manage projects" : "Izveidot un pārvaldīt projektus"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {language === "en"
                        ? "Define evaluation criteria and weights"
                        : "Definēt novērtēšanas kritērijus un svarus"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {language === "en" ? "Assign evaluators to projects" : "Piešķirt vērtētājus projektiem"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {language === "en"
                        ? "View and analyze all evaluation results"
                        : "Skatīt un analizēt visus novērtējumu rezultātus"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{language === "en" ? "Export evaluation data" : "Eksportēt novērtējuma datus"}</span>
                  </li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  {language === "en" ? "Evaluators" : "Vērtētāji"}
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{language === "en" ? "Access assigned projects" : "Piekļūt piešķirtajiem projektiem"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{language === "en" ? "Complete evaluation forms" : "Aizpildīt novērtējuma veidlapas"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {language === "en"
                        ? "Save drafts of evaluations in progress"
                        : "Saglabāt novērtējumu melnrakstus procesā"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {language === "en" ? "Submit completed evaluations" : "Iesniegt pabeigtos novērtējumus"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {language === "en" ? "View their own evaluation history" : "Skatīt savu novērtējumu vēsturi"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Section */}
        <div className="showcase-section bg-gray-50 p-12" data-section="workflow">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {language === "en" ? "Evaluation Workflow" : "Novērtēšanas Darba Plūsma"}
            </h2>
            <div className="relative">
              {/* Step 1 */}
              <div className="flex mb-8">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {language === "en" ? "Project Creation" : "Projekta Izveide"}
                  </h3>
                  <p className="text-gray-600">
                    {language === "en"
                      ? "Administrators create new projects, define evaluation criteria, and set up the evaluation structure."
                      : "Administratori izveido jaunus projektus, definē novērtēšanas kritērijus un izveido novērtēšanas struktūru."}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex mb-8">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {language === "en" ? "Evaluator Assignment" : "Vērtētāju Piešķiršana"}
                  </h3>
                  <p className="text-gray-600">
                    {language === "en"
                      ? "Administrators assign evaluators to the project, each with specific roles."
                      : "Administratori piešķir vērtētājus projektam, katram ar specifiskām lomām."}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex mb-8">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  3
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {language === "en" ? "Evaluation Process" : "Novērtēšanas Process"}
                  </h3>
                  <p className="text-gray-600">
                    {language === "en"
                      ? "Evaluators access their assigned projects, complete evaluation forms, and submit their assessments."
                      : "Vērtētāji piekļūst saviem piešķirtajiem projektiem, aizpilda novērtējuma veidlapas un iesniedz savus novērtējumus."}
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex mb-8">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  4
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {language === "en" ? "Results Analysis" : "Rezultātu Analīze"}
                  </h3>
                  <p className="text-gray-600">
                    {language === "en"
                      ? "Administrators review and analyze evaluation results through the Results Dashboard."
                      : "Administratori pārskata un analizē novērtējumu rezultātus, izmantojot Rezultātu Paneli."}
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  5
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {language === "en" ? "Reporting & Export" : "Ziņošana un Eksports"}
                  </h3>
                  <p className="text-gray-600">
                    {language === "en"
                      ? "Generate reports and export evaluation data for further processing or presentation."
                      : "Ģenerējiet ziņojumus un eksportējiet novērtējuma datus tālākai apstrādei vai prezentācijai."}
                  </p>
                </div>
              </div>

              {/* Vertical line connecting steps */}
              <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-blue-200"></div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="showcase-section p-12" data-section="benefits">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {language === "en" ? "Benefits" : "Priekšrocības"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {language === "en" ? "For Organizations" : "Organizācijām"}
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {language === "en"
                        ? "Standardized evaluation process across all projects"
                        : "Standartizēts novērtēšanas process visos projektos"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {language === "en"
                        ? "Improved transparency and accountability"
                        : "Uzlabota caurskatāmība un atbildība"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {language === "en" ? "Data-driven decision making" : "Uz datiem balstīta lēmumu pieņemšana"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {language === "en" ? "Reduced administrative overhead" : "Samazināts administratīvais slogs"}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {language === "en" ? "For Evaluators" : "Vērtētājiem"}
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {language === "en"
                        ? "Clear evaluation criteria and guidelines"
                        : "Skaidri novērtēšanas kritēriji un vadlīnijas"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {language === "en" ? "Ability to save work in progress" : "Iespēja saglabāt darbu procesā"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{language === "en" ? "Intuitive user interface" : "Intuitīva lietotāja saskarne"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {language === "en"
                        ? "Comprehensive documentation and support"
                        : "Visaptveroša dokumentācija un atbalsts"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="showcase-section bg-gray-50 p-12" data-section="technicalSpecs">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {language === "en" ? "Technical Specifications" : "Tehniskās Specifikācijas"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-600" />
                  {language === "en" ? "Technology Stack" : "Tehnoloģiju Steks"}
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Next.js (React Framework)</li>
                  <li>• Firebase (Authentication & Database)</li>
                  <li>• Tailwind CSS (Styling)</li>
                  <li>• Chart.js (Data Visualization)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  {language === "en" ? "System Requirements" : "Sistēmas Prasības"}
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Modern web browser (Chrome, Firefox, Edge, Safari)</li>
                  <li>• Internet connection</li>
                  <li>• No special hardware requirements</li>
                  <li>• Works on desktop, tablet, and mobile devices</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
