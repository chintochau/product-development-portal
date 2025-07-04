import React, { createContext, useContext, useEffect, useState } from 'react'
import { useProducts } from './productsContext'
import {
  getEpics,
  getMilestones,
  getNotesFromTicket,
  getProductDataFromGitlabWithIid,
  postNotesToTicket,
  ticketToJSON,
  updateNotesToTicket
} from '../services/gitlabServices'
import frontMatter from 'front-matter'
const SingleProductContext = createContext()

export const useSingleProduct = () => {
  return useContext(SingleProductContext)
}

export const SingleProductProvider = ({ children }) => {
  const { products } = useProducts()
  const [loading, setLoading] = useState(true)
  const [productData, setProductData] = useState(null)
  const [iid, setIid] = useState(null)
  const [tickets, setTickets] = useState([])
  const [notes, setNotes] = useState(null)
  const [pifs, setPifs] = useState(null)
  const [shouldReloadNotes, setShouldReloadNotes] = useState(false)
  const [hardware, setHardware] = useState(null)
  const [hardwareId, setHardwareId] = useState(null)
  const [software, setSoftware] = useState(null)
  const [softwareId, setSoftwareId] = useState(null)
  const [hardwareLoading, setHardwareLoading] = useState(false)
  const [softwareLoading, setSoftwareLoading] = useState(false)
  const [epics, setEpics] = useState([])
  const [hardwareTasks, setHardwareTasks] = useState([])
  const [wrikeWorkflows, setWrikeWorkflows] = useState()
  const [milestones, setMilestones] = useState([])
  const [features, setFeatures] = useState([])
  const [featuresId, setFeaturesId] = useState(null)
  const [featuresLoading, setFeaturesLoading] = useState(false)
  const [selectedEpicId, setSelectedEpicId] = useState(null)
  const [shouldRefreshProductData, setShouldRefreshProductData] = useState(false)

  useEffect(() => {
    getEpics().then((data) => setEpics(data.sort((a, b) => a.title.localeCompare(b.title))))
    getMilestones().then((data) =>
      setMilestones(data.sort((a, b) => a.title.localeCompare(b.title)))
    )
    getWrikeWorkflows()
  }, [])

  const getWrikeWorkflows = async () => {
    const data = await window.api.wrike('workflows', 'GET')
    setWrikeWorkflows(data)
  }

  const getDataFromGitlab = async (iid) => {
    const ticketData = await getProductDataFromGitlabWithIid(iid)
    return ticketToJSON(ticketData)
  }

  const getAndComebineDataFromGitlabAndExcel = async (iid) => {
    const gitlabData = await getDataFromGitlab(iid)
    let excelData
    if (gitlabData.useLookup && gitlabData.lookup) {
      excelData = products.find((product) => product.lookup === gitlabData.lookup)
      console.log(excelData)
    }
    setProductData({ ...gitlabData, ...excelData })
    getNotes(iid)
    setSelectedEpicId(gitlabData?.epicId)
  }

  const getNotes = async (iid) => {
    const notes = await getNotesFromTicket(iid)
    const notesData = notes.map((item) => {
      const parsedData = frontMatter(item.body)
      return { ...parsedData, id: item.id, date: item.created_at }
    })
    setNotes(notesData.filter((item) => item.attributes.type === 'comment'))
    setPifs(notesData.filter((item) => item.attributes.type === 'pif'))
    setHardware(
      notesData.filter((item) => item.attributes.type === 'hardware')?.[0]?.attributes?.wrikeId
    )
    setSoftware(
      notesData.filter((item) => item.attributes.type === 'software')?.[0]?.attributes?.software
    )
    setFeatures(
      notesData.filter((item) => item.attributes.type === 'features')?.[0]?.attributes?.features
    )
    setFeaturesId(notesData.filter((item) => item.attributes.type === 'features')?.[0]?.id)
    setHardwareId(notesData.filter((item) => item.attributes.type === 'hardware')?.[0]?.id)
    setSoftwareId(notesData.filter((item) => item.attributes.type === 'software')?.[0]?.id)
    setSoftwareLoading(false)
    setHardwareLoading(false)
    setFeaturesLoading(false)
    setLoading(false)
    return notesData
  }

  const postNote = async (data, message) => {
    const response = await postNotesToTicket(iid, data, message)
    return response
  }

  const updateNote = async (noteId, data, message) => {
    const response = await updateNotesToTicket(iid, noteId, data, message)
    return response
  }

  useEffect(() => {
    if (shouldReloadNotes) {
      getNotes(iid)
      setShouldReloadNotes(false)
    }
  }, [shouldReloadNotes])

  useEffect(() => {
    if (!iid) return
    // handle choosing product with iid
    if (iid) {
      setProductData(null)
      setLoading(true)
      getAndComebineDataFromGitlabAndExcel(iid)
    }
    return () => {}
  }, [iid, products])

  const saveData = async ({ software, type, wrikeId }) => {
    switch (type) {
      case 'software':
        if (softwareId) {
          const res = await updateNote(softwareId, {
            type,
            author: 'admin',
            software: software
          })
        } else {
          setSoftwareLoading(true)
          const res = await postNote({
            type,
            author: 'admin',
            software: software
          })
          setShouldReloadNotes(true)
        }
        break
      case 'hardware':
        if (hardwareId) {
          const res = await updateNote(hardwareId, {
            type,
            author: 'admin',
            wrikeId
          })
        } else {
          setHardwareLoading(true)
          const res = await postNote({
            type,
            author: 'admin',
            wrikeId
          })
          setShouldReloadNotes(true)
        }
        break

      case 'features':
        if (featuresId) {
          const res = await updateNote(featuresId, {
            type,
            author: 'admin',
            features: features
          })
        } else {
          setFeaturesLoading(true)
          const res = await postNote({
            type,
            author: 'admin',
            features: features
          })
          setShouldReloadNotes(true)
        }
        break
      default:
        break
    }
  }

  const getFeatureEpics = () => {
    return epics
      .filter((item) => item.labels.includes('type::feature'))
      .filter((item) => item.due_date)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
  }

  const value = {
    productData,
    iid,
    setIid,
    tickets,
    setTickets,
    notes,
    pifs,
    postNote,
    setShouldReloadNotes,
    hardware,
    software,
    loading,
    setLoading,
    setHardware,
    setSoftware,
    hardwareId,
    softwareId,
    updateNote,
    setHardwareId,
    setSoftwareId,
    hardwareLoading,
    setHardwareLoading,
    softwareLoading,
    setSoftwareLoading,
    epics,
    hardwareTasks,
    setHardwareTasks,
    wrikeWorkflows,
    saveData,
    milestones,
    getFeatureEpics,
    featureEpics: getFeatureEpics(),
    features,
    featuresId,
    setFeatures,
    setFeaturesId,
    featuresLoading,
    setFeaturesLoading,
    selectedEpicId,
    setSelectedEpicId,
    shouldRefreshProductData,
    setShouldRefreshProductData
  }

  return <SingleProductContext.Provider value={value}>{children}</SingleProductContext.Provider>
}
