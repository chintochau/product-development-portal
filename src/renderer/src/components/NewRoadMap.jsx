import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Group } from '@visx/group'
import { scaleTime, scaleLinear } from '@visx/scale'
import { AxisBottom } from '@visx/axis'
import { timeFormat } from 'd3-time-format'
import { Zoom } from '@visx/zoom'
import { localPoint } from '@visx/event'
import { interpolateRdYlGn } from 'd3'
import { useRoadmap } from '../contexts/roadmapConetxt'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import FrameWraper from './frameWarper'
import { DualRangeSlider } from '@/components/ui/dual-range-slider'
import dayjs from 'dayjs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Eye, EyeClosed } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

// Define the margins for the chart
const margin = { top: 40, right: 40, bottom: 60, left: 200 }

// For rendering date in tooltip and axes
const formatDate = timeFormat('%b %d, %Y')
const formatAxisDate = timeFormat('%b %Y')

// Task height settings
const TASK_HEIGHT = 30
const SUBTASK_HEIGHT = 20
const TASK_GAP = 15
const SUBTASK_GAP = 5

// Task item for drag and drop functionality
const DraggableTask = ({ id, index, moveTask, children }) => {
  const ref = useRef(null)

  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  const [, drop] = useDrop({
    accept: 'TASK',
    hover: (item, monitor) => {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      moveTask(dragIndex, hoverIndex)

      // Update the item's index for the next hover
      item.index = hoverIndex
    }
  })

  drag(drop(ref))

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move'
      }}
    >
      {children}
    </div>
  )
}

const InteractiveRoadmap = () => {
  const { chartData, updateChartData } = useRoadmap()

  // Use data from context or fallback to empty array
  const [roadmapData, setRoadmapData] = useState([])

  useEffect(() => {
    if (chartData && chartData.length > 0) {
      setRoadmapData([...chartData])
    }
  }, [chartData])

  // Move task function for drag and drop
  const moveTask = useCallback(
    (dragIndex, hoverIndex) => {
      const draggedTask = roadmapData[dragIndex]
      const newTasks = [...roadmapData]
      newTasks.splice(dragIndex, 1)
      newTasks.splice(hoverIndex, 0, draggedTask)

      setRoadmapData(newTasks)

      // Update the context if available
      if (updateChartData) {
        updateChartData(newTasks)
      }
    },
    [roadmapData, updateChartData]
  )

  // Find first and last date in the data
  const allDates = roadmapData.flatMap((task) => {
    const dates = [new Date(task.start), new Date(task.end)]
    if (task.subTasks) {
      task.subTasks.forEach((subtask) => {
        dates.push(new Date(subtask.start), new Date(subtask.end))
      })
    }
    return dates
  })

  const defaultMinDate = allDates.length ? new Date(Math.min(...allDates)) : new Date()
  const defaultMaxDate = allDates.length ? new Date(Math.max(...allDates)) : new Date()

  // Add a buffer to start and end dates (1 month on each side)
  defaultMinDate.setMonth(defaultMinDate.getMonth() - 1)
  defaultMaxDate.setMonth(defaultMaxDate.getMonth() + 8)

  // State for date range filter
  const [dateRange, setDateRange] = useState({
    min: defaultMinDate,
    max: defaultMaxDate
  })

  // State for hover date display
  const [hoverDate, setHoverDate] = useState(null)

  // State for toggling subtasks
  const [showSubtasks, setShowSubtasks] = useState({})
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null })

  // Container ref for responsive sizing
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 })

  // Update dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect()
        setDimensions((prev) => ({ ...prev, width: width - 400 }))
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    return () => {
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  // Update height based on visible tasks
  useEffect(() => {
    const height = roadmapData.reduce((acc, task, index) => {
      const showSubtasksForThis = showSubtasks[task.id]
      const taskHeight = TASK_HEIGHT
      const subtasksHeight =
        showSubtasksForThis && task.subTasks
          ? SUBTASK_HEIGHT * task.subTasks.length + SUBTASK_GAP
          : 0

      return acc + taskHeight + subtasksHeight + TASK_GAP
    }, margin.top + margin.bottom)

    setDimensions((prev) => ({ ...prev, height }))
  }, [roadmapData, showSubtasks])

  // Toggle visibility of subtasks for a specific task
  const toggleSubtasks = (taskId) => {
    setShowSubtasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId]
    }))
  }

  // Create scales
  const timeScale = scaleTime({
    domain: [dateRange.min, dateRange.max],
    range: [margin.left, dimensions.width - margin.right]
  })

  // Function to get color based on overlap count
  const getOverlapColor = (overlap) => {
    if (overlap === 0) return 'transparent'
    // Use d3's interpolateRdYlGn (reversed) for color scale from green to red
    return interpolateRdYlGn(1 - overlap / 3) // Assuming max overlap is 3, adjust as needed
  }

  // Function to handle date range changes
  const handleDateRangeChange = (event, type) => {
    const date = new Date(event.target.value)
    console.log(date)

    setDateRange((prev) => ({
      ...prev,
      [type]: date
    }))
  }

  const handleDateRangeChangeWithSlider = (dateRange) => {
    // dateRagnge = [min in milliseconds,max in milliseconds]
    setDateRange((prev) => ({
      ...prev,
      min: new Date(dateRange[0]),
      max: new Date(dateRange[1])
    }))
  }

  // Format date for date input
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0]
  }

  // Handle mouse movement for date display
  const handleMouseMove = useCallback(
    (event) => {
      if (!containerRef.current) return

      const svgRect = containerRef.current.getBoundingClientRect()
      const x = event.clientX - svgRect.left

      // Only show date if mouse is in the chart area
      if (x >= margin.left && x <= dimensions.width - margin.right) {
        const date = timeScale.invert(x)
        setHoverDate(date)
      } else {
        setHoverDate(null)
      }
    },
    [timeScale, dimensions.width]
  )

  // Render a single task bar
  const renderTask = (task, yPosition, showSubtasksForThis) => {
    const startX = timeScale(new Date(task.start))
    const endX = timeScale(new Date(task.end))
    const taskWidth = Math.max(endX - startX, 5) // Ensure minimum width

    return (
      <g key={task.id}>
        {/* Main task bar */}
        <rect
          x={startX}
          y={yPosition}
          width={taskWidth}
          height={TASK_HEIGHT}
          rx={4}
          fill={task.fill || '#ccc'}
          stroke="#888"
          strokeWidth={1}
          onMouseEnter={(e) => {
            const point = localPoint(e)
            setTooltip({
              visible: true,
              x: point?.x || 0,
              y: point?.y || 0,
              content: (
                <div>
                  <div>
                    <strong>{task.name}</strong>
                  </div>
                  {task.description && <div>{task.description}</div>}
                  <div>From: {formatDate(new Date(task.start))}</div>
                  <div>To: {formatDate(new Date(task.end))}</div>
                  {task.brand && <div>Brand: {task.brand}</div>}
                  {task.developer && <div>Developer: {task.developer.join(', ')}</div>}
                </div>
              )
            })
          }}
          onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, content: null })}
        />

        {/* Task name */}
        <text
          x={startX - 5}
          y={yPosition + TASK_HEIGHT / 2}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={12}
          fontWeight="500"
          className="fill-foreground"
        >
          {task.name}
        </text>

        {/* Toggle button if task has subtasks */}
        {task.subTasks && task.subTasks.length > 0 && (
          <g onClick={() => toggleSubtasks(task.id)} style={{ cursor: 'pointer' }}>
            <circle
              cx={startX - 15}
              cy={yPosition + TASK_HEIGHT / 2}
              r={7}
              fill="#ddd"
              stroke="#888"
            />
            <text
              x={startX - 15}
              y={yPosition + TASK_HEIGHT / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fontWeight="bold"
            >
              {showSubtasksForThis ? '-' : '+'}
            </text>
          </g>
        )}

        {/* Milestone markers */}
        {task.singleDates &&
          task.singleDates.map((milestone, i) => (
            <g key={i}>
              <line
                x1={timeScale(new Date(milestone.date))}
                y1={yPosition}
                x2={timeScale(new Date(milestone.date))}
                y2={yPosition + TASK_HEIGHT}
                stroke="#000"
                strokeWidth={2}
                strokeDasharray="3,2"
              />
              <circle
                cx={timeScale(new Date(milestone.date))}
                cy={yPosition + TASK_HEIGHT / 2}
                r={4}
                fill="black"
              />
              <text
                x={timeScale(new Date(milestone.date))}
                y={yPosition - 5}
                textAnchor="middle"
                fontSize={10}
              >
                {milestone.name}
              </text>
            </g>
          ))}

        {/* Render overlaps if present */}
        {task.overlaps &&
          task.overlaps.map((overlap, i) => {
            const overlapStartX = timeScale(new Date(overlap.start))
            const overlapEndX = timeScale(new Date(overlap.end))
            const overlapWidth = Math.max(overlapEndX - overlapStartX, 5)

            return (
              <g key={`overlap-${i}`}>
                <rect
                  x={overlapStartX}
                  y={yPosition}
                  width={overlapWidth}
                  height={TASK_HEIGHT}
                  fill={getOverlapColor(overlap.overlap)}
                  fillOpacity={0.7}
                  onMouseEnter={(e) => {
                    const point = localPoint(e)
                    setTooltip({
                      visible: true,
                      x: point?.x || 0,
                      y: point?.y || 0,
                      content: (
                        <div>
                          <div>
                            <strong>Resource Overlap</strong>
                          </div>
                          <div>Overlap count: {overlap.overlap}</div>
                          <div>From: {formatDate(new Date(overlap.start))}</div>
                          <div>To: {formatDate(new Date(overlap.end))}</div>
                        </div>
                      )
                    })
                  }}
                  onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, content: null })}
                />
                <text
                  x={overlapStartX + overlapWidth / 2}
                  y={yPosition + TASK_HEIGHT / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={12}
                  fontWeight="bold"
                  fill="#333"
                >
                  {overlap.overlap > 0 ? overlap.overlap : ''}
                </text>
              </g>
            )
          })}

        {/* Render subtasks if visible */}
        {task.subTasks &&
          showSubtasksForThis &&
          task.subTasks.map((subtask, i) => {
            const subtaskStartX = timeScale(new Date(subtask.start))
            const subtaskEndX = timeScale(new Date(subtask.end))
            const subtaskWidth = Math.max(subtaskEndX - subtaskStartX, 5)
            const subtaskY = yPosition + TASK_HEIGHT + SUBTASK_GAP + i * SUBTASK_HEIGHT

            return (
              <g key={subtask.id}>
                <rect
                  x={subtaskStartX}
                  y={subtaskY}
                  width={subtaskWidth}
                  height={SUBTASK_HEIGHT}
                  rx={3}
                  fill={subtask.fill || '#eee'}
                  stroke="#999"
                  strokeWidth={1}
                  onMouseEnter={(e) => {
                    const point = localPoint(e)
                    setTooltip({
                      visible: true,
                      x: point?.x || 0,
                      y: point?.y || 0,
                      content: (
                        <div>
                          <div>
                            <strong>{subtask.name}</strong>
                          </div>
                          <div>From: {formatDate(new Date(subtask.start))}</div>
                          <div>To: {formatDate(new Date(subtask.end))}</div>
                          {subtask.developer && (
                            <div>Developer: {subtask.developer.join(', ')}</div>
                          )}
                        </div>
                      )
                    })
                  }}
                  onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, content: null })}
                />
                <text
                  x={subtaskStartX + 5}
                  y={subtaskY + SUBTASK_HEIGHT / 2}
                  dominantBaseline="middle"
                  fontSize={10}
                  className="fill-foreground"
                  textAnchor="start"
                >
                  {subtask.name.length > 30 ? subtask.name.substring(0, 30) + '...' : subtask.name}
                </text>
              </g>
            )
          })}
      </g>
    )
  }

  // Main render function
  return (
    <DndProvider backend={HTML5Backend}>
      <FrameWraper>
        <div className="relative flex flex-col w-full h-full" ref={containerRef}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 p-2 bg-muted rounded-md gap-2">
            <h2 className="text-xl font-bold">Product Roadmap</h2>

            {/* Date range controls */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2">
                <label htmlFor="startDate" className="text-sm">
                  Start:
                </label>
                <input
                  id="startDate"
                  type="date"
                  className="px-2 py-1 text-sm border rounded"
                  value={formatDateForInput(dateRange.min)}
                  onChange={(e) => handleDateRangeChange(e, 'min')}
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="endDate" className="text-sm">
                  End:
                </label>
                <input
                  id="endDate"
                  type="date"
                  className="px-2 py-1 text-sm border rounded"
                  value={formatDateForInput(dateRange.max)}
                  onChange={(e) => handleDateRangeChange(e, 'max')}
                />
              </div>
              <DualRangeSlider
                min={dayjs(defaultMinDate).subtract(2, 'month').toDate().getTime()}
                max={dayjs(defaultMaxDate).add(2, 'month').toDate().getTime()}
                step={24 * 60 * 60 * 1000 * 30} // 1 week in milliseconds
                value={[dateRange.min.getTime(), dateRange.max.getTime()]}
                onValueChange={handleDateRangeChangeWithSlider}
              />
            </div>

            <div className="flex gap-2">
              <button
                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                onClick={() =>
                  setShowSubtasks(
                    roadmapData.reduce((acc, task) => {
                      if (task.subTasks && task.subTasks.length) {
                        acc[task.id] = true
                      }
                      return acc
                    }, {})
                  )
                }
              >
                Show All Subtasks
              </button>
              <button
                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                onClick={() => setShowSubtasks({})}
              >
                Hide All Subtasks
              </button>
            </div>
          </div>

          {/* Current hover date display */}
          {hoverDate && (
            <div className="absolute top-16 right-2 bg-white border border-gray-300 rounded-md shadow-md p-1 z-10 text-sm">
              {formatDate(hoverDate)}
            </div>
          )}

          <div className="flex-1 flex overflow-hidden border border-border rounded-md">
            {/* Task reordering panel */}
            <ScrollArea className=" max-h-[calc(100vh-100px)]">
              <div className="mt-4 border border-border rounded-md p-2 w-96">
                <h3 className="text-md font-semibold mb-2">Reorder Tasks</h3>
                <div className=" overflow-y-auto">
                  {roadmapData.map((task, index) => (
                    <DraggableTask key={task.id} id={task.id} index={index} moveTask={moveTask}>
                      <div className="p-2 mb-1 border border-gray-200 rounded bg-white hover:bg-gray-50 flex items-center gap-2">
                        <div className="p-1 rounded bg-gray-200">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                            <line x1="3" y1="6" x2="3.01" y2="6"></line>
                            <line x1="3" y1="12" x2="3.01" y2="12"></line>
                            <line x1="3" y1="18" x2="3.01" y2="18"></line>
                          </svg>
                        </div>
                        <span className="text-sm">{task.name}</span>
                        {task.subTasks?.length > 0 && (
                          <button
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all 
      ${showSubtasks[task.id] ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            onClick={() => setShowSubtasks({ [task.id]: !showSubtasks[task.id] })}
                          >
                            {/* Toggle Text */}
                            {showSubtasks[task.id] ? 'Hide Subtasks' : 'Show Subtasks'}

                            {/* Switch UI */}
                            <div
                              className={`w-10 h-5 flex items-center rounded-full p-1 transition-all 
        ${showSubtasks[task.id] ? 'bg-white' : 'bg-gray-400'}`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full shadow-md transition-all 
          ${showSubtasks[task.id] ? 'translate-x-5 bg-blue-500' : 'bg-white'}`}
                              />
                            </div>
                          </button>
                        )}
                      </div>
                    </DraggableTask>
                  ))}
                </div>
              </div>
            </ScrollArea>

            <Zoom
              width={dimensions.width}
              height={dimensions.height}
              scaleXMin={0.5}
              scaleXMax={5}
              scaleYMin={0.5}
              scaleYMax={5}
            >
              {(zoom) => (
                <div className="relative">
                  <svg
                    width={dimensions.width}
                    height={dimensions.height}
                    style={{
                      cursor: zoom.isDragging ? 'grabbing' : 'grab',
                      touchAction: 'none'
                    }}
                    ref={zoom.containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoverDate(null)}
                  >
                    <rect
                      width={dimensions.width}
                      height={dimensions.height}
                      fill="white"
                      onTouchStart={zoom.dragStart}
                      onTouchMove={zoom.dragMove}
                      onTouchEnd={zoom.dragEnd}
                      onMouseDown={zoom.dragStart}
                      onMouseMove={zoom.dragMove}
                      onMouseUp={zoom.dragEnd}
                      onMouseLeave={() => {
                        if (zoom.isDragging) zoom.dragEnd()
                      }}
                    />

                    <Group transform={zoom.toString()}>
                      {/* Render axis */}
                      <AxisBottom
                        top={margin.top - 20}
                        scale={timeScale}
                        numTicks={10}
                        tickFormat={formatAxisDate}
                        stroke="#333"
                        tickStroke="#333"
                        tickLabelProps={() => ({
                          fill: '#333',
                          fontSize: 10,
                          textAnchor: 'middle'
                        })}
                      />

                      {/* Render grid lines */}
                      {timeScale.ticks(10).map((date, i) => (
                        <line
                          key={i}
                          x1={timeScale(date)}
                          x2={timeScale(date)}
                          y1={margin.top}
                          y2={dimensions.height - margin.bottom}
                          stroke="#eee"
                          strokeWidth={1}
                        />
                      ))}

                      {/* Render current date line */}
                      <line
                        x1={timeScale(new Date())}
                        x2={timeScale(new Date())}
                        y1={margin.top - 20}
                        y2={dimensions.height - margin.bottom}
                        stroke="red"
                        strokeWidth={2}
                        strokeDasharray="5,5"
                      />
                      <text
                        x={timeScale(new Date())}
                        y={margin.top - 25}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight="bold"
                        fill="red"
                      >
                        Today
                      </text>

                      {/* Render mouse hover lines */}
                      {/* <line
                        key="hover-line"
                        x1={hoverDate ? timeScale(hoverDate) : 0}
                        x2={hoverDate ? timeScale(hoverDate) : 0}
                        y1={margin.top}
                        y2={dimensions.height - margin.bottom}
                        stroke="blue"
                        strokeWidth={2}
                      /> */}

                      {/* Render all tasks */}
                      {roadmapData.reduce((elements, task, index) => {
                        const showSubtasksForThis = showSubtasks[task.id]

                        // Calculate y position based on previous tasks
                        let yPosition = margin.top
                        for (let i = 0; i < index; i++) {
                          const previousTask = roadmapData[i]
                          const previousSubtasksVisible = showSubtasks[previousTask.id]
                          const previousTaskHeight = TASK_HEIGHT
                          const previousSubtasksHeight =
                            previousSubtasksVisible && previousTask.subTasks
                              ? SUBTASK_HEIGHT * previousTask.subTasks.length + SUBTASK_GAP
                              : 0

                          yPosition += previousTaskHeight + previousSubtasksHeight + TASK_GAP
                        }

                        elements.push(renderTask(task, yPosition, showSubtasksForThis))
                        return elements
                      }, [])}
                    </Group>
                  </svg>

                  {/* Zoom controls */}
                  <div className="absolute top-2 right-2 flex flex-col bg-white border border-border rounded-md p-1">
                    <button
                      className="p-1 mb-1 hover:bg-muted rounded"
                      onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                    </button>
                    <button
                      className="p-1 mb-1 hover:bg-muted rounded"
                      onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                    </button>
                    <button className="p-1 hover:bg-muted rounded" onClick={zoom.reset}>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 2v6h6"></path>
                        <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
                        <path d="M21 22v-6h-6"></path>
                        <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
                      </svg>
                    </button>
                  </div>

                  {/* Tooltip */}
                  {tooltip.visible && (
                    <div
                      className="absolute z-10 p-2 bg-white border border-gray-300 rounded-md shadow-lg text-sm"
                      style={{
                        left: tooltip.x + 10,
                        top: tooltip.y + 10,
                        maxWidth: '300px'
                      }}
                    >
                      {tooltip.content}
                    </div>
                  )}
                </div>
              )}
            </Zoom>
          </div>
        </div>
      </FrameWraper>
    </DndProvider>
  )
}

export default InteractiveRoadmap
