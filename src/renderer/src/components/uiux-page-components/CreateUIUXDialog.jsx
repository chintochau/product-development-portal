import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useProducts } from '../../contexts/productsContext'

const CreateUIUXDialog = ({ onSubmit }) => {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState('')

  const { products } = useProducts()

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Form validation and data gathering
    const formData = new FormData(e.target)
    const featureData = Object.fromEntries(formData)
    onSubmit(featureData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New UI/UX Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New UI/UX Request</DialogTitle>
            <DialogDescription>Add a new UI/UX request to the list.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right font-medium col-span-1">Product</label>

            <Select name="product" value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {['Apps', ...defaultPlatforms].map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
                {products
                  .filter((product) => product.bluos)
                  .map((product) => (
                    <SelectItem key={product.iid} value={product.iid.toString()}>
                      {product.projectName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right font-medium col-span-1">
                Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Feature title"
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right font-medium col-span-1">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the feature..."
                className="col-span-3"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="by" className="text-right font-medium col-span-1">
                By
              </label>
              <Input id="by" name="by" placeholder="Enter name..." className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right font-medium col-span-1">Type</label>
              <div className="col-span-3 flex gap-4">
                <div className="flex items-center">
                  <input type="checkbox" id="app" name="app" className="mr-2" />
                  <label htmlFor="app">App</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="hardware" name="hardware" className="mr-2" />
                  <label htmlFor="hardware">Hardware</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="documentation" name="documentation" className="mr-2" />
                  <label htmlFor="documentation">Documentation</label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right font-medium col-span-1">Start Date</label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
                <input type="hidden" name="startDate" value={date ? date.toISOString() : ''} />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="estimate" className="text-right font-medium col-span-1">
                Estimate (days)
              </label>
              <Input id="estimate" name="estimate" type="number" min="1" className="col-span-3" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Feature</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
