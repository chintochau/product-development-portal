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
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '../../../lib/utils'
import { CalendarIcon } from 'lucide-react'
import { createNewProductTicket, saveTicket } from '../services/gitlabServices'
import { useSingleProduct } from '../contexts/singleProductContext'

const formSchema = z.object({
  productcode: z.string().min(2).max(50),
  productname: z.string().max(50),
  releasedate: z.string()
})

const today = new Date()
const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()) // Today
const maxDate = new Date(today.getFullYear(), today.getMonth() + 20, today.getDate()) // One month from today

const ProductEditPage = ({ editMode }) => {
  const { productData: data,iid } = useSingleProduct() || {}
  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productname: '',
      productcode: '',
      releasedate: format(new Date(), 'yyyy-MM-dd')
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
            name="productcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Code</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
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
                  <Input placeholder="optional" {...field} />
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
                  <PopoverTrigger asChild>
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
