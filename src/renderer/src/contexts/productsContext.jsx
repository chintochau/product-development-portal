import React, { createContext, useContext, useEffect, useState } from 'react'
import { deleteTicket, getProductsLog, ticketToJSON } from '../services/gitlabServices'

const ProductsContext = createContext()

export const useProducts = () => {
  return useContext(ProductsContext)
}

export const ProductsProvider = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])

  const loadProducts = async () => {
    const data = await getProductsLog()
    setProducts(data.map((item) => ticketToJSON(item)))
    setLoading(false)
  }

  useEffect(() => {
    if (loading) {
      loadProducts()
    }
  }, [loading])

  const deleteProductLog = async (iid) => {
    deleteTicket(iid)
  }

  const value = {
    loading,
    setLoading,
    products,
    setProducts,
    deleteProductLog
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}
