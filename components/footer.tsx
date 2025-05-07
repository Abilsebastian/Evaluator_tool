export default function Footer() {
  return (
    <footer className="py-4 px-6 border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} LAPAS Evaluator</div>
        <div className="mt-2 md:mt-0 text-sm text-gray-500 dark:text-gray-400">Version 1.0.0</div>
      </div>
    </footer>
  )
}
