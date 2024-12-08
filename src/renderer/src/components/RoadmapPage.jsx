import React, { Fragment, useEffect, useState } from 'react'
import { scaleTime, scaleBand } from '@visx/scale'
import { AxisBottom, AxisLeft, AxisTop } from '@visx/axis'
import { Group } from '@visx/group'
import { Bar, Line } from '@visx/shape'
import { ScrollArea, ScrollBar } from '../../../components/ui/scroll-area'
import { DualRangeSlider } from '../../../components/ui/dual-range-slider'
import { useProducts } from '../contexts/productsContext'
import dayjs from 'dayjs'
import { useSingleProduct } from '../contexts/singleProductContext'

const height = 800
const minimumWidth = 1200
const widthFactor = 3
const RoadmapPage = () => {
  const [chartData, setChartData] = useState([])
  const { products } = useProducts()
  const { epics } = useSingleProduct()

  useEffect(() => {
    if (products) {
      const newChartData = products.map((product) => {
        return {
          name: product.projectName,
          start: new Date(product.mp1Date),
          end:
            product.launch === product.mp1Date
              ? new Date(product.mp1Date + 'T23:59:59')
              : new Date(product.launch),
          fill: 'lightBlue', // primary,
          epicId: product.epicId
        }
      })
      setChartData(
        newChartData
          .map((task) => {
            const epic = epics.find((e) => e.iid === task.epicId)
            return {
              ...task,
              subTasks: [
                {
                  name: epic?.title,
                  start: new Date(epic?.start_date),
                  end: new Date(epic?.due_date),
                  fill: 'lightBlue',
                  epicId: task.epicId
                }
              ]
            }
          })
          .sort((a, b) => a.start.getTime() - b.start.getTime())
      )
      const minDate = new Date(Math.min(...newChartData.map((t) => t.start.getTime())))
      const maxDate = new Date(Math.max(...newChartData.map((t) => t.end.getTime())))
      setRange([Math.max(minDate, dayjs().subtract(1, 'month').valueOf()), maxDate])
    }
  }, [products])

  // Margins
  const margin = { top: 20, right: 20, bottom: 40, left: 100 }

  // Initial Date Range
  const minDate = new Date(Math.min(...chartData.map((t) => t.start.getTime())))
  const maxDate = new Date(Math.max(...chartData.map((t) => t.end.getTime())))
  const [range, setRange] = useState([])

  // Filter tasks within the range
  const filteredTasks = chartData.filter((task) => task.end >= range[0] && task.start <= range[1])

  // chartheight equals view height
  const chartHeight = height
  const totalHeight = chartHeight + margin.top + margin.bottom

  // Calculate dynamic width
  const chartWidth = Math.max(
    minimumWidth,
    ((new Date(range[1]).getTime() - new Date(range[0]).getTime()) / (1000 * 60 * 60 * 24)) *
      widthFactor
  )

  const totalWidth = chartWidth + margin.left + margin.right

  // Scales
  const xScale = scaleTime({
    domain: [range[0], range[1]],
    range: [0, chartWidth]
  })

  const yScale = scaleBand({
    domain: filteredTasks.map((t) => t.name),
    range: [0, chartHeight], // set chart height to the view height
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
          step={24 * 60 * 60 * 1000 * 30} // 1 week in milliseconds
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
              let barX = xScale(task.start)
              let barWidth = xScale(task.end) - xScale(task.start)
              const subTasks = task.subTasks
              const numberOfBars = subTasks.length + 1
              // Adjust bar position and width if it overflows the left axis
              if (barX < 0) {
                barWidth += barX // Reduce width by the overflow amount
                barX = 0 // Clamp barX to the left axis
              }

              // Ensure the bar width is not negative
              if (barWidth < 0) {
                barWidth = 0
              }

              const padding = 8
              const gap = 2
              const barY = yScale(task.name) + padding
              const barHeight = yScale.bandwidth() - padding * 2
              return (
                <Fragment key={task.name}>
                  <Bar
                    x={Math.max(0, barX)}
                    y={barY}
                    width={barWidth}
                    height={barHeight / numberOfBars - gap}
                    fill={task.fill}
                    rx={4}
                  />
                  {subTasks.length > 0 &&
                    subTasks.map((subTask,index) => {
                      let subBarWidth = xScale(subTask.end) - xScale(subTask.start)
                      let subBarX = xScale(subTask.start)
                      if (subBarX < 0) {
                        subBarWidth += subBarX
                        subBarX = 0
                      }

                      if (subBarWidth < 0) {
                        subBarWidth = 0
                      }
                      return (
                        <Bar
                          key={subTask.name}
                          x={Math.max(0, subBarX)}
                          y={barY + (barHeight / numberOfBars) * (index + 1) + index * 2}
                          width={subBarWidth}
                          height={barHeight / numberOfBars - gap}
                          fill="purple"
                          rx={4}
                        />
                      )
                    })}
                </Fragment>
              )
            })}

            {/* Axis */}

            <AxisLeft
              scale={yScale}
              tickFormat={(name) => name}
              tickLabelProps={{
                fill: 'hsl(var(--primary))',
                fontSize: 12
              }}
              stroke="hsl(var(--primary))"
              tickStroke="hsl(var(--primary))"
            />
            <AxisTop
              top={3}
              scale={xScale}
              stroke="hsl(var(--primary))"
              tickStroke="hsl(var(--primary))"
              tickLabelProps={{
                fill: 'hsl(var(--primary))',
                fontSize: 12,
                dy: 1
              }}
              tickFormat={(date) =>
                date.toLocaleString(undefined, { month: 'short', year: 'numeric' })
              }
            />
            <AxisBottom
              top={height}
              stroke="hsl(var(--primary))"
              scale={xScale}
              tickFormat={(date) =>
                date.toLocaleString(undefined, { month: 'short', year: 'numeric' })
              }
              tickLabelProps={{
                fill: 'hsl(var(--primary))',
                fontSize: 12
              }}
              tickStroke="hsl(var(--primary))"
            />
            <text
              x={xScale(new Date())}
              y={-10}
              textAnchor="middle"
              fill="red"
              fontSize={12}
            >
              Today
            </text>
            <Line
              stroke="red"
              strokeWidth={1}
              x1={xScale(new Date())}
              x2={xScale(new Date())}
              y1={0}
              y2={height+5}
              strokeDasharray="5 5"
            />
          </Group>
        </svg>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
export default RoadmapPage
