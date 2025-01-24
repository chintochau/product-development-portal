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
import {
  getTicketsFromEpic,
  saveGitlabIssue,
  updateTicketDescription
} from '../services/gitlabServices'
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
import TicketSection from './product-page/TicketSection'
import { useProducts } from '../contexts/productsContext'
import { Loader2 } from 'lucide-react'
import FeaturesStatusCard from './product-page/FeaturesStatusCard'
import AllFeatures from './feature-page-components/AllFeatures'
import { useTickets } from '../contexts/ticketsContext'
import BluOSFeatureRequest from './feature-page-components/BluOSFeatureRequest'
import FrameWraper from './frameWarper'

const ProductPage = () => {
  const { productData, setTickets, tickets, loading, epics } = useSingleProduct()
  const [selectedEpicId, setSelectedEpicId] = React.useState(null)
  const { setShouldRefreshProducts } = useProducts()
  const location = useLocation()
  const { projectName, softwareSignoffDate, iid: productIid } = productData || {}
  const { features } = useTickets()

  const featuresFilteredByIID = features.filter((feature) => feature.product === productIid)

  const loadTickets = async (epicId) => {
    const data = await getTicketsFromEpic(epicId)
    if (data) {
      setTickets(data.map((item) => filterTicketInformation(item)))
    }
    return data
  }

  useEffect(() => {
    if (selectedEpicId || productData?.epicId) {
      loadTickets(selectedEpicId || productData?.epicId)
    }
    return () => {
      setTickets([])
    }
  }, [selectedEpicId])

  if (loading) {
    return (
      <div className="px-4">
        <div className="w-full flex items-center justify-between">
          <h2 className="text-2xl">{projectName}</h2>
        </div>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin size-12" />
        </div>
      </div>
    )
  }
  return (
    <FrameWraper>
      <div className="px-4 pb-4 flex flex-col gap-4">
        <div className="w-full flex items-center ">
          <h2 className="text-2xl">{projectName}</h2>
          <Link to={`${location.pathname}/edit`}>
            <Button variant="link" size="sm" className=" text-muted-foreground hover:text-blue-500">
              Edit
            </Button>
          </Link>
        </div>

        <div className="w-full flex gap-4 flex-wrap ">
          <ProductCard className="flex-[3] min-w-40 h-96" />
          <PIFCard className="flex-[3] min-w-40 h-96 " />
          <HardwareStatusCard className="flex-[3] min-w-96 h-96" />
          <SoftwareStatusCard className="flex-[6] min-w-96 h-96" />
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <BluOSFeatureRequest productIssueId={productIid}>
            <AllFeatures features={featuresFilteredByIID} className={'flex-[8] w-full'} />
          </BluOSFeatureRequest>
        </div>

        <div className="mt-4 flex gap-4 flex-wrap">
          <div className="relative flex-1 overflow-hidden rounded-xl min-w-96">
            <div className="absolute top-4 right-4">
              <Select
                value={productData?.epicId}
                onValueChange={(epicId) => {
                  updateTicketDescription(productData.iid, { ...productData, epicId })
                  setShouldRefreshProducts(true)
                  setSelectedEpicId(epicId)
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={0}>-</SelectItem>
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
          <TicketSection tickets={tickets} className="w-1/2" />
        </div>

        <div>
          <NotesCard className="flex-1 mt-4" />
        </div>
      </div>
    </FrameWraper>
  )
}

export default ProductPage
