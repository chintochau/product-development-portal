import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import React, { useEffect } from 'react'
import { createNewProductTicket, getProductsLog } from '../services/gitlabServices'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { CREATE_NEW_PRODUCT_ROUTE } from '../constant'
import { Loader2, Trash } from 'lucide-react'
import { useProducts } from '../contexts/productsContext'
import { useSingleProduct } from '../contexts/singleProductContext'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { DataTable } from './home/data-table'
import { columns } from './home/columns'
import ScheduleChart from './home/ScheduleChart'

const HomePage = () => {
  const { loading, products, setShouldRefreshProducts } = useProducts()
  const { setProductLog } = useSingleProduct()
  const navigate = useNavigate()

  const handleProductClick = (productLog) => {
    setProductLog(productLog)
    navigate(`/dashboard/${productLog.iid}#${productLog.name}`)
  }

  useEffect(() => {
    setShouldRefreshProducts(true)
  }, [])

  return (
    <div className="px-4 flex flex-col">
      <div className="flex items-center">
        <h1 className="text-2xl">Dashboard</h1>
        <Link to={CREATE_NEW_PRODUCT_ROUTE}>
          <Button variant="link" size="sm" className="text-muted-foreground">Add new product</Button>
        </Link>
      </div>
      <div className="w-full rounded-xl py-4 ">
        <DataTable columns={columns} data={products} />
      </div>
      <div className="w-full rounded-xl py-4">
        <div className='relative h-[calc(50vh)] bottom-0'>
          <ScheduleChart />
        </div>
      </div>
    </div>
  )
}

export default HomePage
