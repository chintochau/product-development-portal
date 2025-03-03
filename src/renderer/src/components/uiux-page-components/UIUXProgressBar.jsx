import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckCircle, Circle } from 'lucide-react';

export const uiuxSteps = [
    "Backlog",
    "Requirements",
    "Wireframing",
    "UI Design",
    "Development",
    "Testing",
    "Deployment",
  ];

const TimelineProgress = ({ step=0, onStepChange }) => {

  
  // Short labels for compact display
  const shortLabels = ["BL", "RQ", "WF", "UI", "DV", "TS", "DP"];

  const [activeStep, setActiveStep] = useState(step);

  return (
    <div className="w-80">
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center w-full cursor-pointer">
            {/* Display current step with badge */}
            <Badge 
              variant="outline" 
              className="mr-2 bg-blue-50 text-blue-700 border-blue-200"
            >
              {activeStep + 1}/{uiuxSteps.length}
            </Badge>
            
            {/* Progress bar with visible step labels */}
            <div className="relative flex-1">
              {/* Background bar */}
              <div className="h-1.5 bg-gray-200 rounded-full w-full"></div>
              
              {/* Filled progress */}
              <div 
                className="absolute top-0 h-1.5 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${(activeStep / (uiuxSteps.length - 1)) * 100}%` }}
              ></div>
              
              {/* Visible step markers with abbreviated labels */}
              <div className="absolute top-0 w-full flex justify-between">
                {uiuxSteps.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveStep(index);
                      if (onStepChange) {
                        onStepChange(index);
                      }
                    }}
                    className="group flex flex-col items-center transform -translate-x-1/2"
                    style={{ 
                      left: `${(index / (uiuxSteps.length - 1)) * 100}%`,
                      marginTop: '-2px'
                    }}
                  >
                    {/* Step marker */}
                    <div className={`w-3 h-3 rounded-full flex items-center justify-center mt-px 
                      ${index <= activeStep ? 'bg-blue-500' : 'bg-gray-300'}`}
                    />
                    
                    {/* Abbreviated step label */}
                    <span className={`text-[9px] mt-1 font-medium 
                      ${index === activeStep ? 'text-blue-700' : 'text-gray-500'}`}
                    >
                      {shortLabels[index]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PopoverTrigger>
        
        {/* Detailed popover with full step information */}
        <PopoverContent className="w-64 p-2">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">UI/UX Progress</h4>
            {uiuxSteps.map((step, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 p-1 rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setActiveStep(index);
                  if (onStepChange) {
                    onStepChange(index);
                  }
                }}
              >
                {index <= activeStep ? (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-300" />
                )}
                <span className={index === activeStep ? "font-medium" : ""}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TimelineProgress;