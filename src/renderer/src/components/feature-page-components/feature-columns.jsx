import { cn, daysFromToday } from '@/lib/utils'
import { useProducts } from '../../contexts/productsContext'
import ProductDropdown from './ProductDropdown'
import { deleteFeatureRequestIssue, updateFeatureRequestIssue } from '../../services/gitlabServices'
import { useTickets } from '../../contexts/ticketsContext'
import { useState } from 'react'
import { DeveloperDropdown } from '../DeveloperPage'
import { useDevelopers } from '../../contexts/developerContext'
import EstimateSlider from './EstimateSlider'
import { Button } from '../../../../components/ui/button'
import { ArrowUpDown, Check, Trash } from 'lucide-react'
import { Input } from '../../../../components/ui/input'
import dayjs from 'dayjs'
import { Checkbox } from '../../../../components/ui/checkbox'
import FeatureTypeSelector from './FeatureTypeSelector'
import PriorityDropdown from './PriorityDropdown'

export const featureColumns = [
  {
    accessorKey: 'title',
    header: 'Title',
    size: 180,
    cell: ({ row }) => {
      const { title, description, created_at } = row.original || {}
      return (
        <div className="">
          <p className="text-primary ">{title}</p>
          <p className="text-muted-foreground text-sm line-clamp-4">
            {dayjs(created_at).format('DD/MM')}
          </p>
          <p className="text-muted-foreground text-sm line-clamp-4">{description}</p>
        </div>
      )
    }
  },
  {
    accessorKey: 'brand',
    header: null,
    cell: null,
    size: 0
  },
  {
    accessorKey: 'product',
    header: 'Product',
    size: 150,
    cell: ({ row }) => {
      const { products } = useProducts()
      const feature = row.original || {}
      const { id } = feature
      const { product: productIid } = row.original || {}
      const mapProduct = (productId) => {
        const product = products.find((product) => product.iid === productId)
        return product?.projectName
      }

      const { setLoading, setShouldRefresh } = useTickets()

      const [product, setProduct] = useState(productIid)

      const handleProductChange = async (value) => {
        setLoading(true)
        setProduct(value)
        const selectedProduct = products.find((product) => product.iid === value)
        console.log(selectedProduct)

        const response = await updateFeatureRequestIssue(id, {
          ...feature,
          product: value,
          brand: selectedProduct?.brand,
          projectName: selectedProduct?.projectName,
          model: selectedProduct?.model
        })
        setShouldRefresh(true)
      }
      return <ProductDropdown product={product} setProduct={handleProductChange} />
    }
  },
  {
    id: 'assignee_ids',
    header: 'Developer',
    size: 100,
    cell: ({ row }) => {
      const { assignee_ids } = row.original || {}
      const { developers } = useDevelopers()

      const [showStatusBar, setShowStatusBar] = useState(false)
      const [selectedDevelopers, setSelectedDevelopers] = useState([])
      const isSelected = (id) => {
        return selectedDevelopers.findIndex((dev) => dev.id === id) !== -1
      }
      const updateAssignees = async () => {
        const response = await updateFeatureRequestIssue(id, {
          ...feature,
          assignee_ids: selectedDevelopers.map((dev) => dev.id)
        })
        setShouldRefresh(true)
      }
      const developersList = developers.filter((dev) =>
        assignee_ids?.find((assignee) => assignee === dev.id)
      )
      return (
        <DeveloperDropdown
          showStatusBar={showStatusBar}
          setShowStatusBar={setShowStatusBar}
          selectedDevelopers={developers.filter((dev) =>
            assignee_ids?.find((assignee) => assignee.id === dev.id)
          )}
          selectDeveloper={(id) => {
            if (isSelected(id)) {
              setSelectedDevelopers(selectedDevelopers.filter((dev) => dev.id !== id))
            } else {
              setSelectedDevelopers([
                ...selectedDevelopers,
                developers.find((dev) => dev.id === id)
              ])
            }
          }}
          isSelected={isSelected}
          onClick={() => {
            updateAssignees()
          }}
          loading={false}
        >
          <div className="cursor-pointer hover:underline flex-col flex">
            {assignee_ids && assignee_ids.length ? (
              developersList.map((dev) => <p key={dev.id}>{dev.name}</p>)
            ) : (
              <p className="text-gray-500">Select</p>
            )}
          </div>
        </DeveloperDropdown>
      )
    }
  },
  {
    accessorKey: 'estimate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Estimate
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    size: 100,
    cell: ({ row }) => {
      const feature = row.original || {}
      const { estimate, startDate, id } = row.original || {}
      const { setShouldRefresh, setLoading } = useTickets()

      const handleEstimateChange = async (value) => {
        setLoading(true)
        const response = await updateFeatureRequestIssue(id, {
          ...feature,
          estimate: value
        })
        setShouldRefresh(true)
      }

      const handleDateChange = async (value) => {
        setLoading(true)
        const response = await updateFeatureRequestIssue(id, {
          ...feature,
          startDate: value
        })
        setShouldRefresh(true)
      }

      return (
        <EstimateSlider
          days={estimate}
          setDays={handleEstimateChange}
          startDate={startDate}
          setStartDate={handleDateChange}
        />
      )
    }
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const feature = row.original || {}
      const { priority, id } = row.original || {}
      const { setShouldRefresh } = useTickets()
      const handlePriorityChange = async (value) => {
        const response = await updateFeatureRequestIssue(id, {
          ...feature,
          priority: value
        })
        setShouldRefresh(true)
      }
      return (
        <PriorityDropdown
          priority={priority}
          setPriority={handlePriorityChange}
          rowIndex={row.index}
        />
      )
    }
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const feature = row.original || {}
      const { type, id } = row.original || {}
      const { setShouldRefresh } = useTickets()
      const handleTypeChange = async (value) => {
        const response = await updateFeatureRequestIssue(id, {
          ...feature,
          type: value
        })
        setShouldRefresh(true)
      }
      return (
        <FeatureTypeSelector type={type} handleTypeChange={handleTypeChange} rowIndex={row.index} />
      )
    }
  },
  {
    accessorKey: 'ticket',
    header: 'Gitlab',
    size: 50,
    cell: ({ row }) => {
      const feature = row.original || {}
      const { ticket, id } = row.original || {}
      const [ticketUrl, setTicketUrl] = useState(ticket || '')
      const { setShouldRefresh, setLoading } = useTickets()

      const handleTicketChange = async (value) => {
        setLoading(true)
        const response = await updateFeatureRequestIssue(id, {
          ...feature,
          ticket: value
        })
        setShouldRefresh(true)
      }

      return (
        <>
          {ticket ? (
            <p
              className="text-primary hover:underline cursor-pointer"
              onClick={() => window.open(ticket)}
            >
              #{ticket.split('/').pop()}
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleTicketChange(ticketUrl)
              }}
              className="flex gap-1"
            >
              <Input
                className="w-20"
                value={ticketUrl}
                onChange={(e) => setTicketUrl(e.target.value)}
                placeholder="gitlab"
              />
              <Button className="bg-transparent" variant="outline" size="icon">
                <Check className="size-4" />
              </Button>
            </form>
          )}
        </>
      )
    }
  },
  {
    id: 'delete',
    header: null,
    size: 50,
    cell: ({ row }) => {
      const feature = row.original || {}
      const { id } = row.original || {}
      const { setShouldRefresh } = useTickets()
      const handleDelete = async () => {
        await deleteFeatureRequestIssue(id)
        setShouldRefresh(true)
      }
      return (
        <Button size="icon" onClick={handleDelete} variant="ghost" className="hover:text-red-500">
          <Trash className="w-4 h-4" />
        </Button>
      )
    }
  },

  { accessorKey: 'model', header: null, cell: null, size: 0 },
  { accessorKey: 'projectName', header: null, cell: null, size: 0 },
  { accessorKey: 'mp1Date', header: null, cell: null, size: 0 }
]
