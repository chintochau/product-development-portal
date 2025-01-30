import React, { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useProducts } from '../../contexts/productsContext'
import { Label } from '../../../../components/ui/label'

const ProductDropdown = ({ product, setProduct }) => {
  const { products } = useProducts()
  return (
    <Select
      value={product}
      onValueChange={(value) => {
        setProduct(value)
      }}
    >
      <SelectTrigger className="w-fit border-0 hover:underline">
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
              <div className="flex flex-col  text-start">
                <p className="text-[12px] text-muted-foreground">{product.brand}</p>
                <p>{product.projectName}</p>
              </div>
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )
}

export default ProductDropdown
