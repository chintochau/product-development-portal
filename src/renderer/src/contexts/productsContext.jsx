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
    const filteredData = excelData.filter(
      (item) =>
        item.BluOS === 'Yes' &&
        item.Status &&
        item.Status !== 'Concept' &&
        item['Project Name'].trim() !== ''
    )
    setProductDataFromExcel(filteredData)
    setProducts(
      data.map((item) => {
        const attributes = ticketToJSON(item)
        if (attributes.useLookup) {
          const lookupData = readDataUsingLookupId(toInteger(attributes.lookup), filteredData)

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
            BluOS,
            ['PIF Date\nSubmitted']: pifDate,
            ['PIF Date\nAccepted']: pifDateAccepted,
            ['MP1 Date\nActual']: mp1DateActual,
            ['Greenlight\nDate']: greenlightDate,
            ['Greenlight\nTarget PM1']: greenlightTargetMPDate
          } = lookupData || {}

          const isBluOS = BluOS === 'Yes'
          return {
            ...attributes,
            description: isBluOS ? Description : 'Non BluOS Product',
            status: Status,
            brand: Brand,
            bluos: isBluOS,
            projectName,
            model,
            note: Note,
            show: Show,
            launch: Launch
              ? dayjs(Launch).isValid()
                ? dayjs(Launch).format('YYYY-MM-DD')
                : null
              : null,
            mp1Date: MP1 ? (dayjs(MP1).isValid() ? dayjs(MP1).format('YYYY-MM-DD') : null) : null,
            mp1DateActual: mp1DateActual
              ? dayjs(mp1DateActual).isValid()
                ? dayjs(mp1DateActual).format('YYYY-MM-DD')
                : null
              : null,
            pifDate: pifDate
              ? dayjs(pifDate).isValid()
                ? dayjs(pifDate).format('YYYY-MM-DD')
                : null
              : null,
            pifDateAccepted: pifDateAccepted
              ? dayjs(pifDateAccepted).isValid()
                ? dayjs(pifDateAccepted).format('YYYY-MM-DD')
                : null
              : null,
            greenlightDate: greenlightDate
              ? dayjs(greenlightDate).isValid()
                ? dayjs(greenlightDate).format('YYYY-MM-DD')
                : null
              : null,
            greenlightTargetMP: greenlightTargetMPDate
              ? dayjs(greenlightTargetMPDate).isValid()
                ? dayjs(greenlightTargetMPDate).format('YYYY-MM-DD')
                : null
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

  const findProductsById = (id) => {
    if (!id) {
      return null
    }
    const product = products.find((product) => product.iid === id)
    if (product) {
      return product.projectName
    }
    return null
  }

  const value = {
    loading,
    setLoading,
    products,
    setProducts,
    deleteProductLog,
    shouldRefreshProducts,
    setShouldRefreshProducts,
    readDataUsingLookupId,
    findProductsById,
    productDataFromExcel
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}
