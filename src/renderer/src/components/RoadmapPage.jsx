import React, { useState } from 'react'
import { scaleTime, scaleBand } from '@visx/scale'
import { AxisBottom } from '@visx/axis'
import { Group } from '@visx/group'
import { Bar } from '@visx/shape'
import { ScrollArea, ScrollBar } from '../../../components/ui/scroll-area'
import { DualRangeSlider } from '../../../components/ui/dual-range-slider'

const tasks = [
  { name: 'Task 1', start: new Date('2024-01-01'), end: new Date('2024-01-10') },
  { name: 'Task 2', start: new Date('2024-01-05'), end: new Date('2024-01-15') },
  { name: 'Task 3', start: new Date('2024-01-10'), end: new Date('2024-01-20') },
  { name: 'Task 4', start: new Date('2024-01-15'), end: new Date('2024-02-01') },
  { name: 'Task 5', start: new Date('2024-02-05'), end: new Date('2024-02-15') },
  { name: 'Task 6', start: new Date('2024-02-10'), end: new Date('2024-02-20') },
  { name: 'Task 7', start: new Date('2024-02-15'), end: new Date('2024-03-01') },
  { name: 'Task 8', start: new Date('2024-03-05'), end: new Date('2024-03-15') },
  { name: 'Task 9', start: new Date('2024-03-10'), end: new Date('2024-03-20') },
  { name: 'Task 10', start: new Date('2024-03-15'), end: new Date('2024-04-01') },
  { name: 'Task 11', start: new Date('2024-04-05'), end: new Date('2024-04-15') },
  { name: 'Task 12', start: new Date('2024-04-10'), end: new Date('2024-04-20') },
  { name: 'Task 13', start: new Date('2024-04-15'), end: new Date('2024-05-01') },
  { name: 'Task 14', start: new Date('2024-05-05'), end: new Date('2024-05-15') },
  { name: 'Task 15', start: new Date('2024-05-10'), end: new Date('2024-05-20') },
  { name: 'Task 16', start: new Date('2024-05-15'), end: new Date('2024-06-01') },
  { name: 'Task 17', start: new Date('2024-06-05'), end: new Date('2024-06-15') },
  { name: 'Task 18', start: new Date('2024-06-10'), end: new Date('2024-06-20') },
  { name: 'Task 19', start: new Date('2024-06-15'), end: new Date('2024-07-01') },
  { name: 'Task 20', start: new Date('2024-07-05'), end: new Date('2024-07-15') }
]

const width = 800
const barPadding = 20 // Padding between bars
const barWidthFactor = 100 // Width factor for each task

const RoadmapPage = () => {
  // Margins
  const margin = { top: 20, right: 20, bottom: 40, left: 100 }

  // Initial Date Range
  const minDate = new Date(Math.min(...tasks.map((t) => t.start.getTime())))
  const maxDate = new Date(Math.max(...tasks.map((t) => t.end.getTime())))
  const [range, setRange] = useState([minDate, maxDate])

  // Filter tasks within the range
  const filteredTasks = tasks.filter((task) => task.end >= range[0] && task.start <= range[1])

  // calculate dynamic height
  const chartHeight = filteredTasks.length * barWidthFactor + barPadding * filteredTasks.length
  const totalHeight = chartHeight + margin.top + margin.bottom

  // Calculate dynamic width
  const chartWidth = filteredTasks.length * barWidthFactor + barPadding * filteredTasks.length
  const totalWidth = chartWidth + margin.left + margin.right

  // Scales
  const xScale = scaleTime({
    domain: [range[0], range[1]],
    range: [0, chartWidth]
  })

  const yScale = scaleBand({
    domain: filteredTasks.map((t) => t.name),
    range: [0, chartHeight],
    padding: 0.2
  })

  // Render
  return (
    <div>
      {/* Date Range Slider */}
      <div className="mb-4 w-96">
        <label className="block text-sm font-medium mb-2">Select Date Range</label>
        <DualRangeSlider
          min={minDate.getTime()}
          max={maxDate.getTime()}
          step={24 * 60 * 60 * 1000} // 1 day in milliseconds
          value={range}
          onValueChange={setRange}
        />
        <div className="flex justify-between text-sm mt-2">
          <span>{new Date(range[0]).toLocaleDateString()}</span>
          <span>{new Date(range[1]).toLocaleDateString()}</span>
        </div>
      </div>

      <ScrollArea className="max-w-[calc(100vw)] md:w-[calc(100vw-10rem)] ">
        <svg width={totalWidth} height={totalHeight}>
          <Group top={margin.top} left={margin.left}>
            {/* Bars */}
            {filteredTasks.map((task) => {
              const barWidth = xScale(task.end) - xScale(task.start)
              const barX = xScale(task.start)
              const barY = yScale(task.name) ?? 0
              const barHeight = yScale.bandwidth()

              return (
                <Bar
                  key={task.name}
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill="steelblue"
                  rx={4} // Rounded corners
                />
              )
            })}

            {/* Axis */}
            <AxisBottom
              top={chartHeight}
              scale={xScale}
              tickFormat={(date) =>
                date.toLocaleString(undefined, { month: 'short', day: 'numeric' })
              }
            />
          </Group>
        </svg>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

export default RoadmapPage
