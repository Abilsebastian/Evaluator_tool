import Link from "next/link"
import { Book, HelpCircle, Mail, FileText, Video, MessageSquare, ChevronRight } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="container-lg py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Help Center</h1>

        <div className="card mb-8">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Book className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-xl font-semibold">User Manual</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Our comprehensive user manual provides detailed instructions on how to use the LAPAS Evaluator Tool.
            </p>
            <Link href="/user-manual" className="btn btn-primary">
              View User Manual
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-primary mr-3" />
                <h2 className="text-xl font-semibold">Quick Start Guide</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Get started quickly with our step-by-step guide for new users.
              </p>
              <Link href="/quick-start" className="btn btn-outline">
                View Guide
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Video className="h-6 w-6 text-primary mr-3" />
                <h2 className="text-xl font-semibold">Video Tutorials</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Watch our video tutorials to learn how to use the platform effectively.
              </p>
              <Link href="/tutorials" className="btn btn-outline">
                Watch Tutorials
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
              <div className="border-b border-border pb-4">
                <button className="flex items-center justify-between w-full text-left">
                  <h3 className="font-medium">How do I create a new project?</h3>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="border-b border-border pb-4">
                <button className="flex items-center justify-between w-full text-left">
                  <h3 className="font-medium">How do I assign evaluators to a project?</h3>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="border-b border-border pb-4">
                <button className="flex items-center justify-between w-full text-left">
                  <h3 className="font-medium">How do I view evaluation results?</h3>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="border-b border-border pb-4">
                <button className="flex items-center justify-between w-full text-left">
                  <h3 className="font-medium">How do I export evaluation data?</h3>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <Link href="/faq" className="btn btn-outline mt-6">
              View All FAQs
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-xl font-semibold">Contact Support</h2>
            </div>
            <p className="text-muted-foreground mb-4">Need additional help? Our support team is ready to assist you.</p>

            <div className="flex items-center mt-4">
              <Mail className="h-5 w-5 text-muted-foreground mr-2" />
              <a href="mailto:support@lapas.lv" className="text-primary hover:underline">
                support@lapas.lv
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
