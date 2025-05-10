"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, ClipboardCheck, Users, BarChart3, CheckCircle } from "lucide-react"
import LandingLanguageSwitcher from "@/components/landing-language-switcher"
import type { Language } from "@/lib/translations"

// Landing page translations
const translations = {
  en: {
    title: "Project Evaluator",
    subtitle: "A streamlined platform for evaluating projects with a systematic approach, made for LAPAS.",
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
    ctaDesc: "Join LAPAS's evaluation platform to streamline your project assessment process.",
    signInNow: "Sign In Now",
    allRightsReserved: "All rights reserved.",
    poweredBy: "Powered by",
  },
  lv: {
    title: "Projektu Vērtētājs",
    subtitle: "Efektīva platforma projektu novērtēšanai ar sistemātisku pieeju, izstrādāta LAPAS.",
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
    ctaDesc: "Pievienojieties LAPAS novērtēšanas platformai, lai optimizētu projektu novērtēšanas procesu.",
    signInNow: "Ieiet Tagad",
    allRightsReserved: "Visas tiesības aizsargātas.",
    poweredBy: "Nodrošina",
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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Left vertical accent bar - inspired by LAPAS website */}
      <div className="hidden md:block absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-b from-orange-600 to-red-600 z-10"></div>

      {/* Background curved lines - inspired by LAPAS website */}
      <div className="absolute left-0 top-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute left-0 bottom-0 w-1/2 h-3/4 border-t-[100px] border-l-[100px] rounded-tl-[300px] border-gray-300"></div>
        <div className="absolute left-[10%] bottom-[10%] w-1/2 h-3/4 border-t-[100px] border-l-[100px] rounded-tl-[300px] border-gray-300"></div>
        <div className="absolute left-[20%] bottom-[20%] w-1/2 h-3/4 border-t-[100px] border-l-[100px] rounded-tl-[300px] border-gray-300"></div>
      </div>

      {/* Header with Language Switcher */}
      <header className="bg-white dark:bg-gray-800 py-4 border-b border-gray-200 dark:border-gray-700 relative z-20">
        <div className="container mx-auto px-4 md:pl-12 flex justify-between items-center">
          <div className="flex items-center">
            {/* LAPAS-inspired logo */}
            <div className="flex items-center">
              <div className="w-10 h-10 relative">
                <svg viewBox="0 0 40 40" className="w-full h-full text-purple-700 dark:text-purple-500">
                  <path
                    fill="currentColor"
                    d="M20,0 C25,0 30,5 30,15 C30,25 25,30 20,30 C15,30 10,25 10,15 C10,5 15,0 20,0 Z M20,5 C17.5,5 15,8 15,15 C15,22 17.5,25 20,25 C22.5,25 25,22 25,15 C25,8 22.5,5 20,5 Z"
                  />
                  <path
                    fill="currentColor"
                    d="M15,20 L5,30 L5,35 L15,25 L15,20 Z M25,20 L35,30 L35,35 L25,25 L25,20 Z"
                  />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold text-purple-700 dark:text-purple-500">LAPAS</span>
            </div>
            <div className="h-6 mx-4 border-l border-gray-300 dark:border-gray-600"></div>
            <div className="text-lg font-medium text-gray-800 dark:text-gray-200">{t.title}</div>
          </div>
          <LandingLanguageSwitcher />
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 md:py-24 relative z-20">
        <div className="container mx-auto px-4 md:pl-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600 dark:from-purple-500 dark:to-indigo-400">
            {t.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">{t.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signin" className="btn btn-primary btn-lg">
              {t.signIn}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/register" className="btn btn-outline btn-lg">
              {t.register}
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white dark:bg-gray-800 relative z-20">
        <div className="container mx-auto px-4 md:pl-12">
          <h2 className="text-3xl font-bold text-center mb-12">{t.howItWorks}</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-purple-50 dark:bg-gray-700 rounded-lg p-6 text-center transition-transform hover:translate-y-[-5px]">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ClipboardCheck className="h-8 w-8 text-purple-700 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t.step1Title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.step1Desc}</p>
            </div>

            {/* Step 2 */}
            <div className="bg-purple-50 dark:bg-gray-700 rounded-lg p-6 text-center transition-transform hover:translate-y-[-5px]">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-700 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t.step2Title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.step2Desc}</p>
            </div>

            {/* Step 3 */}
            <div className="bg-purple-50 dark:bg-gray-700 rounded-lg p-6 text-center transition-transform hover:translate-y-[-5px]">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-purple-700 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t.step3Title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.step3Desc}</p>
            </div>

            {/* Step 4 */}
            <div className="bg-purple-50 dark:bg-gray-700 rounded-lg p-6 text-center transition-transform hover:translate-y-[-5px]">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-700 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t.step4Title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.step4Desc}</p>
            </div>
          </div>

          {/* Workflow Diagram */}
          <div className="mt-16 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-2xl font-semibold text-center mb-8">{t.evaluationProcess}</h3>
            <div className="relative">
              {/* Workflow line */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-purple-200 dark:bg-purple-800 transform -translate-y-1/2 z-0"></div>

              {/* Workflow steps */}
              <div className="flex flex-col md:flex-row justify-between relative z-10">
                <div className="flex flex-col items-center mb-8 md:mb-0">
                  <div className="bg-white dark:bg-gray-800 border-2 border-purple-500 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                    <span className="text-purple-700 dark:text-purple-400 font-bold">1</span>
                  </div>
                  <p className="text-center font-medium">{t.projectCreation}</p>
                </div>

                <div className="flex flex-col items-center mb-8 md:mb-0">
                  <div className="bg-white dark:bg-gray-800 border-2 border-purple-500 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                    <span className="text-purple-700 dark:text-purple-400 font-bold">2</span>
                  </div>
                  <p className="text-center font-medium">{t.evaluatorAssignment}</p>
                </div>

                <div className="flex flex-col items-center mb-8 md:mb-0">
                  <div className="bg-white dark:bg-gray-800 border-2 border-purple-500 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                    <span className="text-purple-700 dark:text-purple-400 font-bold">3</span>
                  </div>
                  <p className="text-center font-medium">{t.evaluationSubmission}</p>
                </div>

                <div className="flex flex-col items-center mb-8 md:mb-0">
                  <div className="bg-white dark:bg-gray-800 border-2 border-purple-500 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                    <span className="text-purple-700 dark:text-purple-400 font-bold">4</span>
                  </div>
                  <p className="text-center font-medium">{t.resultsAnalysis}</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="bg-white dark:bg-gray-800 border-2 border-purple-500 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                    <span className="text-purple-700 dark:text-purple-400 font-bold">5</span>
                  </div>
                  <p className="text-center font-medium">{t.projectCompletion}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="mt-16">
            <h3 className="text-2xl font-semibold text-center mb-8">{t.keyFeatures}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 shadow-sm">
                <h4 className="text-lg font-semibold mb-3 text-purple-700 dark:text-purple-400">
                  {t.threeEvaluatorTitle}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">{t.threeEvaluatorDesc}</p>
              </div>

              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 shadow-sm">
                <h4 className="text-lg font-semibold mb-3 text-purple-700 dark:text-purple-400">{t.resultsTitle}</h4>
                <p className="text-gray-600 dark:text-gray-300">{t.resultsDesc}</p>
              </div>

              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 shadow-sm">
                <h4 className="text-lg font-semibold mb-3 text-purple-700 dark:text-purple-400">{t.roleBasedTitle}</h4>
                <p className="text-gray-600 dark:text-gray-300">{t.roleBasedDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-purple-50 dark:bg-gray-700 relative z-20">
        <div className="container mx-auto px-4 md:pl-12 text-center">
          <h2 className="text-3xl font-bold mb-6">{t.ctaTitle}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">{t.ctaDesc}</p>
          <Link href="/signin" className="btn btn-primary btn-lg">
            {t.signInNow}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 relative z-20">
        <div className="container mx-auto px-4 md:pl-12 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <p className="text-gray-600 dark:text-gray-300">
              © {new Date().getFullYear()} {t.poweredBy}{" "}
              <span className="font-bold text-purple-700 dark:text-purple-400">LAPAS</span>. {t.allRightsReserved}
            </p>
          </div>
          <div className="flex items-center">
            <a
              href="https://www.lapas.lv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-700 dark:text-purple-400 hover:underline"
            >
              www.lapas.lv
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
