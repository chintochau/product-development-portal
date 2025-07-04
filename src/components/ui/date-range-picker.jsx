import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const DatePickerWithRange = ({ date, setDate }) => {
  const handleChange = (dates) => {
    const [start, end] = dates
    setDate({ from: start, to: end })
  }

  return (
    <div className="relative w-full">
      <DatePicker
        selected={date.from}
        onChange={handleChange}
        startDate={date.from}
        endDate={date.to}
        selectsRange
        isClearable
        placeholderText="Select date range"
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

export default DatePickerWithRange
