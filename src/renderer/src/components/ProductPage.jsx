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
import { daysFromToday, filterTicketInformation } from '../../../lib/utils'
import TicketsChart from './product-page/TicketsChart'

const ProductPage = () => {
  const { productData, setTickets, tickets } = useSingleProduct()
  const location = useLocation()
  const { productcode, productname, epicLink, releasedate, status, mpDate, ppDate,softwareSignoffDate } =
    productData || {}

  const loadTickets = async (epicId) => {
    const data = await getTicketsFromEpic(epicId)
    if (data) {
        console.log(data.map((item) => filterTicketInformation(item)));
        
      setTickets(data.map((item) => filterTicketInformation(item)))
    }
    return data
  }

  useEffect(() => {
    console.log(productData)

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
      <div className="w-full grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Target Release Date</Label>
            <p className="text-muted-foreground">
              {releasedate} {` (${daysFromToday(releasedate)})`}
            </p>
            <Label>Status</Label>
            <p className="text-muted-foreground">{status}</p>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Hardware Status</CardTitle>
            {productname && <CardDescription>{productname}</CardDescription>}
          </CardHeader>
          <CardContent>
            <Label>Pre Production Date</Label>
            <p className="text-muted-foreground">
              {ppDate}
              {` (${daysFromToday(ppDate)})`}
            </p>
            <Label>Mass Production Date</Label>
            <p className="text-muted-foreground">
              {mpDate} {` (${daysFromToday(mpDate)})`}
            </p>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Software Status</CardTitle>
            {productname && <CardDescription>{productname}</CardDescription>}
          </CardHeader>
          <CardContent>
            <Label>Target Release Date</Label>
            <p className="text-muted-foreground">{releasedate}</p>
            <Label>Status</Label>
            <p className="text-muted-foreground">{status}</p>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
      <div className="mt-4">
        <TicketsChart tickets={tickets} softwareSignoffDate={softwareSignoffDate}/>
      </div>
    </div>
  )
}

export default ProductPage
