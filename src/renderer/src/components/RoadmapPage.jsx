import React, { Fragment, useEffect, useRef, useState } from 'react'
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
const heightFactor = 65
const minimumWidth = 1200
const widthFactor = 5
const mainColor = '#0070f3' 
const epicColor = '#22c55e'
const hardwareColor = '#f59e0b'
const featureColor = '#ef4444' // red
const legendColorScale = scaleOrdinal({
  domain: ['Planned', 'Software', 'Hardware', 'Feature'],
  range: [mainColor, epicColor, hardwareColor, featureColor]
})

// Margins
const margin = { top: 20, right: 200, bottom: 40, left: 150 }

const RoadmapPage = ({ scrollTop }) => {
  const [chartData, setChartData] = useState([])
  const { products } = useProducts()
  const { epics, milestones, getFeatureEpics } = useSingleProduct()
  const [showMilestones, setShowMilestones] = useState(false)
  const [shouldLoadWrike, setShouldLoadWrike] = useState(false)
  const [shouldloadFeatures, setShouldloadFeatures] = useState(false)
  const { tooltipOpen, tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip()
  const [pointerX, setPointerX] = useState(null)

  const [scrollOffset, setScrollOffset] = useState(0)
  const [hoverBar, setHoverBar] = useState(null)

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    onTooltipOpenChange: () => {}
  })

  const handleMouseLeave = () => {
    hideTooltip()
  }

  const handleMouseOver = (data) => {
    showTooltip({
      tooltipData: data
    })
  }

  const handleMouseMove = (event) => {
    const { x, y } = localPoint(event)
    showTooltip((input) => ({
      ...input,
      tooltipLeft: x - scrollOffset,
      tooltipTop: y - scrollTop
    }))
  }

  useEffect(() => {
    if (products) {
      const newChartData = products.map((product, index) => {
        // launch: dayjs(Launch).format('YYYY-MM-DD'),
        // mp1Date: dayjs(MP1).format('YYYY-MM-DD'),
        // mp1DateActual: dayjs(mp1DateActual).format('YYYY-MM-DD'),
        // pifDate: dayjs(pifDate).format('YYYY-MM-DD'),
        // pifDateAccepted: dayjs(pifDateAccepted).format('YYYY-MM-DD'),
        // greenlightDate: dayjs(greenlightDate).format('YYYY-MM-DD'),
        // greenlightTargetMP: dayjs(greenlightTargetMPDate).format('YYYY-MM-DD'),

        const {
          launch,
          mp1Date,
          mp1DateActual,
          pifDate,
          pifDateAccepted,
          greenlightDate,
          greenlightTargetMP
        } = product || {}

        const milestoneDates = {
          launch,
          mp1Date,
          mp1DateActual,
          pifDate,
          pifDateAccepted,
          greenlightDate,
          greenlightTargetMP
        }

        // turn object into array
        const dates = Object.values(milestoneDates)
        const keys = Object.keys(milestoneDates)

        const earliestDate = dates
          .filter((date) => date)
          .sort((a, b) => new Date(a) - new Date(b))[0]

        const singleDates = keys
          .map((key, index) => {
            return {
              name: key,
              date: milestoneDates[key] && new Date(milestoneDates[key])
            }
          })
          .filter((date) => date.date)
        return {
          name: product.projectName,
          start: new Date(earliestDate),
          end: product.launch ? new Date(product.launch) : new Date(),
          fill: mainColor, // blue,
          epicId: product.epicId,
          wrikeId: product.wrikeId,
          type: 'product',
          opacity: 0.3,
          singleDates: singleDates
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
  const chartHeight = Math.max(height, filteredTasks.length * heightFactor)
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
            min={dayjs(minDate).subtract(2, 'month').toDate().getTime()}
            max={dayjs(maxDate).add(2, 'month').toDate().getTime()}
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
            tickValues={filteredTasks.map((t) => t.name)}
          />
        </svg>
        <ScrollArea
          className="max-w-[calc(100vw)] md:w-[calc(100vw-10rem)] "
          onScrollCapture={(event) => {
            setScrollOffset(event.target.scrollLeft)
          }}
        >
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
                    y2={chartHeight + 5}
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
              {filteredTasks.map((task, taskIndex) => {
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
                  <g
                    key={task.id}
                    onMouseEnter={(e) => {
                      setHoverBar(taskIndex)
                    }}
                  >
                    <rect
                      x={0}
                      y={barY - padding}
                      width={totalWidth} //full graph width
                      height={barHeight + 2*padding}
                      fill={hoverBar === taskIndex ? 'hsl(var(--accent))' : "transparent"}
                      rx={4}
                      opacity={0.2}
                    />
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
                      opacity={task.opacity}
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
                    {task.singleDates &&
                      task.singleDates.map((singleDateObject, INDEX) => {
                        const { name, date } = singleDateObject || {}
                        return (
                          <Fragment key={task.projectName}>
                            {date && (
                              <>
                                <Line
                                  x1={xScale(date)}
                                  x2={xScale(date)}
                                  y1={barY - gap}
                                  y2={barY + barHeight / numberOfBars - gap + gap}
                                  stroke="lightBlue"
                                  strokeWidth={2}
                                  opacity={0.5}
                                />
                                <text
                                  x={xScale(date)}
                                  y={
                                    INDEX % 2 === 0
                                      ? barY + barHeight / numberOfBars + 2 * gap
                                      : barY - gap
                                  }
                                  textAnchor="middle"
                                  fill="hsl(var(--muted-foreground))"
                                  fontSize={12}
                                >
                                  {name}
                                </text>
                              </>
                            )}
                          </Fragment>
                        )
                      })}
                  </g>
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
                top={chartHeight}
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
                y2={chartHeight + 5}
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
                        y2={chartHeight + 5}
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
                Start: {dayjs(tooltipData.task.start).format('MMM D, YYYY')}
              </Label>
              <Label className="text-xs">
                End: {dayjs(tooltipData.task.end).format('MMM D, YYYY')}
              </Label>
              {tooltipData.task.singleDates?.map((date) => (
                <Label key={date.id} className="text-xs">
                  {date.name} : {dayjs(date.date).format('MMM D, YYYY')}
                </Label>
              ))}
            </TooltipInPortal>
          )}

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}
export default RoadmapPage
