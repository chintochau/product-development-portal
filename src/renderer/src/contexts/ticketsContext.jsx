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
    
    try {
      // Get features from PostgreSQL
      const postgresResponse = await window.api.features.getAll()
      
      if (postgresResponse.success) {
        // Transform PostgreSQL data to match existing format
        const transformedFeatures = postgresResponse.data.map(feature => ({
          id: feature.id,
          iid: feature.gitlab_note_id || feature.id,
          title: feature.title,
          overview: feature.overview,
          currentProblems: feature.current_problems,
          requirements: feature.requirements,
          priority: feature.priority,
          estimate: feature.estimate,
          status: feature.status,
          requestor: feature.requestor,
          platforms: feature.platforms || [],
          created_at: feature.created_at,
          updated_at: feature.updated_at,
          url: `#/features/${feature.id}` // Local URL since it's in PostgreSQL
        }))
        
        setFeatures(transformedFeatures)
        
        // For now, still get adhoc from GitLab
        const adhoc = await getFeaturesRequestsIssues(page, 3)
        setAdhocTickets(
          adhoc?.map((item) => {
            const attributes = frontMatter(item.body).attributes
            return { ...item, ...attributes, iid: item.iid, url: item.web_url }
          })
        )
        
        // Set pagination (todo: implement proper pagination in PostgreSQL)
        setTotalPages(1)
        setCurrentPage(1)
      } else {
        console.error('Failed to fetch features from PostgreSQL:', postgresResponse.error)
        // Fallback to GitLab
        const response = await getFeaturesRequestsIssues(page, 1)
        const adhoc = await getFeaturesRequestsIssues(page, 3)
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
      }
    } catch (error) {
      console.error('Error fetching features:', error)
    } finally {
      setLoading(false)
      setShouldRefresh(false)
    }
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
