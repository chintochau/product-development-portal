import React, { Fragment, useEffect, useState } from 'react'
import { scaleTime, scaleBand, scaleOrdinal } from '@visx/scale'
import { AxisBottom, AxisLeft, AxisTop } from '@visx/axis'
import { Group } from '@visx/group'
import { Bar, Line } from '@visx/shape'
import { ScrollArea, ScrollBar } from '../../../components/ui/scroll-area'
import { DualRangeSlider } from '../../../components/ui/dual-range-slider'
import { useProducts } from '../contexts/productsContext'
import dayjs from 'dayjs'
import { useSingleProduct } from '../contexts/singleProductContext'
import { getNameForProject } from '../services/gitlabServices'
import { Checkbox } from '../../../components/ui/checkbox'
import Ordinal from '@visx/legend/lib/legends/Ordinal'
import { defaultStyles, useTooltip, useTooltipInPortal } from '@visx/tooltip'
import { localPoint } from '@visx/event'
import { Label } from '../../../components/ui/label'

const height = 800
const minimumWidth = 1200
const widthFactor = 5
const mainColor = '#0070f3'
const epicColor = '#22c55e'
const hardwareColor = '#f59e0b'
const featureColor = '#ef4444' // red
const legendColorScale = scaleOrdinal({
  domain: ['Main', 'Software', 'Hardware', 'Feature'],
  range: [mainColor, epicColor, hardwareColor, featureColor]
})

// Margins
const margin = { top: 20, right: 200, bottom: 40, left: 150 }

const RoadmapPage = () => {
  const [chartData, setChartData] = useState([])
  const { products } = useProducts()
  const { epics, milestones, getFeatureEpics } = useSingleProduct()
  const [showMilestones, setShowMilestones] = useState(false)
  const [shouldLoadWrike, setShouldLoadWrike] = useState(false)
  const [shouldloadFeatures, setShouldloadFeatures] = useState(false)
  const { tooltipOpen, tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip()
  const [pointerX, setPointerX] = useState(null)

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    onTooltipOpenChange: () => {}
  })

  const handleMouseEnter = (data) => {
    showTooltip({
      tooltipData: data,
      tooltipLeft: 0,
      tooltipTop: 0
    })
  }
  const handleMouseLeave = () => {
    hideTooltip()
  }

  const handleMouseOver = (data) => {
    showTooltip({
      tooltipData: data,
      tooltipLeft: 0,
      tooltipTop: 0
    })
  }

  const handleMouseMove = (event) => {
    const { x, y } = localPoint(event)
    showTooltip((input) => ({
      ...input,
      tooltipLeft: x,
      tooltipTop: y
    }))
  }
  useEffect(() => {
    if (products) {
      const newChartData = products.map((product) => {
        return {
          name: product.projectName,
          start: new Date(product.mp1Date || product.created_at),
          end: product.launch ? new Date(product.launch) : new Date(),
          fill: mainColor, // blue,
          epicId: product.epicId,
          wrikeId: product.wrikeId,
          type: 'product'
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
                  id: task.id,
                  name: epic?.title,
                  start: new Date(epic?.start_date),
                  end: new Date(epic?.due_date),
                  fill: epicColor, // green
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
      setShouldLoadWrike(true)
      setShouldloadFeatures(true)
    }
  }, [products, epics])

  const fetchDataFromWrike = async (taskData, taskIndex) => {
    try {
      const res = await window.api.wrike(
        `folders/${taskData.wrikeId}/tasks?fields=[subTaskIds]&subTasks=true&title=ship`,
        'GET'
      )
      const res2 = await window.api.wrike(
        `folders/${taskData.wrikeId}/tasks?fields=[subTaskIds]&subTasks=true&title=pif`,
        'GET'
      )
      const wrikeTasks = [...res?.data, ...res2?.data]

      if (!wrikeTasks || !wrikeTasks.length) return

      const wrikeId = wrikeTasks[0].id

      const shippingDates = wrikeTasks.map((wrikeTask) => {
        return {
          id: wrikeTask.id,
          title: wrikeTask.title,
          start: new Date(wrikeTask.dates?.start),
          end: new Date(wrikeTask.dates?.due)
        }
      })

      setChartData((prevData) =>
        prevData.map((task, index) => {
          if (index === taskIndex) {
            return {
              ...task,
              subTasks: [
                ...task.subTasks.filter((subTask) => subTask.wrikeId !== wrikeId),
                ...(shippingDates && shippingDates.length > 0
                  ? [
                      {
                        id: wrikeId,
                        fill: hardwareColor, // yellow
                        wrikeId: wrikeId,
                        dates: [...shippingDates]
                      }
                    ]
                  : [])
              ]
            }
          }
          return task
        })
      )
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (shouldloadFeatures) {
      const features = getFeatureEpics()
        .filter((f) => f.start_date && f.due_date)
        .map((f) => {
          return {
            id: f.id,
            name: f.title,
            start: new Date(f.start_date),
            end: new Date(f.due_date),
            fill: featureColor
          }
        })
      setChartData((prevData) => [
        ...prevData,
        ...features,
        {
          name: 'Alan',
          start: new Date(),
          end: new Date(),
          fill: mainColor,
          subTasks: [...features]
        }
      ])
      setShouldloadFeatures(false)
    }
  }, [epics, shouldloadFeatures])

  useEffect(() => {
    if (chartData && shouldLoadWrike) {
      setShouldLoadWrike(false)
      chartData.forEach((task, index) => {
        const wrikeId = task.wrikeId
        if (wrikeId) {
          fetchDataFromWrike(task, index)
        }
      })
    }
  }, [chartData, shouldLoadWrike])

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

  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-2xl font-semibold">No data available</p>
      </div>
    )
  }
  return (
    <div>
      {/* Date Range Slider */}
      <div className="flex gap-10">
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
        <div className="flex items-center space-x-2">
          <Checkbox id="milestones" onCheckedChange={setShowMilestones} checked={showMilestones} />
          <label
            htmlFor="milestones"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Milestones
          </label>
          <Checkbox id="developers" />
          <label
            htmlFor="developers"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Developers
          </label>
        </div>
      </div>
      <Ordinal scale={legendColorScale} direction="horizontal" />

      <div className="flex">
        <svg width={margin.left} height={totalHeight} ref={containerRef}>
          <AxisLeft
            scale={yScale}
            tickFormat={(name) => name}
            tickLabelProps={{
              fill: 'hsl(var(--primary))',
              fontSize: 12
            }}
            stroke="hsl(var(--primary))"
            tickStroke="hsl(var(--primary))"
            left={margin.left}
            top={margin.top}
          />
        </svg>
        <ScrollArea className="max-w-[calc(100vw)] md:w-[calc(100vw-10rem)] ">
          <svg
            width={totalWidth}
            height={totalHeight}
            onPointerMove={(e) => {
              // Calculate the mouse position based on the svg coordinates
              const { x, y } = localPoint(e)
              setPointerX(x)
            }}
          >
            <Group top={margin.top} left={0}>
              {pointerX && (
                <Fragment>
                  <Line
                    stroke="hsl(var(--primary))"
                    strokeWidth={1}
                    x1={pointerX}
                    x2={pointerX}
                    y1={0}
                    y2={height + 5}
                  />
                  <text
                    x={pointerX}
                    y={20}
                    textAnchor="middle"
                    fill="hsl(var(--primary))"
                    fontSize={12}
                  >
                    {
                      // get date from pointerX
                      new Date(xScale.invert(pointerX)).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    }
                  </text>
                </Fragment>
              )}
              {/* Bars */}
              {filteredTasks.map((task) => {
                let barX = xScale(task.start)
                let barWidth = xScale(task.end) - xScale(task.start)
                const subTasks = task.subTasks
                const numberOfBars = subTasks?.length + 1 || 1
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

                // TODO: fix errors with NaN values
                return (
                  <Fragment key={task.id}>
                    <Bar
                      x={Math.max(0, barX)}
                      y={barY}
                      width={barWidth}
                      height={barHeight / numberOfBars - gap}
                      fill={task.fill}
                      rx={4}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      onMouseOver={() => handleMouseOver({ task })}
                    />
                    <Line
                      x1={Math.max(0, barX) + barWidth - gap}
                      x2={Math.max(0, barX) + barWidth - gap}
                      y1={barY - gap}
                      y2={barY + barHeight / numberOfBars - gap + gap}
                      stroke="pink"
                      strokeWidth={2}
                    />

                    <Line
                      x1={barX}
                      x2={barX}
                      y1={barY - gap}
                      y2={barY + barHeight / numberOfBars - gap + gap}
                      stroke="lightBlue"
                      strokeWidth={2}
                    />

                    {subTasks?.length > 0 &&
                      subTasks?.map((subTask, index) => {
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
                          <Fragment key={subTask.id}>
                            <Bar
                              key={subTask.id + index}
                              x={Math.max(0, subBarX)}
                              y={barY + (barHeight / numberOfBars) * (index + 1)}
                              width={subBarWidth}
                              height={barHeight / numberOfBars - gap}
                              fill={subTask.fill}
                              rx={4}
                            />
                            {subTask.dates &&
                              subTask.dates.map((date) => {
                                return (
                                  <Fragment key={date.id}>
                                    <Bar
                                      x={xScale(date.start)}
                                      y={barY + (barHeight / numberOfBars) * (index + 1)}
                                      width={xScale(date.end) - xScale(date.start)}
                                      height={barHeight / numberOfBars - gap}
                                      fill={subTask.fill}
                                      rx={4}
                                    />
                                    <foreignObject
                                      x={xScale(date.start)}
                                      y={
                                        barY +
                                        (barHeight / numberOfBars) * (index + 1) +
                                        (barHeight / numberOfBars - gap)
                                      }
                                      width={180}
                                      height={30}
                                    >
                                      <div className="text-xs" style={{ pointerEvents: 'none' }}>
                                        {date.title}
                                      </div>
                                    </foreignObject>
                                  </Fragment>
                                )
                              })}
                          </Fragment>
                        )
                      })}
                    {task.type === 'product' && (
                      <>
                        <text
                          // hide if barX is less than 0
                          x={Math.max(0, barX)}
                          y={barY + (barHeight / numberOfBars) * (numberOfBars / 2)}
                          dx={-10}
                          dy={-10}
                          textAnchor="end"
                          fontSize={12}
                          fill="lightBlue"
                        >
                          MP1: {new Date(task.start).toLocaleString().split(',')[0]}
                        </text>
                        <text
                          x={Math.max(0, barX) + barWidth - gap}
                          y={barY + (barHeight / numberOfBars) * (numberOfBars / 2)}
                          dx={10}
                          dy={-10}
                          textAnchor="start"
                          fontSize={12}
                          fill="pink"
                        >
                          Launch: {new Date(task.end).toLocaleString().split(',')[0]}
                        </text>
                      </>
                    )}
                  </Fragment>
                )
              })}

              {/* Axis */}

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
              <text x={xScale(new Date())} y={-10} textAnchor="middle" fill="red" fontSize={12}>
                Today
              </text>
              <Line
                stroke="red"
                strokeWidth={1}
                x1={xScale(new Date())}
                x2={xScale(new Date())}
                y1={0}
                y2={height + 5}
                strokeDasharray="5 5"
              />
              {showMilestones &&
                milestones
                  ?.filter((milestone) => milestone.due_date)
                  .map((milestone) => (
                    <Fragment key={milestone.id}>
                      <Line
                        stroke="yellow"
                        opacity={0.7}
                        strokeWidth={1}
                        x1={xScale(new Date(milestone.due_date))}
                        x2={xScale(new Date(milestone.due_date))}
                        y1={0}
                        y2={height + 5}
                      />
                      <text
                        x={xScale(new Date(milestone.due_date))}
                        y={20}
                        textAnchor="middle"
                        opacity={0.7}
                        fill="yellow"
                        fontSize={12}
                      >
                        <tspan x={xScale(new Date(milestone.due_date))} dy="0em">
                          {milestone.title}
                        </tspan>
                        <tspan x={xScale(new Date(milestone.due_date))} dy="1em">
                          {getNameForProject(milestone.project_id)}
                        </tspan>
                      </text>
                    </Fragment>
                  ))}
            </Group>
          </svg>
          {tooltipOpen && (
            <TooltipInPortal
              // set this to random so it correctly updates with parent bounds
              key={Math.random()}
              top={tooltipTop}
              left={tooltipLeft}
              style={{
                ...defaultStyles,
                backgroundColor: 'hsl(var(--accent))',
                color: 'hsl(var(--accent-foreground))'
              }}
              className="flex flex-col"
            >
              <h3 className="text-sm font-semibold">{tooltipData.task.name}</h3>
              <Label className="text-xs">
                Start: {new Date(tooltipData.task.start).toLocaleString().split(',')[0]}
              </Label>
              <Label className="text-xs">
                End: {new Date(tooltipData.task.end).toLocaleString().split(',')[0]}
              </Label>
            </TooltipInPortal>
          )}

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}
export default RoadmapPage
