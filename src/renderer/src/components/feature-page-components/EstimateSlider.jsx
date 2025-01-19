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
    <div className="w-60 p-4 flex  flex-col gap-2">
      <div className="flex flex-col py-2">
        <p className="text-lg">Estimate: {estimate}</p>
        <Slider
          defaultValue={[days]}
          max={100} // 0–100% for slider
          min={1}
          step={1}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
          className="w-full"
        />
        <div className="flex justify-between w-full mt-2 text-sm text-gray-500">
          <span>1 day</span>
          <span>2 weeks</span>
          <span>3 months</span>
          <span>1 year</span>
        </div>
      </div>

      <div>
        <div>
          <Label>Start Date: </Label>
          <DatePicker
            className="bg-background hover:underline hover:cursor-pointer"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select a date"
          />
        </div>
        <div>
          <Label>Estimated End Date:</Label>
          <p className=" cursor-not-allowed text-muted-foreground">
            {startDate && dayjs(startDate).add(calculateDaysFromPercentage(estimateDays), 'day').format('YYYY-MM-DD')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default EstimateSlider
