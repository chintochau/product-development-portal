import React, { createContext, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSingleProduct } from './singleProductContext'

const BrowsingContext = createContext()

export const useBrowsing = () => {
  return useContext(BrowsingContext)
}

export const BrowsingProvider = ({ children }) => {
  const location = useLocation()
  const path = location.pathname
  const [pageTitle, setPageTitle] = useState()
  const { productLog, productData } = useSingleProduct()

  useEffect(() => {
    if (productData) {
      setPageTitle("- " + productData.productcode)
    } 
    
    if (path === '/dashboard') {
      setPageTitle("")
    }
  }, [path])

  const value = {
    pageTitle,
    setPageTitle
  }

  return <BrowsingContext.Provider value={value}>{children}</BrowsingContext.Provider>
}
