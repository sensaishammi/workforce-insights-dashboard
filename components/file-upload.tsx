'use client'

import { useState, useTransition } from 'react'
import { processExcelFile, saveProcessedData } from '@/actions/excel-processing'

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (
        selectedFile.name.endsWith('.xlsx') || 
        selectedFile.name.endsWith('.xls') || 
        selectedFile.name.endsWith('.csv')
      ) {
        setFile(selectedFile)
        setMessage(null)
      } else {
        setMessage({ type: 'error', text: 'Please select an Excel file (.xlsx, .xls) or CSV file (.csv)' })
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file' })
      return
    }

    startTransition(async () => {
      try {
        setMessage(null)

        // Use FormData for reliable file upload (Next.js standard approach)
        const formData = new FormData()
        formData.append('file', file)
        
        // Process Excel file
        const processResult = await processExcelFile(formData)
        if (!processResult.success || !processResult.data) {
          setMessage({ type: 'error', text: processResult.message })
          return
        }

        // Save processed data
        const saveResult = await saveProcessedData(processResult.data)
        if (!saveResult.success) {
          setMessage({ type: 'error', text: saveResult.message })
          return
        }

        setMessage({
          type: 'success',
          text: `${processResult.message}. ${saveResult.message}`,
        })
        setFile(null)
        
        // Reset file input
        const fileInput = document.getElementById('excel-file') as HTMLInputElement
        if (fileInput) {
          fileInput.value = ''
        }

        // Redirect to dashboard after 2 seconds to show updated data
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } catch (error) {
        console.error('Upload error:', error)
        setMessage({
          type: 'error',
          text: error instanceof Error ? error.message : 'An error occurred',
        })
      }
    })
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></span>
        Upload Attendance Data
      </h2>
      
      <div className="space-y-5">
        <div>
          <label htmlFor="excel-file" className="block text-sm font-semibold text-slate-700 mb-2">
            Select File (.xlsx, .xls, or .csv)
          </label>
          <input
            id="excel-file"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            disabled={isPending}
            className="block w-full text-sm text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-50 file:to-indigo-50 file:text-blue-700 hover:file:from-blue-100 hover:file:to-indigo-100 file:transition-all file:duration-200 file:shadow-sm file:hover:shadow"
          />
          <p className="mt-2 text-xs text-slate-500">
            Expected format: Employee Name/ID | Date | In-Time | Out-Time
          </p>
        </div>

        {file && (
          <div className="text-sm text-slate-600 bg-slate-50/80 rounded-lg p-3 border border-slate-200/60">
            Selected: <span className="font-semibold text-slate-900">{file.name}</span> (
            {(file.size / 1024).toFixed(2)} KB)
          </div>
        )}

        {message && (
          <div
            className={`p-4 rounded-xl text-sm border ${
              message.type === 'success'
                ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/60'
                : 'bg-rose-50/80 text-rose-800 border-rose-200/60'
            } backdrop-blur-sm shadow-sm`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {message.text}
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-sm disabled:shadow-none"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Upload & Process'
          )}
        </button>
      </div>
    </div>
  )
}

