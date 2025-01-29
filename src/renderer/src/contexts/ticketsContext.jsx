import React, { createContext, useContext, useEffect, useState } from 'react'
import { getFeaturesRequestsIssues } from '../services/gitlabServices'
import frontMatter from 'front-matter'
import { toInteger } from 'lodash'
import _ from 'lodash'
import { useDevelopers } from './developerContext'

const TicketsContext = createContext()

export const useTickets = () => {
  return useContext(TicketsContext)
}

export const TicketsProvider = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [features, setFeatures] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [shouldRefresh, setShouldRefresh] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [tickets, setTickets] = React.useState([])
  const [adhocTickets, setAdhocTickets] = React.useState([])

  const getFeatureRequests = async (page) => {
    setLoading(true)
    const response = await getFeaturesRequestsIssues(page,1)
    const adhoc = await getFeaturesRequestsIssues(page,3)
    setAdhocTickets(
      adhoc?.map((item) => {
        const attributes = frontMatter(item.body).attributes
        return { ...item, ...attributes, iid: item.iid, url: item.web_url }
      })
    )
    setFeatures(
      response?.map((item) => {
        const attributes = frontMatter(item.body).attributes
        return { ...item, ...attributes, iid: item.iid, url: item.web_url }
      })
    )
    setTotalPages(toInteger(response?.headers?.['x-total-pages']))
    setCurrentPage(toInteger(response?.headers?.['x-page']))
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
    selectedTicket,
    currentPage,
    setCurrentPage,
    totalPages,
    getFeatureRequests,
    tickets,
    setTickets,
    adhocTickets,
    setAdhocTickets
  }

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>
}
