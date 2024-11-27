import React, { Fragment, useEffect, useState } from 'react'
import { cn } from '../../../../lib/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

const SingleStep = ({ step, index, className, sub }) => {
  const [completedSubSteps, setCompletedSubSteps] = useState(false)
  const [completedPercentage, setCompletedPercentage] = useState(0)

  useEffect(() => {
    if (step.subSteps) {
      console.log(step.subSteps);
      // calculate the number of completed sub-steps
      const completed = step.subSteps.filter((subStep) => subStep.completed).length
      setCompletedSubSteps(completed)

      // calculate the percentage of completed sub-steps
      const total = step.subSteps.length
      const percentage = (completed / total) * 100
      setCompletedPercentage(percentage)
    }
  }, [step.subSteps])
  return (
    <Collapsible key={index} className={cn('flex flex-col', className)}>
      <CollapsibleTrigger asChild className={cn(step.subSteps && 'cursor-pointer')}>
        <div className="flex flex-col">
          <div className="flex items-center">
            <div
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center font-semibold',
                step.completed ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600',
                sub && 'h-6 w-6'
              )}
            >
              {index}
            </div>
            <div className="ml-4 flex flex-col">
              <span
                className={cn(
                  'text-sm font-medium',
                  step.completed ? 'text-primary' : 'text-muted-foreground'
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
            {step.subSteps && <p className='ml-4 text-sm text-muted-foreground'>{completedSubSteps}/{step.subSteps.length}</p>}
            {step.subSteps && <ChevronDown className="ml-4 h-4 w-4" />}
          </div>
          {step.subSteps && (
            <div className=" py-1 pl-12">
              <Progress className="h-1" value={completedPercentage} />
            </div>
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {step.subSteps &&
          step.subSteps.map((subStep, subIndex) => (
            <SingleStep
              step={subStep}
              index={`${index}.${subIndex + 1}`}
              key={`${index}.${subIndex + 1}`}
              className="pl-8 my-2"
              sub
            />
          ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

function ProcessStepper({ steps }) {
  return (
    <div className="flex flex-col gap-4">
      {steps && steps.map((step, index) => <SingleStep step={step} index={index + 1} />)}
    </div>
  )
}

export default ProcessStepper
