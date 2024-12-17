import React, { createContext, useContext, useEffect, useState } from 'react'
import { deleteTicket, getProductsLog, ticketToJSON } from '../services/gitlabServices'
import { toInteger } from 'lodash'
import dayjs from 'dayjs'

const ProductsContext = createContext()

export const useProducts = () => {
  return useContext(ProductsContext)
}

export const ProductsProvider = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [productDataFromExcel, setProductDataFromExcel] = useState(null)
  const [shouldRefreshProducts, setShouldRefreshProducts] = useState(false)

  const loadProducts = async () => {
    const data = await getProductsLog()
    const excelData = await window.api.readExcelFile()
    setProductDataFromExcel(excelData)
    setProducts(
      data.map((item) => {
        const attributes = ticketToJSON(item)
        if (attributes.useLookup) {
          const lookupData = readDataUsingLookupId(toInteger(attributes.lookup), excelData)

          const {
            Description,
            Status,
            Brand,
            Note,
            Show,
            ['Project Name']: projectName,
            ['Model #']: model,
            Launch,
            MP1,
            ['PIF Date\nSubmitted']: pifDate,
            ['PIF Date\nAccepted']: pifDateAccepted,
            ['MP1 Date\nActual']: mp1DateActual,
            ['Greenlight\nDate']: greenlightDate,
            ['Greenlight\nTarget PM1']: greenlightTargetMPDate
          } = lookupData || {}
          return {
            ...attributes,
            description: Description,
            status: Status,
            brand: Brand,
            projectName,
            model,
            note: Note,
            show: Show,
            launch: dayjs(Launch).isValid() ? dayjs(Launch).format('YYYY-MM-DD') : null,
            mp1Date: dayjs(MP1).isValid() ? dayjs(MP1).format('YYYY-MM-DD') : null,
            mp1DateActual: dayjs(mp1DateActual).isValid()
              ? dayjs(mp1DateActual).format('YYYY-MM-DD')
              : null,
            pifDate: dayjs(pifDate).isValid() ? dayjs(pifDate).format('YYYY-MM-DD') : null,
            pifDateAccepted: dayjs(pifDateAccepted).isValid()
              ? dayjs(pifDateAccepted).format('YYYY-MM-DD')
              : null,
            greenlightDate: dayjs(greenlightDate).isValid()
              ? dayjs(greenlightDate).format('YYYY-MM-DD')
              : null,
            greenlightTargetMP: dayjs(greenlightTargetMPDate).isValid()
              ? dayjs(greenlightTargetMPDate).format('YYYY-MM-DD')
              : null
          }
        } else {
          return attributes
        }
      })
    )
    setLoading(false)
  }

  const readDataUsingLookupId = (id, excelData = productDataFromExcel) => {
    return excelData?.find((item) => item['Lookup#'] === id && item.Status !== 'Concept')
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
    setShouldRefreshProducts,
    readDataUsingLookupId
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}
