"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, ClipboardCheck, Users, BarChart3, Star, Shield, Zap } from "lucide-react"
import LandingLanguageSwitcher from "@/components/landing-language-switcher"
import type { Language } from "@/lib/translations"

// Landing page translations
const translations = {
  en: {
    title: "Project Evaluator",
    subtitle: "A streamlined platform for evaluating projects with a systematic approach.",
    signIn: "Sign In",
    register: "Register",
    howItWorks: "How It Works",
    step1Title: "1. Create Project",
    step1Desc: "Administrators create projects and define evaluation criteria.",
    step2Title: "2. Assign Evaluators",
    step2Desc: "Three evaluators are assigned to provide balanced assessment.",
    step3Title: "3. Evaluate",
    step3Desc: "Evaluators rate projects on various criteria and provide justifications.",
    step4Title: "4. View Results",
    step4Desc: "After all evaluations are complete, view comprehensive results and insights.",
    evaluationProcess: "Evaluation Process",
    projectCreation: "Project Creation",
    evaluatorAssignment: "Evaluator Assignment",
    evaluationSubmission: "Evaluation Submission",
    resultsAnalysis: "Results Analysis",
    projectCompletion: "Project Completion",
    keyFeatures: "Key Features",
    threeEvaluatorTitle: "Three-Evaluator System",
    threeEvaluatorDesc: "Projects require three independent evaluations to ensure balanced and fair assessment.",
    resultsTitle: "Comprehensive Results",
    resultsDesc: "View detailed results with visualizations, comparisons, and aggregated scores.",
    roleBasedTitle: "Role-Based Access",
    roleBasedDesc: "Different permissions for administrators and evaluators to maintain evaluation integrity.",
    ctaTitle: "Ready to Get Started?",
    ctaDesc: "Join our evaluation platform to streamline your project assessment process.",
    signInNow: "Sign In Now",
    allRightsReserved: "All rights reserved.",
    heroTagline: "Evaluate Projects with Precision and Fairness",
    heroSubtitle: "A collaborative platform that brings structure and transparency to the project evaluation process.",
    featureTitle1: "Fair & Balanced",
    featureDesc1: "Three-evaluator system ensures unbiased assessment of all projects.",
    featureTitle2: "Comprehensive Analytics",
    featureDesc2: "Detailed visualizations and insights from aggregated evaluations.",
    featureTitle3: "Streamlined Process",
    featureDesc3: "Structured workflow from project creation to final assessment.",
  },
  lv: {
    title: "Projektu Vērtētājs",
    subtitle: "Efektīva platforma projektu novērtēšanai ar sistemātisku pieeju.",
    signIn: "Ieiet",
    register: "Reģistrēties",
    howItWorks: "Kā Tas Darbojas",
    step1Title: "1. Izveidot Projektu",
    step1Desc: "Administratori izveido projektus un definē novērtēšanas kritērijus.",
    step2Title: "2. Piešķirt Vērtētājus",
    step2Desc: "Tiek piešķirti trīs vērtētāji, lai nodrošinātu līdzsvarotu novērtējumu.",
    step3Title: "3. Novērtēt",
    step3Desc: "Vērtētāji novērtē projektus pēc dažādiem kritērijiem un sniedz pamatojumus.",
    step4Title: "4. Skatīt Rezultātus",
    step4Desc: "Pēc visu novērtējumu pabeigšanas skatiet visaptverošus rezultātus un ieskatus.",
    evaluationProcess: "Novērtēšanas Process",
    projectCreation: "Projekta Izveide",
    evaluatorAssignment: "Vērtētāju Piešķiršana",
    evaluationSubmission: "Novērtējuma Iesniegšana",
    resultsAnalysis: "Rezultātu Analīze",
    projectCompletion: "Projekta Pabeigšana",
    keyFeatures: "Galvenās Funkcijas",
    threeEvaluatorTitle: "Trīs Vērtētāju Sistēma",
    threeEvaluatorDesc:
      "Projektiem nepieciešami trīs neatkarīgi novērtējumi, lai nodrošinātu līdzsvarotu un godīgu novērtējumu.",
    resultsTitle: "Visaptveroši Rezultāti",
    resultsDesc: "Skatiet detalizētus rezultātus ar vizualizācijām, salīdzinājumiem un apkopotiem rādītājiem.",
    roleBasedTitle: "Uz Lomām Balstīta Piekļuve",
    roleBasedDesc: "Dažādas atļaujas administratoriem un vērtētājiem, lai saglabātu novērtēšanas integritāti.",
    ctaTitle: "Gatavi Sākt?",
    ctaDesc: "Pievienojieties mūsu novērtēšanas platformai, lai optimizētu projektu novērtēšanas procesu.",
    signInNow: "Ieiet Tagad",
    allRightsReserved: "Visas tiesības aizsargātas.",
    heroTagline: "Novērtējiet Projektus ar Precizitāti un Godīgumu",
    heroSubtitle: "Sadarbības platforma, kas projektu novērtēšanas procesam piešķir struktūru un caurskatāmību.",
    featureTitle1: "Godīgs un Līdzsvarots",
    featureDesc1: "Trīs vērtētāju sistēma nodrošina objektīvu visu projektu novērtējumu.",
    featureTitle2: "Visaptveroša Analītika",
    featureDesc2: "Detalizētas vizualizācijas un ieskati no apkopotiem novērtējumiem.",
    featureTitle3: "Optimizēts Process",
    featureDesc3: "Strukturēta darba gaita no projekta izveides līdz galīgajam novērtējumam.",
  },
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Try to get the language from localStorage
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "lv")) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Use the translations based on the selected language
  const t = translations[language]

  if (!mounted) {
    // Return a simple loading state or the English version
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header with Language Switcher */}
      <header className="bg-white dark:bg-gray-900 py-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="text-xl font-bold text-purple-600 dark:text-purple-500">{t.title}</div>
          <div className="flex items-center space-x-4">
            <LandingLanguageSwitcher />
            <div className="hidden sm:flex space-x-2">
              <Link
                href="/signin"
                className="px-4 py-2 rounded-md text-sm font-medium border border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-500 dark:text-purple-500 dark:hover:bg-purple-900/30 transition-colors"
              >
                {t.signIn}
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 transition-colors"
              >
                {t.register}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 dark:bg-purple-900/20 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute top-60 -left-20 w-60 h-60 bg-indigo-200 dark:bg-indigo-900/20 rounded-full opacity-50 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-400">
              {t.heroTagline}
            </h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signin"
                className="px-6 py-3 rounded-lg text-base font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl hover:shadow-purple-500/20"
              >
                {t.signIn}
                <ArrowRight className="ml-2 h-5 w-5 inline" />
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 rounded-lg text-base font-medium border border-gray-300 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {t.register}
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t.featureTitle1}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.featureDesc1}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t.featureTitle2}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.featureDesc2}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t.featureTitle3}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.featureDesc3}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{t.howItWorks}</h2>
            <div className="h-1 w-20 bg-purple-600 mx-auto"></div>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 transform -translate-y-1/2"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 relative">
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  <ClipboardCheck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t.step1Title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t.step1Desc}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 relative">
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t.step2Title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t.step2Desc}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 relative">
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t.step3Title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t.step3Desc}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 relative">
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">
                    4
                  </span>
                  <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t.step4Title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t.step4Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">{t.ctaTitle}</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">{t.ctaDesc}</p>
          <Link
            href="/signin"
            className="px-8 py-4 rounded-lg text-base font-medium bg-white text-purple-600 hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
          >
            {t.signInNow}
            <ArrowRight className="ml-2 h-5 w-5 inline" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} {t.title}. {t.allRightsReserved}
            </p>
            <div className="flex items-center space-x-4">
              <Link
                href="/signin"
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-500"
              >
                {t.signIn}
              </Link>
              <Link
                href="/register"
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-500"
              >
                {t.register}
              </Link>
              <Link
                href="/help"
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-500"
              >
                Help
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
