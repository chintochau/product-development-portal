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

import { defaultBrands, getBrandName } from '../constant'
import { useTickets } from '../contexts/ticketsContext'
import { legendColorScale, useRoadmap } from '../contexts/roadmapConetxt'
import { Slider } from '../../../components/ui/slider'
import { MinusIcon, MoveHorizontalIcon, MoveVerticalIcon, PlusIcon } from 'lucide-react'
import { getColorIntensityByLevel } from '../../../lib/utils'

const defaultHeight = 800
const heightFactor = 40
const minimumWidth = 1200
const defaultWidthFactor = 5
// Margins
const margin = { top: 20, right: 200, bottom: 40, left: 200 }

const RoadmapPage = ({ scrollTop }) => {
  const { milestones } = useSingleProduct()
  const [showMilestones, setShowMilestones] = useState(false)
  const { tooltipOpen, tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip()
  const [pointerX, setPointerX] = useState(null)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [hoverBar, setHoverBar] = useState(null)
  const {
    range,
    setRange,
    chartData,
    selectedBrands,
    setSelectedBrands,
    showDevelopers,
    setShowDevelopers,
    showSubTasks,
    setShowSubTasks,
    setShowAppsFeatures,
    showAppsFeatures,
    setShowBluosFeatures,
    showBluosFeatures
  } = useRoadmap()

  const checkboxLists = [
    {
      label: 'Apps',
      checked: showAppsFeatures,
      onChange: () => setShowAppsFeatures(!showAppsFeatures)
    },
    {
      label: 'Bluos',
      checked: showBluosFeatures,
      onChange: () => setShowBluosFeatures(!showBluosFeatures)
    },
    {
      label: 'Developers',
      checked: showDevelopers,
      onChange: () => setShowDevelopers(!showDevelopers)
    },
    {
      label: 'SubTasks',
      checked: showSubTasks,
      onChange: () => setShowSubTasks(!showSubTasks)
    },
    {
      label: 'Milestones',
      checked: showMilestones,
      onChange: () => setShowMilestones(!showMilestones)
    }
  ]

  const [height, setHeight] = useState(defaultHeight)
  const [widthFactor, setWidthFactor] = useState(defaultWidthFactor)

  // select a brand and add to the display array
  const handleBrandSelect = (brand) => {
    if (brand === 'all') {
      if (isBrandSelected('all')) {
        setSelectedBrands([])
      } else {
        setSelectedBrands(defaultBrands.map((item) => item.value))
      }
      return
    }

    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter((item) => item !== brand))
    } else {
      setSelectedBrands([...selectedBrands, brand])
    }
  }
  const isBrandSelected = (brand) => {
    if (brand === 'all') return selectedBrands.length === defaultBrands.length
    return selectedBrands.includes(brand)
  }

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

  // Initial Date Range
  const minDate = new Date(Math.min(...chartData.map((t) => t.start?.getTime())))
  const maxDate = new Date(Math.max(...chartData.map((t) => t.end?.getTime())))

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

  return (
    <>
      {/* Date Range Slider */}
      <div className="fixed top-0 bg-background w-full h-10 z-30" />
      <div className="px-4 sticky top-8 bg-background z-40 pb-3">
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
          <div className="flex flex-col justify-center gap-2">
            <div className="flex items-center space-x-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="all"
                  onCheckedChange={(checked) => handleBrandSelect('all')}
                  checked={isBrandSelected('all')}
                />
                <label
                  htmlFor="all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  All
                </label>
              </div>
              {defaultBrands.map((brand) => (
                <Fragment key={brand.value}>
                  <Checkbox
                    id={brand.value}
                    onCheckedChange={(checked) => handleBrandSelect(brand.value)}
                    checked={isBrandSelected(brand.value)}
                  />
                  <label
                    htmlFor={brand.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {brand.name}
                  </label>
                </Fragment>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              {
                checkboxLists.map((checkbox) => (
                  <Fragment key={checkbox.label}>
                    <Checkbox
                      id={checkbox.label}
                      onCheckedChange={checkbox.onChange}
                      checked={checkbox.checked}
                    />
                    <label
                      htmlFor={checkbox.label}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {checkbox.label}
                    </label>
                  </Fragment>
                ))
              }
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <MinusIcon className="w-4 h-4 text-secondary/70" />
            <Slider
              min={1}
              max={defaultWidthFactor * 2}
              className="w-52 h-4"
              sliderClassName="h-full "
              rangeClassName="bg-transparent"
              value={[widthFactor]}
              onValueChange={(value) => setWidthFactor(value[0])}
            />
            <PlusIcon className="w-4 h-4 text-secondary/70" />
          </div>
          <Ordinal scale={legendColorScale} direction="horizontal" />
        </div>
      </div>
      <div className="px-4">
        <div className="fixed left-30 top-40 flex flex-col items-center gap-1">
          <PlusIcon className="w-4 h-4 text-secondary/70" />
          <Slider
            orientation="vertical"
            min={300}
            max={defaultHeight * 8}
            className="w-4 h-40"
            sliderClassName="h-full"
            value={[height]}
            onValueChange={(value) => setHeight(value[0])}
          />
          <MinusIcon className="w-4 h-4 text-secondary/70" />
        </div>
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
                  const numberOfBars = showSubTasks ? subTasks?.length + 1 || 1 : 1
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
                      key={task.id || task.name || taskIndex}
                      onMouseEnter={(e) => {
                        setHoverBar(taskIndex)
                      }}
                    >
                      <rect
                        x={0}
                        y={barY - padding}
                        width={totalWidth} //full graph width
                        height={barHeight + 2 * padding}
                        fill={
                          hoverBar === taskIndex ? 'hsl(var(--muted-foreground))' : 'transparent'
                        }
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
                        // click to oopen link
                        onClick={() => {
                          if (task.url) {
                            window.open(task.url, '_blank')
                          }
                        }}
                      />
                      {
                        task.overlaps && task.overlaps.length > 0 && task.overlaps.map((overlap, index) => {
                          const color = getColorIntensityByLevel(overlap.overlap)
                          const overlapStart = xScale(overlap.start)
                          const overlapWidth = xScale(overlap.end) - overlapStart
                          return (
                            <Fragment key={index}>
                              <Bar
                                key={index}
                                x={overlapStart-1}
                                y={barY - 1}
                                width={overlapWidth + 2}
                                height={barHeight / numberOfBars - gap + 2}
                                fill={color}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                onMouseOver={() => handleMouseOver({ task })}
                              />
                            </Fragment>
                          )
                        })
                      }
                      {showSubTasks &&
                        subTasks?.length > 0 &&
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

                          const subBarHeight = barHeight / numberOfBars - gap
                          return (
                            <Fragment key={subTask.id}>
                              <Bar
                                key={subTask.id + index}
                                x={Math.max(0, subBarX)}
                                y={barY + (barHeight / numberOfBars) * (index + 1)}
                                width={subBarWidth}
                                height={subBarHeight}
                                fill={subTask.fill}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                onMouseOver={() => handleMouseOver({ task: subTask })}
                                rx={subBarHeight/2}
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
                                    stroke="hsl(var(--alternative))"
                                    strokeWidth={2}
                                  />
                                  <text
                                    x={xScale(date)}
                                    y={
                                      INDEX % 2 === 0
                                        ? barY + barHeight / numberOfBars + 2 * gap
                                        : barY - gap
                                    }
                                    textAnchor="middle"
                                    fill="hsl(var(--primary))"
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
                    .map((milestone, index) => (
                      <Fragment key={milestone.id}>
                        {/* Line to indicate the milestone */}
                        <Line
                          stroke="hsl(var(--alternative))"
                          opacity={0.7}
                          strokeWidth={1}
                          x1={xScale(new Date(milestone.due_date))}
                          x2={xScale(new Date(milestone.due_date))}
                          y1={0}
                          y2={chartHeight + 5}
                        />
                        {(() => {
                          const text = `${getNameForProject(milestone.project_id)} ${milestone.title}`
                          const padding = 10
                          const textWidth = text.length * 6 // Approximate width per character
                          const rectWidth = textWidth + padding * 2
                          const height = 15

                          return (
                            <>
                              {/* Background Rect */}
                              <rect
                                x={xScale(new Date(milestone.due_date)) - rectWidth / 2}
                                y={10 + index * 20 - 10}
                                width={rectWidth}
                                height={height}
                                fill="hsl(var(--alternative))"
                                rx={4}
                              />
                              {/* Text */}
                              <text
                                x={xScale(new Date(milestone.due_date))}
                                y={10 + index * 20 + 2} /* Center text vertically */
                                textAnchor="middle"
                                fill="hsl(var(--alternative-foreground))"
                                fontSize={12}
                              >
                                {text}
                              </text>
                            </>
                          )
                        })()}
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
                  backgroundColor: 'hsl(var(--sidebar-background))',
                  color: 'hsl(var(--accent-foreground))'
                }}
                className="flex flex-col"
              >
                <h3 className="text-sm font-semibold text-primary">{tooltipData.task.name}</h3>
                <Label className="text-sm text-primary/80">
                  {getBrandName(tooltipData.task.brand)}
                </Label>
                <p className="text-xs text-muted-foreground max-w-80">
                  {tooltipData.task.description}
                </p>
                <p className="text-muted-foreground">{tooltipData.task.developer?.join(', ')}</p>
                <div className="border-t border-primary/50 my-2" />
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

            <ScrollBar
              orientation="horizontal"
              className="hover:text-secondary "
              style={{ position: 'fixed', bottom: 2, width: '100%' }}
            />
          </ScrollArea>
        </div>
      </div>
    </>
  )
}
export default RoadmapPage
