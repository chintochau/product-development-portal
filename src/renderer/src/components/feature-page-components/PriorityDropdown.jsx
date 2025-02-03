import React, { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { defaultPriorities } from '../../constant'
import { Circle } from 'lucide-react'

// A function to calculate the color based on priority level
export const getPriorityColor = (priority) => {
  const red = 255 - Math.round((255 / 10) * priority) // Gradually reduce red
  const blue = Math.round((255 / 10) * priority) // Gradually increase blue
  return `rgb(${red}, 0, ${blue})` // Dynamic RGB color
}
const PriorityDropdown = ({ priority, setPriority }) => {
  return (
    <Select value={priority} onValueChange={setPriority}>
      <SelectTrigger className="w-full border-muted-foreground/10 hover:border-primary/50">
        <div 
          className="flex items-center gap-2"
          style={{ color: getPriorityColor(priority) }}
        >
          <span className="font-medium">
            {priority ? defaultPriorities[priority] : 'Set Priority'}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="min-w-[160px]">
        <SelectItem value={99} className="text-muted-foreground">
          <span className="flex items-center gap-2">
            Unprioritized
          </span>
        </SelectItem>
        {Object.keys(defaultPriorities).map((p) => (
          <SelectItem key={p} value={p} style={{ color: getPriorityColor(p) }}>
            <div className="flex items-center gap-2">
              {defaultPriorities[p]}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default PriorityDropdown
