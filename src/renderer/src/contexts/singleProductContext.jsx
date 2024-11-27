import React, { createContext, useContext, useEffect, useState } from 'react'
import { useProducts } from './productsContext'
import {
  getNotesFromTicket,
  getProductLogWithIID,
  postNotesToTicket,
  ticketToJSON
} from '../services/gitlabServices'
import frontMatter from 'front-matter'
const SingleProductContext = createContext()

export const useSingleProduct = () => {
  return useContext(SingleProductContext)
}

export const SingleProductProvider = ({ children }) => {
  const [loading,setLoading] = useState(false)
  const [productLog, setProductLog] = useState(null)
  const [productData, setProductData] = useState(null)
  const [iid, setIid] = useState(null)
  const [tickets, setTickets] = useState([])
  const [notes, setNotes] = useState(null)
  const [pifs, setPifs] = useState(null)
  const [shouldReloadNotes, setShouldReloadNotes] = useState(false)
  const [hardware, setHardware] = useState(null)
  const [software, setSoftware] = useState(null)

  const getProductLog = async (iid) => {
    const ticketData = await getProductLogWithIID(iid)
    setProductData(ticketToJSON(ticketData))
  }

  const getNotes = async (iid) => {
    const notes = await getNotesFromTicket(iid)
    const notesData = notes.map((item) => {
      const parsedData = frontMatter(item.body)
      return { ...parsedData, id: item.id, date: item.created_at }
    })
    setNotes(notesData.filter((item) => item.attributes.type === 'comment'))
    setPifs(notesData.filter((item) => item.attributes.type === 'pif'))
    setHardware(notesData.filter((item) => item.attributes.type === 'hardware')?.[0]?.attributes?.hardware)
    setSoftware(notesData.filter((item) => item.attributes.type === 'software')?.[0]?.attributes?.software)
    setLoading(false)
    return notesData
  }

  const postNote = async (data, message) => {
    const response = await postNotesToTicket(iid, data, message)
  }

  useEffect(() => {
    if (shouldReloadNotes) {
      getNotes(iid)
      setShouldReloadNotes(false)
    }
  }, [shouldReloadNotes])

  useEffect(() => {
    // setLoading(true)
    if (productLog) {
      setProductData(productLog)
      setIid(productLog.iid)
      getNotes(productLog.iid)
    } else if (iid && !productData && !productLog) {
      getProductLog(iid)
    }
    return () => {
      setProductData({})
      setIid(null)
    }
  }, [iid, productLog])

  const value = {
    productData,
    iid,
    setIid,
    setProductLog,
    productLog,
    tickets,
    setTickets,
    notes,
    pifs,
    postNote,
    setShouldReloadNotes,
    hardware,
    software,
    loading,
    setLoading
  }

  return <SingleProductContext.Provider value={value}>{children}</SingleProductContext.Provider>
}
