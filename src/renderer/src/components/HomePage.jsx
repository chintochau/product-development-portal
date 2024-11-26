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
import { Link } from 'react-router-dom'
import { CREATE_NEW_PRODUCT_ROUTE } from '../constant'
import { Loader2, Trash } from 'lucide-react'
import { useProducts } from '../contexts/productsContext'
import { useSingleProduct } from '../contexts/singleProductContext'

const HomePage = () => {
  const { loading, products, setProducts } = useProducts()
  const [epics, setEpics] = React.useState([])
  const { setProductLog } = useSingleProduct()

  const handleProductClick = (productLog) => {
    setProductLog(productLog)
  }
  return (
    <div className="px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Dashboard</h1>
        <Link to={CREATE_NEW_PRODUCT_ROUTE}>
          <Button variant="outline">+</Button>
        </Link>
      </div>
      <Select>
        <SelectTrigger className="w-fit">
          <SelectValue placeholder="Select Epic" />
        </SelectTrigger>
        <SelectContent>
          {epics.map((epic) => (
            <SelectItem key={epic.id} value={epic.id}>
              {epic.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="bg-accent w-full rounded-xl">
        {!loading ? (
          <>
            {products &&
              products.map((product) => (
                <Link
                  to={`/dashboard/${product.iid}`}
                  key={product.id}
                  className="flex items-center justify-between"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="flex gap-2">
                    <p>{product.title}</p>
                    <p>{product.iid}</p>
                  </div>
                </Link>
              ))}
          </>
        ) : (
          <div className="w-full flex items-center justify-center py-12">
            <Loader2 className="animate-spin size-12" />
          </div>
        )}
      </div>
      <Button
        onClick={() => {
          createNewProductTicket()
        }}
      >
        Create Sample Issue
      </Button>
    </div>
  )
}

export default HomePage
