import { FileUpload } from '@/components/file-upload'
import Link from 'next/link'

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-6 shadow-lg shadow-blue-500/20">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Upload Attendance Data
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed font-light">
            Upload an Excel (.xlsx, .xls) or CSV (.csv) file with employee attendance data to get started
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8 flex gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow font-medium text-sm"
          >
            Dashboard
          </Link>
          <Link
            href="/upload"
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
          >
            Upload Data
          </Link>
        </div>

        {/* Upload Component */}
        <FileUpload />

        {/* Sample File Download */}
        <div className="mt-8 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/60 rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-emerald-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Sample Files
          </h3>
          <p className="text-sm text-emerald-800 mb-4 leading-relaxed">
            Download sample files to see the expected format:
          </p>
          <div className="flex gap-3 flex-wrap">
            <a
              href="/sample-attendance.xlsx?v=2"
              download="sample-attendance.xlsx"
              className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
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
              className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
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
          <p className="text-xs text-emerald-700 mt-4 leading-relaxed">
            Both files include exactly 100 records distributed across all 12 months (January-December) for year 2024 - optimized for fast processing
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            File Format
          </h3>
          <p className="text-sm text-blue-800 mb-4 leading-relaxed">
            Your Excel or CSV file should have the following columns (in order):
          </p>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-2 ml-2">
            <li>
              <strong className="font-semibold">Employee Name/ID:</strong> The name or ID of the employee
            </li>
            <li>
              <strong className="font-semibold">Date:</strong> The date of attendance (e.g., 2024-01-15 or 1/15/2024)
            </li>
            <li>
              <strong className="font-semibold">In-Time:</strong> Check-in time (e.g., 10:00 AM or 10:00)
            </li>
            <li>
              <strong className="font-semibold">Out-Time:</strong> Check-out time (e.g., 6:30 PM or 18:30)
            </li>
          </ol>
          <div className="mt-4 p-4 bg-white/80 rounded-xl border border-blue-200/60">
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong className="font-semibold">Note:</strong> Missing in-time or out-time will be marked as leave. Sundays are automatically excluded from working days.
            </p>
          </div>
        </div>
        
        {/* Copyright Notice */}
        <div className="mt-12 pt-8 border-t border-slate-200/60">
          <p className="text-center text-xs text-slate-500 font-light">
            © sensaishammi
          </p>
        </div>
      </div>
    </div>
  )
}

