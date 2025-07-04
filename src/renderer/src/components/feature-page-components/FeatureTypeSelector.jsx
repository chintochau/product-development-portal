import React, { useState, useEffect } from 'react'
import { Checkbox } from '../../../../components/ui/checkbox'
import { Code, Cpu } from 'lucide-react'

const FeatureTypeSelector = ({ type, handleTypeChange, rowIndex }) => {
  const [featureType, setFeatureType] = useState(type)

  useEffect(() => {
    setFeatureType(type)
  }, [type])

  const handleChange = (value) => {
    const newFeatureType = { ...featureType, ...value }
    setFeatureType(newFeatureType)
    handleTypeChange(newFeatureType)
  }

  return (
    <div className="flex gap-4">
      <div className="flex items-center gap-2">
        <Checkbox
          id={`hardware-${rowIndex}`}
          checked={featureType?.hardware}
          onCheckedChange={(value) => handleChange({ hardware: value })}
          className="data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500/10 hidden"
        />
        <label
          htmlFor={`hardware-${rowIndex}`}
          className={`text-sm cursor-pointer ${
            featureType?.hardware ? 'text-orange-500 font-medium' : 'text-muted-foreground'
          }`}
        >
          <Cpu className="inline h-4 w-4 mr-1" />
          Hardware
        </label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id={`software-${rowIndex}`}
          checked={featureType?.software}
          onCheckedChange={(value) => handleChange({ software: value })}
          className="data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500/10 hidden"
        />
        <label
          htmlFor={`software-${rowIndex}`}
          className={`text-sm  cursor-pointer ${
            featureType?.software ? 'text-blue-500 font-medium' : 'text-muted-foreground'
          }`}
        >
          <Code className="inline h-4 w-4 mr-1" />
          Software
        </label>
      </div>
    </div>
  )
}

export default FeatureTypeSelector
