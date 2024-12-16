import React, { createContext, useContext, useEffect, useState } from 'react'
import { getFeaturesRequestsIssues } from '../services/gitlabServices'
import frontMatter from 'front-matter'

const TicketsContext = createContext()

export const useTickets = () => {
  return useContext(TicketsContext)
}

export const TicketsProvider = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [features, setFeatures] = useState([])
  const [shouldRefresh, setShouldRefresh] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)

  const getFeatureRequests = async () => {
    setLoading(true)
    const data = await getFeaturesRequestsIssues()
    setFeatures(
      data.map((item) => {
        const attributes = frontMatter(item.description).attributes
        return { ...attributes, iid: item.iid, url: item.web_url }
      })
    )
    setLoading(false)
    setShouldRefresh(false)
  }

  useEffect(() => {
    if (shouldRefresh) {
      getFeatureRequests()
    }
  }, [shouldRefresh])

  const value = {
    loading,
    setLoading,
    features,
    setFeatures,
    setShouldRefresh,
    setSelectedTicket,
    selectedTicket
  }

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>
}
