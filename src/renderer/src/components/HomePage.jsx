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





const HomePage = () => {
  const { loading, products, setProducts } = useProducts()
  const [epics, setEpics] = React.useState([])
  const { setProductLog } = useSingleProduct()
  const navigate = useNavigate()

  const handleProductClick = (productLog) => {
    setProductLog(productLog)
    navigate(`/dashboard/${productLog.iid}`)
  }


  return (
    <div className="px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Dashboard</h1>
        <Link to={CREATE_NEW_PRODUCT_ROUTE}>
          <Button variant="outline">+</Button>
        </Link>
      </div>
      <div className="w-full rounded-xl">
        {!loading ? (
          <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-fit">No.</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Releast Date</TableHead>
                <TableHead>gitlab</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products &&
                products.map((product) => (
                  <TableRow key={product.iid} onClick={() => handleProductClick(product)} className="cursor-pointer">
                    <TableCell className="w-14">{product.iid}</TableCell>
                    <TableCell>{product.productcode}</TableCell>
                    <TableCell>{product.status}</TableCell>
                    <TableCell>{product.releasedate}</TableCell>
                    <TableCell>
                      {product.epicLink && (
                        <p
                          className="cursor-pointer hover:text-blue-500 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(product.epicLink, '_blank')
                          }}
                        >
                          tickets
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        ) : (
          <div className="w-full flex items-center justify-center py-12">
            <Loader2 className="animate-spin size-12" />
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
