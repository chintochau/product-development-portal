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
import { createGitlabIssueInYamlFormat, saveGitlabIssue } from '../../services/gitlabServices'
import { useSingleProduct } from '../../contexts/singleProductContext'
import { defaultBrands, defaultStatus } from '../../constant'
import { Checkbox } from '@/components/ui/checkbox'
import { cn, findTeamByRole } from '../../../../lib/utils'
import { Textarea } from '../../../../components/ui/textarea'
import { useProducts } from '../../contexts/productsContext'
import { useNavigate } from 'react-router-dom'
import { Label } from '../../../../components/ui/label'
import { useUser } from '../../contexts/userContext'

const formSchema = z.object({
  useLookup: z.boolean(),
  lookup: z.string(), // integer
  brand: z.string(),
  projectName: z.string(),
  mp1Date: z.string(),
  launch: z.string(),
  status: z.string(),
  description: z.string(),
  model: z.string()
})

const today = new Date()
const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()) // Today
const maxDate = new Date(today.getFullYear(), today.getMonth() + 20, today.getDate()) // One month from today

const ProductEditPage = ({ editMode }) => {
  const { productData, iid } = useSingleProduct() || {}
  const { setShouldRefreshProducts } = useProducts()
  const navigate = useNavigate()
  const { user } = useUser()
  const { productDataFromExcel } = useProducts()
  const team = findTeamByRole(user?.role || '')

  const filteredProductList = productDataFromExcel
    ?.filter((product) =>
      product.status !== 'Concept' && team
        ? product.Brand.startsWith(team)
        : true && new Date(product.MP1) > new Date()
    )
    .sort((a, b) => {
      // compare MP1 Dates
      const dateA = new Date(a.MP1)
      const dateB = new Date(b.MP1)
      return dateA - dateB
    })

  const filteredBrands = defaultBrands.filter((brand) =>
    team ? brand.value.startsWith(team) : true
  )

  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      useLookup: false,
      brand: '',
      projectName: '',
      mp1Date: format(new Date(), 'yyyy-MM-dd'),
      launch: format(new Date(), 'yyyy-MM-dd'),
      lookup: '',
      status: '',
      description: '',
      model: ''
    }
  })

  // 2. Define a submit handler.
  const onSubmit = async (values) => {
    // prevent default
    if (editMode) {
      await saveGitlabIssue(iid, { ...productData, ...values })
      setShouldRefreshProducts(true)
      navigate(`/dashboard/${productData.iid}`)
    } else {
      const response = await createGitlabIssueInYamlFormat(values)
      setShouldRefreshProducts(true)
      navigate(`/dashboard/${response.iid}`)
    }
  }

  // Use the reset method to update form values when data is loaded
  useEffect(() => {
    if (productData && editMode) {
      console.log(productData)

      form.reset((previousValues) => ({
        ...previousValues,
        ...productData
      }))
    }
  }, [productData, form])

  return (
    <div className="px-4">
      <h1 className="text-2xl">{editMode ? 'Edit Product' : 'New Product'}</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="lookup"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 pt-2">
                  <Label className=" cursor-pointer" htmlFor="useLookup">
                    Use Data From Master Roadmap Excel
                  </Label>
                  <FormField
                    control={form.control}
                    name="useLookup"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Checkbox
                            id="useLookup"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-primary/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormLabel>

                {form.getValues('useLookup') && (
                  <Select
                    onValueChange={(value) => field.onChange(value)} // Ensure it's passed as a string
                    defaultValue={String(field.value)} // Convert to string
                    value={String(field.value)} // Ensure the value is a string
                  >
                    <FormControl>
                      <SelectTrigger className="w-fit  border-2 border-primary">
                        <SelectValue placeholder="Choose a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredProductList &&
                        filteredProductList.map((project) => {
                          const lookupValue = String(project['Lookup#']) // Ensure this is a string
                          return (
                            <SelectItem key={project.projectName} value={lookupValue}>
                              <div className="flex gap-4 items-end justify-between">
                                <div className="flex flex-col items-start">
                                  <p className="text-xs text-muted-foreground">{project.Brand}</p>
                                  <p>{project['Project Name']}</p>
                                </div>
                                <p>
                                  {project.MP1 && (
                                    <p>
                                      <span className="text-xs text-muted-foreground">MP1:</span>
                                      <span className="text-xs font-bold">
                                        {format(new Date(project.MP1), 'yyyy-MM-dd')}
                                      </span>
                                    </p>
                                  )}
                                </p>
                              </div>
                            </SelectItem>
                          )
                        })}
                    </SelectContent>
                  </Select>
                )}

                <FormMessage />
                <FormDescription> Only BluOS Products will be shown</FormDescription>
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
                    {filteredBrands.map((brand) => (
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
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} disabled={form.getValues('useLookup')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="optional"
                    {...field}
                    disabled={form.getValues('useLookup')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model#</FormLabel>
                <FormControl>
                  <Input placeholder="optional" {...field} disabled={form.getValues('useLookup')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mp1Date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Mass Production 1 Date:</FormLabel>
                <Popover>
                  <PopoverTrigger asChild disabled={form.getValues('useLookup')}>
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="launch"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Launch Date:</FormLabel>
                <Popover>
                  <PopoverTrigger asChild disabled={form.getValues('useLookup')}>
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  disabled={form.getValues('useLookup')}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder=" Choose a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {defaultStatus.map((brand) => (
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
          <Button type="submit">{editMode ? 'Save' : 'Submit'}</Button>
        </form>
      </Form>
    </div>
  )
}

export default ProductEditPage
