import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'

const DualRangeSlider = React.forwardRef(
  ({ className, label, labelPosition = 'top', ...props }, ref) => {
    const initialValue = Array.isArray(props.value) ? props.value : [props.min, props.max]

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn('relative flex w-full touch-none select-none items-center', className)}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-accent">
          <SliderPrimitive.Range className="absolute h-full bg-secondary" />
        </SliderPrimitive.Track>
        {initialValue.map((value, index) => (
          <React.Fragment key={index}>
            <SliderPrimitive.Thumb className="relative block h-4 w-4 rounded-full border-2 border-secondary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
              {label && (
                <span
                  className={cn(
                    'absolute flex w-full justify-center',
                    labelPosition === 'top' && '-top-7',
                    labelPosition === 'bottom' && 'top-4'
                  )}
                >
                  {label(value)}
                </span>
              )}
            </SliderPrimitive.Thumb>
          </React.Fragment>
        ))}
      </SliderPrimitive.Root>
    )
  }
)
DualRangeSlider.displayName = 'DualRangeSlider'

export { DualRangeSlider }
