import React, { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { createNewProductTicket, saveTicket } from '../../services/gitlabServices'
import { useSingleProduct } from '../../contexts/singleProductContext'
import { brands } from '../../constant'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '../../../../lib/utils'

const formSchema = z.object({
  useLookup: z.boolean(),
  brand: z.string().min(2).max(50),
  productcode: z.string().min(2).max(50),
  productname: z.string().max(50),
  releasedate: z.string(),
  lookup: z.string()
})

const today = new Date()
const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()) // Today
const maxDate = new Date(today.getFullYear(), today.getMonth() + 20, today.getDate()) // One month from today

const ProductEditPage = ({ editMode }) => {
  const { productData: data, iid } = useSingleProduct() || {}
  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      useLookup: false,
      brand: '',
      productname: '',
      productcode: '',
      releasedate: format(new Date(), 'yyyy-MM-dd'),
      lookup: ''
    }
  })

  // 2. Define a submit handler.
  function onSubmit(values) {
    // prevent default
    if (editMode) {
      saveTicket(iid, values)
    } else {
      createNewProductTicket(values)
    }
  }

  // Use the reset method to update form values when data is loaded
  useEffect(() => {
    if (data) {
      form.reset((previousValues) => ({
        ...previousValues,
        ...data
      }))
    }
  }, [data, form])

  return (
    <div className="px-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="lookup"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 pt-2">
                  <p>Lookup#{' '}</p>
                  <FormField
                    control={form.control}
                    name="useLookup"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange}  className="border-primary/50"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  disabled={form.getValues('useLookup')}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder=" Choose a brand" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.value} value={brand.value}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="productcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Code</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} 
                  disabled={form.getValues('useLookup')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="productname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="optional" {...field} 
                  disabled={form.getValues('useLookup')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="releasedate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Target Release Date:</FormLabel>
                <Popover>
                  <PopoverTrigger asChild
                  disabled={form.getValues('useLookup')}
                  >
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-[240px] pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => field.onChange(date.toISOString().split('T')[0])}
                      disabled={
                        (date) => date < minDate || date > maxDate // Disable dates outside the range
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Estimate the Target Release Date</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">{editMode ? 'Save' : 'Submit'}</Button>
        </form>
      </Form>
    </div>
  )
}

export default ProductEditPage
