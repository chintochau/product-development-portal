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
  const [productLog, setProductLog] = useState(null)
  const [productData, setProductData] = useState(null)
  const [iid, setIid] = useState(null)
  const [tickets, setTickets] = useState([])
  const [notes, setNotes] = useState([])
  const [pifFilesSubmitted, setPifFilesSubmitted] = useState(null)
  const [shouldReloadNotes, setShouldReloadNotes] = useState(false)

  const getProductLog = async (iid) => {
    const ticketData = await getProductLogWithIID(iid)
    setProductData(ticketToJSON(ticketData))
  }

  const getNotes = async (iid) => {
    const notes = await getNotesFromTicket(iid)
    const notesData = notes.map((item) => {
      const parsedData = frontMatter(item.body)
      return { ...parsedData, id: item.id,date:item.created_at }
    })
    console.log('notesData', notesData)

    setNotes(notesData.filter((item) => item.attributes.type === 'comment'))
    setPifFilesSubmitted(notesData.filter((item) => item.attributes.type === 'pif'))
    return notesData
  }

  const postNote = async (data, message) => {
    const response = await postNotesToTicket(iid, { ...data, type: 'comment' }, message)
  }

  useEffect(() => {
    if (shouldReloadNotes) {
      getNotes(iid)
      setShouldReloadNotes(false)
    }
  }, [shouldReloadNotes])

  useEffect(() => {
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
    pifFilesSubmitted,
    postNote,
    setShouldReloadNotes
  }

  return <SingleProductContext.Provider value={value}>{children}</SingleProductContext.Provider>
}
