import React, { createContext, useContext, useEffect, useState } from 'react'
import { useProducts } from './productsContext'
import { getProductLogWithIID } from '../services/gitlabServices'
import frontMatter from 'front-matter'
const SingleProductContext = createContext()

export const useSingleProduct = () => {
  return useContext(SingleProductContext)
}

export const SingleProductProvider = ({ children }) => {
  const [productLog, setProductLog] = useState(null)
  const [productData, setProductData] = useState(null)
  const [iid, setIid] = useState(null)

  const getProductLog = async (iid) => {
    const data = await getProductLogWithIID(iid)
    const parsedData = frontMatter(data.description)
    setProductData(parsedData.attributes)
  }

  useEffect(() => {
    if (productLog) {
      console.log("productLog", productLog);
      setProductData(frontMatter(productLog.description).attributes)
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
    productLog
  }

  return <SingleProductContext.Provider value={value}>{children}</SingleProductContext.Provider>
}
