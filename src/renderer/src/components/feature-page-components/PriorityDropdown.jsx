import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { defaultPriorities } from '../../constant';
import { Circle, Flag } from 'lucide-react';

// Enhanced priority color function with better visual gradient
export const getPriorityColor = (priority) => {
  if (!priority || priority === '99') return '#94A3B8'; // Default gray for unprioritized
  
  const priorityNum = parseInt(priority, 10);
  
  // Color mapping for different priority levels
  const colors = {
    0: '#DC2626', // Default gray for unprioritized
    1: '#DC2626', // Urgent - Red
    2: '#EA580C', // High - Orange
    3: '#D97706', // Medium-High - Amber
    4: '#CA8A04', // Medium - Yellow
    5: '#65A30D', // Medium-Low - Lime
    6: '#16A34A', // Low - Green
    7: '#0EA5E9', // Very Low - Light Blue
    8: '#2563EB', // Minimal - Blue
    9: '#7C3AED', // Lowest - Purple
    10: '#A1A1AA', // Trivial - Gray
  };
  
  return colors[priorityNum] || '#94A3B8';
};

const PriorityDropdown = ({ priority, setPriority }) => {
  const priorityColor = getPriorityColor(priority);
  const priorityLabel = priority && priority !== '99' ? defaultPriorities[priority] : 'Set Priority';
  
  return (
    <Select value={priority} onValueChange={setPriority}>
      <SelectTrigger className="w-fit bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm hover:border-primary/50 transition-all">
        <div className="flex items-center gap-2 w-full">
          {priority && priority !== '99' && (
            <Circle 
              className="h-3 w-3 fill-current" 
              style={{ color: priorityColor }} 
            />
          )}
          {priority === '99' && (
            <Flag className="h-3 w-3 text-muted-foreground" />
          )}
          <span 
            className={`font-medium ${priority && priority !== '99' ? '' : 'text-muted-foreground'}`}
            style={{ color: priority && priority !== '99' ? priorityColor : undefined }}
          >
            {priorityLabel}
          </span>
        </div>
      </SelectTrigger>
      
      <SelectContent className="min-w-[160px]">
        <SelectItem value="99" className="flex items-center gap-2 text-muted-foreground">
          <Flag className="h-3 w-3" />
          <span>Unprioritized</span>
        </SelectItem>
        
        {Object.keys(defaultPriorities).map((p) => {
          const color = getPriorityColor(p);
          return (
            <SelectItem 
              key={p} 
              value={p} 
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2 w-full">
                <Circle className="h-3 w-3 fill-current" style={{ color }} />
                <span style={{ color }}>{defaultPriorities[p]}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default PriorityDropdown;