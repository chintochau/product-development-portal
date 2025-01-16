import React, { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useProducts } from '../../contexts/productsContext'

const ProductDropdown = ({ product, setProduct }) => {
  const { products } = useProducts()
  return (
    <Select
      value={product}
      onValueChange={(value) => {
        console.log(value);
        
        setProduct(value)
      }}
    >
      <SelectTrigger className="w-[180px] border-0 hover:underline">
        <SelectValue className="" placeholder="-" value={product} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={null} className="text-muted-foreground">
          -
        </SelectItem>
        {products
          .filter((product) => product.bluos)
          .map((product) => (
            <SelectItem key={product.iid} value={product.iid}>
              {product.brand} - {product.projectName}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )
}

export default ProductDropdown
