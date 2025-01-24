import React, { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { defaultPriorities } from '../../constant'

// A function to calculate the color based on priority level
export const getPriorityColor = (priority) => {
  const red = 255 - Math.round((255 / 10) * priority) // Gradually reduce red
  const blue = Math.round((255 / 10) * priority) // Gradually increase blue
  return `rgb(${red}, 0, ${blue})` // Dynamic RGB color
}

const PriorityDropdown = ({ priority, setPriority }) => {
  return (
    <Select
      value={priority}
      onValueChange={(value) => {
        setPriority(value)
      }}
    >
      <SelectTrigger className="w-[180px] border-0 hover:underline" style={{ color: getPriorityColor(priority) }}>
        <SelectValue value={priority} placeholder="-" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={null} className="text-muted-foreground">
          -
        </SelectItem>
        {Object.keys(defaultPriorities).map((priority) => (
          <SelectItem
            key={priority}
            value={priority}
            style={{
              color: getPriorityColor(priority) // Apply color dynamically
            }}
          >
            {defaultPriorities[priority]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default PriorityDropdown
