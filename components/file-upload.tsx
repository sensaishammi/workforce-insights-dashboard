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
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile)
        setMessage(null)
      } else {
        setMessage({ type: 'error', text: 'Please select an Excel file (.xlsx or .xls)' })
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

        // Reload page after 2 seconds to show updated data
        setTimeout(() => {
          window.location.reload()
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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Attendance Data</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="excel-file" className="block text-sm font-medium text-gray-700 mb-2">
            Select Excel File (.xlsx)
          </label>
          <input
            id="excel-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={isPending}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-2 text-xs text-gray-500">
            Expected format: Employee Name/ID | Date | In-Time | Out-Time
          </p>
        </div>

        {file && (
          <div className="text-sm text-gray-600">
            Selected: <span className="font-medium">{file.name}</span> (
            {(file.size / 1024).toFixed(2)} KB)
          </div>
        )}

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || isPending}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Processing...' : 'Upload & Process'}
        </button>
      </div>
    </div>
  )
}

