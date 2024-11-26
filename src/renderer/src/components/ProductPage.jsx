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
import { hardwareSteps, softwareSteps } from '../constant'
import ProductCard from './product-page/ProductCard'
import PIFCard from './product-page/PIFCard'
import NotesCard from './product-page/NotesCard'

const ProductPage = () => {
  const { productData, setTickets, tickets } = useSingleProduct()
  const location = useLocation()
  const {
    productcode,
    productname,
    epicLink,
    releasedate,
    status,
    mpDate,
    ppDate,
    softwareSignoffDate
  } = productData || {}

  const loadTickets = async (epicId) => {
    const data = await getTicketsFromEpic(epicId)
    if (data) {
      setTickets(data.map((item) => filterTicketInformation(item)))
    }
    return data
  }

  useEffect(() => {
    const epicId = productData?.epicLink?.split('/').pop()
    if (epicId) {
      loadTickets(epicId)
    }
  }, [productData])

  return (
    <div className="px-4">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-2xl">{productcode}</h2>
        <Link to={`${location.pathname}/edit`}>
          <Button variant="outline">Edit</Button>
        </Link>
      </div>
      <div className="w-full grid grid-cols-3 gap-4 ">
        <div className="flex flex-col gap-4">
          <ProductCard className="flex-1"/>
          <PIFCard />
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Hardware Status</CardTitle>
            <CardDescription>*Updated by hardware team</CardDescription>
            {productname && <CardDescription>{productname}</CardDescription>}
          </CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            <ProcessStepper steps={hardwareSteps} />
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
        <Card className="h-fit">

          <CardHeader>
            <CardTitle>Software Status</CardTitle>
            <CardDescription>*Updated by software team</CardDescription>
            {productname && <CardDescription>{productname}</CardDescription>}
          </CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            <ProcessStepper steps={softwareSteps} />
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
      <div className="mt-4 flex gap-4">
        <TicketsChart tickets={tickets} softwareSignoffDate={softwareSignoffDate} className={'flex-1'}/>
        <NotesCard className="flex-1"/>
      </div>
    </div>
  )
}

export default ProductPage
