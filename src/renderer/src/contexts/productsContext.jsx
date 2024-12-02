import React, { createContext, useContext, useEffect, useState } from 'react'
import { deleteTicket, getProductsLog, ticketToJSON } from '../services/gitlabServices'

const ProductsContext = createContext()

export const useProducts = () => {
  return useContext(ProductsContext)
}

export const ProductsProvider = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [shouldRefreshProducts, setShouldRefreshProducts] = useState(false)

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

  useEffect(() => {
    if (shouldRefreshProducts) {
      loadProducts()
      setShouldRefreshProducts(false)
    }
    return () => {}
  }, [shouldRefreshProducts])

  const deleteProductLog = async (iid) => {
    deleteTicket(iid)
  }

  const value = {
    loading,
    setLoading,
    products,
    setProducts,
    deleteProductLog,
    shouldRefreshProducts,
    setShouldRefreshProducts
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}
