"use client"

import Link from "next/link"
import { HelpCircle, Download, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

// FAQ component with toggle functionality
function FAQ({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border pb-4">
      <button
        className="flex items-center justify-between w-full text-left py-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="font-medium">{question}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="mt-2 text-muted-foreground">{answer}</div>}
    </div>
  )
}

export default function HelpPage() {
  return (
    <div className="container-lg py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Help Center</h1>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          <div className="card">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Download className="h-6 w-6 text-primary mr-3" />
                <h2 className="text-xl font-semibold">Product Showcase</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                View and download a PDF overview of the LAPAS Evaluator Tool.
              </p>
              <Link href="/product-showcase" className="btn btn-outline">
                View Showcase
              </Link>
            </div>
          </div>
        </div>

        <div className="card mb-8">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <HelpCircle className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4 mt-6">
              <FAQ
                question="How do I create a new project?"
                answer="To create a new project, navigate to the dashboard and click on the 'Create Project' button. Fill in the required information such as project name, description, and evaluation criteria. Once completed, click 'Save' to create your project."
              />

              <FAQ
                question="How do I assign evaluators to a project?"
                answer="After creating a project, go to the project details page and click on 'Manage Evaluators'. You can then search for users by email or name and assign them as evaluators. Each evaluator will receive a notification about their assignment."
              />

              <FAQ
                question="How do I view evaluation results?"
                answer="Once all evaluators have completed their assessments, you can view the results by going to the 'Results' tab in the main navigation. Select the project you want to view, and you'll see a comprehensive dashboard with all evaluation data and aggregated scores."
              />

              <FAQ
                question="How do I export evaluation data?"
                answer="On the results page for any completed project, look for the 'Export' button in the top right corner. You can export the data in various formats including PDF, Excel, and CSV. The export includes all evaluation scores, comments, and aggregated results."
              />

              <FAQ
                question="What happens when a project evaluation is complete?"
                answer="When all assigned evaluators have submitted their evaluations, the project status automatically changes to 'Complete'. The project owner and all evaluators receive a notification, and the results become available in the Results dashboard."
              />

              <FAQ
                question="Can I modify a project after creating it?"
                answer="Yes, you can edit project details by going to the project page and clicking 'Edit Project'. However, once evaluations have started, you can only make limited changes to avoid affecting the evaluation process."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
