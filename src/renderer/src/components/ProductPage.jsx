import React, { useEffect } from 'react'
import { useSingleProduct } from '../contexts/singleProductContext'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../../../components/ui/button'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { getTicketsFromEpic } from '../services/gitlabServices'
import { Label } from '../../../components/ui/label'
import { cn, daysFromToday, filterTicketInformation } from '../../../lib/utils'
import TicketsChart from './product-page/TicketsChart'
import ProcessStepper from './product-page/ProcessStepper'
import { defaultHardwareSteps, defaultSoftwareSteps } from '../constant'
import ProductCard from './product-page/ProductCard'
import PIFCard from './product-page/PIFCard'
import NotesCard from './product-page/NotesCard'
import HardwareStatusCard from './product-page/HardwareStatusCard'
import SoftwareStatusCard from './product-page/SoftwareStatusCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../../components/ui/select'

const ProductPage = () => {
  const { productData, setTickets, tickets, loading, epics } = useSingleProduct()
  const [selectedEpicId, setSelectedEpicId] = React.useState(null)
  const location = useLocation()
  const { productcode, softwareSignoffDate } = productData || {}

  const loadTickets = async (epicId) => {
    const data = await getTicketsFromEpic(epicId)
    if (data) {
      setTickets(data.map((item) => filterTicketInformation(item)))
    }
    return data
  }

  useEffect(() => {
    if (selectedEpicId) {
      loadTickets(selectedEpicId)
    }
  }, [selectedEpicId])

  if (loading) {
    return (
      <div className="px-4">
        <div className="w-full flex items-center justify-between">
          <h2 className="text-2xl">{productcode}</h2>
        </div>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }
  return (
    <div className="px-4">
      <div className="w-full flex items-center ">
        <h2 className="text-2xl">{productcode}</h2>
        <Link to={`${location.pathname}/edit`}>
          <Button variant="link" size="sm" className=" text-muted-foreground hover:text-blue-500">
            Edit
          </Button>
        </Link>
      </div>

      <div className="w-full grid grid-cols-3 gap-4 ">
        <div className="flex flex-col gap-4">
          <ProductCard className="flex-1" />
          <PIFCard />
        </div>
        <HardwareStatusCard />
        <SoftwareStatusCard />
      </div>
      <div className="mt-4 flex gap-4">
        <div className="relative flex-1 overflow-hidden rounded-xl">
          <div className="absolute top-0 right-0">
            <Select value={selectedEpicId} onValueChange={(epicId) => setSelectedEpicId(epicId)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {epics &&
                  epics.map((epic) => (
                    <SelectItem key={epic.id} value={epic.iid}>
                      {epic.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <TicketsChart
            tickets={tickets}
            softwareSignoffDate={softwareSignoffDate}
            className={'flex-1'}
          />
        </div>
        <NotesCard className="flex-1" />
      </div>
    </div>
  )
}

export default ProductPage
