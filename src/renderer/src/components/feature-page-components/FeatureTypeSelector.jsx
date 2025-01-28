import React, { useState, useEffect } from 'react';
import { Checkbox } from '../../../../components/ui/checkbox';

const FeatureTypeSelector = ({ type, handleTypeChange, rowIndex }) => {
  const [featureType, setFeatureType] = useState(type);

  // Sync internal state with prop updates
  useEffect(() => {
    setFeatureType(type);
  }, [type]);

  const handleChange = (value) => {
    const newFeatureType = { ...featureType, ...value };
    setFeatureType(newFeatureType);
    handleTypeChange(newFeatureType);
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* Hardware Checkbox */}
      <div className="flex items-center gap-2">
        <Checkbox
          id={`hardware-${rowIndex}`} // Use rowIndex for unique ID
          checked={featureType?.hardware}
          onCheckedChange={(value) => handleChange({ hardware: value })}
        />
        <label
          htmlFor={`hardware-${rowIndex}`}
          className={
            featureType?.hardware
              ? 'text-orange-500' // Apply text-primary when selected
              : 'text-muted-foreground' // Apply text-muted-foreground when not selected
          }
        >
          Hardware
        </label>
      </div>

      {/* Software Checkbox */}
      <div className="flex items-center gap-2">
        <Checkbox
          id={`software-${rowIndex}`} // Use rowIndex for unique ID
          checked={featureType?.software}
          onCheckedChange={(value) => handleChange({ software: value })}
        />
        <label
          htmlFor={`software-${rowIndex}`}
          className={
            featureType?.software
              ? 'text-blue-500' // Apply text-primary when selected
              : 'text-muted-foreground' // Apply text-muted-foreground when not selected
          }
        >
          Software
        </label>
      </div>
    </div>
  );
};

export default FeatureTypeSelector;