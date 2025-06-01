import React from 'react'

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
}

export default function LegalModal({
  isOpen,
  onClose,
  title,
  content,
}: LegalModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-(--white) rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-heading-2">{title}</h2>
          <button
            onClick={onClose}
            className="text-(--gray-500) hover:text-(--gray-700) cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-grow">
          <div className="prose max-w-none">
            {content.split('\n').map((line, index) => {
              if (line.startsWith('# ')) {
                return (
                  <h1 key={index} className="text-2xl font-bold mb-4">
                    {line.substring(2)}
                  </h1>
                )
              } else if (line.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-xl font-bold mt-6 mb-3">
                    {line.substring(3)}
                  </h2>
                )
              } else if (line.startsWith('- ')) {
                return (
                  <li key={index} className="ml-6 mb-1">
                    {line.substring(2)}
                  </li>
                )
              } else if (line.trim() === '') {
                return <div key={index} className="mb-2"></div>
              } else {
                return (
                  <p key={index} className="mb-2">
                    {line}
                  </p>
                )
              }
            })}
          </div>
        </div>

        <div className="p-4"></div>
      </div>
    </div>
  )
}
