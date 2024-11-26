import React, { createContext, useContext, useEffect, useState } from 'react'
import { useProducts } from './productsContext'
import { getProductLogWithIID, ticketToJSON } from '../services/gitlabServices'
import frontMatter from 'front-matter'
const SingleProductContext = createContext()

export const useSingleProduct = () => {
  return useContext(SingleProductContext)
}

export const SingleProductProvider = ({ children }) => {
  const [productLog, setProductLog] = useState(null)
  const [productData, setProductData] = useState(null)
  const [iid, setIid] = useState(null)
  const [tickets, setTickets] = useState([])

  const getProductLog = async (iid) => {
    const ticketData = await getProductLogWithIID(iid)
    setProductData(ticketToJSON(ticketData))
  }

  useEffect(() => {
    if (productLog) {
      setProductData( productLog)
      setIid(productLog.iid)
    } else if (iid && !productData && !productLog) {
      getProductLog(iid)
    }
    return () => {
      setProductData({})
      setIid(null)
    }
  }, [iid,productLog])

  const value = {
    productData,
    iid,
    setIid,
    setProductLog,
    productLog,
    tickets,
    setTickets
  }

  return <SingleProductContext.Provider value={value}>{children}</SingleProductContext.Provider>
}
