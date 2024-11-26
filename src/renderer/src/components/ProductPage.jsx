import React from 'react'
import { useSingleProduct } from '../contexts/singleProductContext'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../../../components/ui/button'

const ProductPage = () => {
  const { productData } = useSingleProduct()
  const location = useLocation()
  const { productcode, productname } = productData || {}
  return (
    <div className="px-4">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-2xl">{productcode}</h2>
        <Link to={`${location.pathname}/edit`}>
          <Button variant="outline">Edit</Button>
        </Link>
      </div>
      <div>{JSON.stringify(productData)}</div>
    </div>
  )
}

export default ProductPage
