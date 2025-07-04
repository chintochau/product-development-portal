import React, { Fragment, useEffect, useState } from 'react'
import { cn, timeAgo } from '../../../../lib/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Check, ChevronDown } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useSingleProduct } from '../../contexts/singleProductContext'
import { defaultHardwareSteps, defaultSoftwareSteps } from '../../constant'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../../../components/ui/select'

const SingleStep = ({ step, index, className, software, hardware }) => {
  const [completedSubSteps, setCompletedSubSteps] = useState(false)
  const [completedPercentage, setCompletedPercentage] = useState(0)
  const { setHardware, setSoftware, pifs, saveData, milestones } = useSingleProduct()

  useEffect(() => {
    if (step.subSteps) {
      // calculate the number of completed sub-steps
      const completed = step.subSteps.filter((subStep) => subStep.completed).length
      setCompletedSubSteps(completed)

      // calculate the percentage of completed sub-steps
      const total = step.subSteps.length
      const percentage = (completed / total) * 100
      setCompletedPercentage(percentage)
    }
  }, [step.subSteps])

  const handleClick = ({ pifFile, milestone }) => {
    if (hardware) {
      setHardware((prevHardware) => {
        // Ensure we have a base array to work with
        const hardwareSteps = prevHardware || defaultHardwareSteps

        // Create a new array with updated state
        const newHardware = hardwareSteps.map((step, idx) => {
          if (idx === index) {
            if (pifFile) {
              return {
                ...step,
                pif: {
                  name: pifFile.attributes?.fileName,
                  url: pifFile.attributes?.path,
                  timestamp: new Date().toISOString().split('T')[0],
                  pifId: pifFile.id
                }
              }
            }
            return {
              ...step,
              completed: !step.completed,
              timestamp: !step.completed ? new Date().toISOString().split('T')[0] : null
            }
          } else {
            return step
          }
        })
        saveData({
          type: 'hardware',
          hardware: newHardware
        })
        return newHardware
      })
    } else if (software) {
      setSoftware((prevSoftware) => {
        // Ensure we have a base array to work with
        const softwareSteps = prevSoftware || defaultSoftwareSteps

        // Create a new array with updated state
        const newSoftware = softwareSteps.map((step, idx) => {
          if (idx === index) {
            if (pifFile) {
              return {
                ...step,
                pif: {
                  name: pifFile.attributes?.fileName,
                  url: pifFile.attributes?.path,
                  timestamp: new Date().toISOString().split('T')[0],
                  pifId: pifFile.id
                }
              }
            }

            if (milestone) {
              return {
                ...step,
                milestone: {
                  title: milestone.title,
                  timestamp: new Date().toISOString().split('T')[0],
                  milestoneId: milestone.id
                }
              }
            }
            return {
              ...step,
              completed: !step.completed,
              timestamp: !step.completed ? new Date().toISOString().split('T')[0] : null
            }
          } else {
            return step
          }
        })
        saveData({
          type: 'software',
          software: newSoftware
        })
        return newSoftware
      })
    }
  }
  return (
    <Collapsible key={index} className={cn('flex flex-col', className)}>
      <div className="flex items-center">
        <div
          className={cn(
            'group h-8 w-8 rounded-full flex items-center justify-center font-semibold',
            step.completed ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
          )}
          onClick={handleClick}
        >
          <span className="group-hover:hidden">{index + 1}</span>
          <span className="hidden group-hover:inline">
            <Check />
          </span>
        </div>
        <CollapsibleTrigger asChild className={cn('flex-1', step.subSteps && 'cursor-pointer')}>
          <div className="flex flex-col">
            <div className="flex items-center">
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
                  <div>
                    <span className="text-sm font-bold text-blue-600">
                      Milestone: {step.milestone.title}
                    </span>

                    <Select
                      onValueChange={(milestoneId) => {
                        const chosenMilestone = milestones.find(
                          (milestone) => milestone.id === milestoneId
                        )
                        handleClick({ milestone: chosenMilestone })
                      }}
                    >
                      <SelectTrigger className="h-5 overflow-hidden flex items-start py-0 max-w-56 text-wrap border-0">
                        <SelectValue placeholder="Select Milestone" />
                      </SelectTrigger>
                      <SelectContent>
                        {milestones && milestones.length > 0 ? (
                          <>
                            {milestones.map((milestone) => (
                              <SelectItem key={milestone.id} value={milestone.id}>
                                {milestone.title}
                              </SelectItem>
                            ))}
                          </>
                        ) : (
                          <SelectItem value="no-milestones" disabled>
                            No milestones found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {step.pif && (
                  <>
                    {step.completed ? (
                      <span
                        className={cn(
                          'text-sm font-bold ',
                          step.pif.name ? 'text-blue-600' : ' text-red-600'
                        )}
                      >
                        PIF: {step.pif.name || 'you have not picked a PIF'}
                      </span>
                    ) : (
                      <Select
                        onValueChange={(pifId) => {
                          const chosenPif = pifs.find((pif) => pif.id === pifId)
                          handleClick({ pifFile: chosenPif })
                        }}
                      >
                        <SelectTrigger className="h-5 overflow-hidden flex items-start py-0 max-w-56 text-wrap border-0">
                          <SelectValue placeholder="Select PIF" />
                        </SelectTrigger>
                        <SelectContent>
                          {pifs && pifs.length > 0 ? (
                            <>
                              {pifs.map((pif) => (
                                <SelectItem key={pif.id} value={pif.id}>
                                  <div className="flex flex-col items-start text-wrap">
                                    <p className="text-wrap">{pif.attributes?.fileName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {timeAgo(pif.date)}
                                    </p>
                                  </div>
                                </SelectItem>
                              ))}
                            </>
                          ) : (
                            <>
                              <SelectItem disabled value="no-pifs">
                                No PIFs found
                              </SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </>
                )}
              </div>
              {step.subSteps && (
                <p className="ml-4 text-sm text-muted-foreground">
                  {completedSubSteps}/{step.subSteps.length}
                </p>
              )}
              {step.subSteps && <ChevronDown className="ml-4 h-4 w-4" />}
            </div>
            {step.subSteps && (
              <div className=" py-1 px-4 ">
                <Progress className="h-1" value={completedPercentage} />
              </div>
            )}
          </div>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        {step.subSteps &&
          step.subSteps.map((subStep, subIndex) => (
            <SubStep
              key={subIndex + 1}
              step={subStep}
              mainIndex={index}
              index={subIndex}
              saveData={saveData}
              hardware={hardware}
              software={software}
            />
          ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

const SubStep = ({ step, index, mainIndex, software, hardware, saveData }) => {
  const { setHardware, setSoftware } = useSingleProduct()
  const handleClick = () => {
    if (hardware) {
      setHardware((prevHardware) => {
        // Ensure we have a base array to work with
        const hardwareSteps = prevHardware || defaultHardwareSteps

        // Create a new array with updated state
        const newHardware = hardwareSteps.map((step, idx) =>
          idx === mainIndex
            ? {
                ...step,
                subSteps: step.subSteps.map((subStep, subIdx) =>
                  subIdx === index
                    ? {
                        ...subStep,
                        completed: !subStep.completed,
                        timestamp: !subStep.completed
                          ? new Date().toISOString().split('T')[0]
                          : null
                      }
                    : subStep
                )
              }
            : step
        )

        saveData({
          type: 'hardware',
          hardware: newHardware
        })
        return newHardware
      })
    } else if (software) {
      setSoftware((prevSoftware) => {
        // Ensure we have a base array to work with
        const softwareSteps = prevSoftware || defaultSoftwareSteps

        // Create a new array with updated state
        const newSoftware = softwareSteps.map((step, idx) =>
          idx === index
            ? {
                ...step,
                completed: !step.completed,
                timestamp: !step.completed ? new Date().toISOString().split('T')[0] : null
              }
            : step
        )
        saveData({
          type: 'software',
          software: newSoftware
        })
        return newSoftware
      })
    }
  }

  return (
    <div className="flex flex-col pl-4 py-1">
      <div className="flex items-center">
        <div
          className={cn(
            'group h-6 w-6 rounded-full flex items-center justify-center font-semibold text-xs p-1',
            step.completed ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
          )}
          onClick={handleClick}
        >
          <span className="group-hover:hidden">{`${mainIndex + 1}.${index + 1}`}</span>
          <span className="hidden group-hover:inline">
            <Check />
          </span>
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
        </div>
        {step.subSteps && (
          <p className="ml-4 text-sm text-muted-foreground">
            {completedSubSteps}/{step.subSteps.length}
          </p>
        )}
      </div>
    </div>
  )
}

function ProcessStepper({ steps, saveData, hardware, software }) {
  return (
    <div className="flex flex-col gap-4">
      {steps &&
        steps.map((step, index) => (
          <SingleStep
            step={step}
            index={index}
            saveData={saveData}
            key={index + 1}
            hardware={hardware}
            software={software}
          />
        ))}
    </div>
  )
}

export default ProcessStepper
