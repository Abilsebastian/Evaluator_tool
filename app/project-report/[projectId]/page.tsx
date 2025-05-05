import ProjectReport from "@/components/project-report"
import { Suspense } from "react"

export default function ProjectReportPage({ params }: { params: { projectId: string } }) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <ProjectReport projectId={params.projectId} />
    </Suspense>
  )
}
