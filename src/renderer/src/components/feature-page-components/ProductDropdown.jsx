import React, { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useProducts } from '../../contexts/productsContext'
import { Label } from '../../../../components/ui/label'
import { defaultPlatforms } from '../../constant'

const ProductDropdown = ({ product, setProduct, includingApps }) => {
  const { products } = useProducts()
  return (
    <Select
      defaultValue="none"
      value={product}
      onValueChange={(value) => {
        setProduct(value)
      }}
    >
      <SelectTrigger className="w-fit border-0 hover:underline">
        <SelectValue className="" placeholder="-" value={product} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none" className="text-muted-foreground">
          -
        </SelectItem>
        {includingApps && (
          <>
            {['Apps', ...defaultPlatforms].map((platform) => (
              <SelectItem key={platform} value={platform}>
                {platform}
              </SelectItem>
            ))}
            <SelectSeparator />
          </>
        )}
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
