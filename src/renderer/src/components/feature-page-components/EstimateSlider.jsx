import React, { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Label } from '../../../../components/ui/label'
import dayjs from 'dayjs'

const maxDays = 365 // 2 years in days
const growthRate = 2.5 // Controls exponential growth (adjust as needed)

export const calculateDaysFromPercentage = (percentage) => {
    const days = Math.floor(maxDays * (percentage / 100) ** growthRate)
    return days
  }
const EstimateSlider = ({ days = 1, setDays, startDate, setStartDate }) => {
  const getEstimateFromSlider = (sliderValue) => {
    const days = Math.floor(maxDays * (sliderValue / 100) ** growthRate)
    if (days < 7) return `${days} day${days > 1 ? 's' : ''}` // Less than 7 days
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''}` // Weeks
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}` // Months
  }
  const [estimate, setEstimate] = useState(getEstimateFromSlider(days))

  const [estimateDays, setEstimateDays] = useState(days)

  // Convert slider percentage to time estimate using inverse exponential scaling



  const handleSliderChange = (value) => {
    console.log(value);
    
    const estimateText = getEstimateFromSlider(value[0])
    setEstimate(estimateText)
    setEstimateDays(value[0])
  }

  const handleSliderCommit = (value) => {
    setDays(value[0])
  }

  return (
    <div className="flex gap-3 items-center">
      <div className="flex flex-col w-40 gap-2">
        <p className='text-muted-foreground'>Estimate: <span className='font-bold text-primary'>{estimate}</span></p>
        <Slider
          defaultValue={[days]}
          max={100} // 0–100% for slider
          min={1}
          step={1}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
          className="w-full"
        />
      </div>

      <div>
        <div className='flex flex-col'>
          <Label className="text-muted-foreground/70">Start Date: </Label>
          <DatePicker
            className="bg-background hover:underline hover:cursor-pointer"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select a date"
          />
        </div>
        <div className='flex flex-col'>
          <Label className="text-muted-foreground/70">Estimated End Date:</Label>
          <p className=" cursor-not-allowed text-muted-foreground">
            {startDate && dayjs(startDate).add(calculateDaysFromPercentage(estimateDays), 'day').format('YYYY-MM-DD')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default EstimateSlider
