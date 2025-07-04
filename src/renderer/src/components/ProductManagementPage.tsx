import React, { useEffect } from 'react'
import { Button } from '../../../components/ui/button'
import { Link } from 'react-router-dom'
import { CREATE_NEW_PRODUCT_ROUTE } from '../constant'
import { useProducts } from '../contexts/productsContext'
import { ProductsDataTable } from './home/products-data-table'
import { productsColumns } from './home/products-columns'
import ScheduleChart from './home/ScheduleChart'
import FrameWraper from './frameWarper'

const ProductManagementPage: React.FC = () => {
  const { products, refreshProducts, loading } = useProducts()

  useEffect(() => {
    refreshProducts()
  }, [])

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

        <div className="w-full rounded-xl py-4">
          <ProductsDataTable 
            columns={productsColumns} 
            data={products} 
            loading={loading}
          />
        </div>
        
        <div className="py-4">
          <ScheduleChart products={products} />
        </div>
      </div>
    </FrameWraper>
  )
}

export default ProductManagementPage