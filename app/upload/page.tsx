import { FileUpload } from '@/components/file-upload'
import Link from 'next/link'

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Attendance Data</h1>
          <p className="mt-2 text-sm text-gray-600">
            Upload an Excel file (.xlsx, .xls) or CSV file (.csv) with employee attendance data
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/upload"
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Upload Data
          </Link>
        </div>

        {/* Upload Component */}
        <FileUpload />

        {/* Sample File Download */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Sample Files</h3>
          <p className="text-sm text-green-800 mb-4">
            Download sample files to see the expected format:
          </p>
          <div className="flex gap-3 flex-wrap">
            <a
              href="/sample-attendance.xlsx?v=2"
              download="sample-attendance.xlsx"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Sample Excel
            </a>
            <a
              href="/sample-attendance.csv"
              download
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Sample CSV
            </a>
          </div>
          <p className="text-xs text-green-700 mt-3">
            Both files include exactly 100 records distributed across all 12 months (January-December) for year 2024 - optimized for fast processing
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">File Format</h3>
          <p className="text-sm text-blue-800 mb-3">
            Your Excel or CSV file should have the following columns (in order):
          </p>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>
              <strong>Employee Name/ID:</strong> The name or ID of the employee
            </li>
            <li>
              <strong>Date:</strong> The date of attendance (e.g., 2024-01-15 or 1/15/2024)
            </li>
            <li>
              <strong>In-Time:</strong> Check-in time (e.g., 10:00 AM or 10:00)
            </li>
            <li>
              <strong>Out-Time:</strong> Check-out time (e.g., 6:30 PM or 18:30)
            </li>
          </ol>
          <div className="mt-4 p-3 bg-white rounded border border-blue-200">
            <p className="text-xs text-gray-700 font-mono">
              Note: Missing in-time or out-time will be marked as leave. Sundays are automatically
              excluded from working days.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

