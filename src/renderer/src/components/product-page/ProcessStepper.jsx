import React from 'react'
import { cn } from '../../../../lib/utils'

function ProcessStepper({ steps }) {
  return (
    <div className="flex flex-col gap-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div
            className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center font-semibold',
              step.completed ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
            )}
          >
            {index + 1}
          </div>
          <div className="ml-4 flex flex-col">
            <span
              className={cn(
                'text-sm font-medium',
                step.completed ? 'text-gray-800' : 'text-gray-500'
              )}
            >
              {step.label}
            </span>
            {step.targetDate && (
              <span className="text-xs text-gray-400">Target Date: {step.targetDate}</span>
            )}
            {step.timestamp && (
              <span className="text-xs text-gray-400">Completed: {step.timestamp}</span>
            )}
            {step.milestone && (
              <span className="text-sm font-bold text-blue-600">Milestone: {step.milestone}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProcessStepper
