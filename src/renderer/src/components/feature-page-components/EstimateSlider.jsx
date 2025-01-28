import React, { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Label } from '../../../../components/ui/label'
import dayjs from 'dayjs'
import { Trash, X } from 'lucide-react'

const maxDays = 365 // 2 years in days
const growthRate = 2.5 // Controls exponential growth (adjust as needed)

export const calculateDaysFromPercentage = (percentage) => {
  const days = Math.floor(maxDays * (percentage / 100) ** growthRate)
  return days
}

const getEstimateFromSlider = (sliderValue) => {
  const days = calculateDaysFromPercentage(sliderValue)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''}` // Less than 7 days
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''}` // Weeks
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}` // Months
}

const daysToSliderValue = (days) => {
  const percentage = (Math.min(days, maxDays) / maxDays) ** (1 / growthRate) * 100
  return Math.min(100, Math.max(1, percentage)) // Clamp between 1-100
}

const EstimateSlider = ({ days = 1, setDays, startDate, setStartDate }) => {
  const [sliderValue, setSliderValue] = useState(daysToSliderValue(days))

  // Sync slider value when days prop changes
  useEffect(() => {
    setSliderValue(daysToSliderValue(days))
  }, [days])

  const handleSliderChange = (value) => {
    setSliderValue(value[0])
  }

  const handleSliderCommit = (value) => {
    const newDays = calculateDaysFromPercentage(value[0])
    setDays(newDays)
  }

  const estimate = getEstimateFromSlider(sliderValue)
  const daysValue = calculateDaysFromPercentage(sliderValue)

  return (
    <div className="flex gap-10 items-center">
      <div className="flex flex-col w-40 gap-2">
        <p className='text-muted-foreground'>Estimate: <span className='font-bold text-primary'>{estimate}</span></p>
        <Slider
          value={[sliderValue]}
          max={100}
          min={1}
          step={1}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
          className="w-full"
          rangeClassName="bg-secondary"
        />
      </div>

      <div>
        <div className='flex flex-col'>
          <div className='flex gap-2'>
            <div className='flex items-center gap-2'>
              <Label className="text-muted-foreground/70">Start: </Label>
              <DatePicker
                className="bg-background hover:underline hover:cursor-pointer w-28"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="MMM D, yyyy"
                placeholderText="Select a date"
              />
              {startDate && <X className='size-3 hover:text-red-500 cursor-pointer text-muted-foreground/50 transition-all duration-300' onClick={() => setStartDate(null)} />}
            </div>
          </div>
        </div>
        <div className='flex flex-col'>
          <div className='flex gap-4 items-center'>
            <Label className="text-muted-foreground/70">Due:</Label>
            <p className="cursor-not-allowed text-muted-foreground">
              {startDate && dayjs(startDate).add(daysValue, 'day').format('MMM D, YYYY')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EstimateSlider