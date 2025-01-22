import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import React, { useEffect } from 'react'
import { createGitlabIssue, getProductsLog } from '../services/gitlabServices'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { CREATE_NEW_PRODUCT_ROUTE } from '../constant'
import { Loader2, Sheet, Trash } from 'lucide-react'
import { useProducts } from '../contexts/productsContext'
import { useSingleProduct } from '../contexts/singleProductContext'

import { DataTable } from './home/data-table'
import { columns } from './home/columns'
import ScheduleChart from './home/ScheduleChart'
import FrameWraper from './frameWarper'
import { Checkbox } from '../../../components/ui/checkbox'

const roadmapPath = import.meta.env.VITE_ROADMAP_PATH

const HomePage = () => {
  const { products, setShouldRefreshProducts } = useProducts() || {}
  const { setProductLog } = useSingleProduct() || {}
  const [bluOSOnly, setBluOSOnly] = React.useState(true)
  const navigate = useNavigate()

  const handleProductClick = (productLog) => {
    setProductLog(productLog)
    navigate(`/dashboard/${productLog.iid}#${productLog.name}`)
  }

  useEffect(() => {
    setShouldRefreshProducts(true)
  }, [])

  const filteredProducts = bluOSOnly ? products?.filter((product) => product?.bluos) : products

  return (
    <FrameWraper>
      <div className="px-4 flex flex-col">
        <div className="flex items-center">
          <h1 className="text-2xl text-primary">Products</h1>
          <Link to={CREATE_NEW_PRODUCT_ROUTE}>
            <Button variant="link" size="sm" className="text-muted-foreground">
              Add new product
            </Button>
          </Link>
        </div>

        <div className="w-full rounded-xl py-4 ">
          <div className=" flex justify-end">
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <Checkbox
                  checked={bluOSOnly}
                  onCheckedChange={(checked) => {
                    setBluOSOnly(checked)
                  }}
                  id="bluos"
                />
                <label htmlFor="bluos" className="text-muted-foreground">
                  Show BluOS Only
                </label>
              </div>
              <Button size="icon" variant="ghost" onClick={() => window.open(roadmapPath)}>
                <Sheet />
              </Button>
            </div>
          </div>
          <DataTable columns={columns} data={filteredProducts} />
        </div>
        <div className='py-4'><ScheduleChart products={filteredProducts} /></div>
      </div>
    </FrameWraper>
  )
}

export default HomePage
