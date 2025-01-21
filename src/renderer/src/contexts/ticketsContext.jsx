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
  const [featuersByDevelopers, setFeaturesByDevelopers] = useState([])
  const {developers} = useDevelopers()
    const [tickets, setTickets] = React.useState([])
  

  const getFeatureRequests = async (page) => {
    setLoading(true)
    const response = await getFeaturesRequestsIssues(page)
    setFeatures(
      response?.map((item) => {
        const attributes = frontMatter(item.body).attributes
        return {...item, ...attributes, iid: item.iid, url: item.web_url }
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

  useEffect(() => {
    getFeaturesByDevelopers()
  }, [features, developers])

  const getFeaturesByDevelopers = () => {
    
    // Example `features` input:
    // [{ title, startDate, assignee_ids: [1, 2, 3] }, { title, startDate, assignee_ids: [1] }]
    // Example `developers` input:
    // [{ id: 1, name: 'John Doe', email: 'john@example.com' }, ...]
    // Create a lookup for developers by their IDs
    const developerLookup = _.keyBy(developers, 'id');
  
    // Flatten the features and associate them with their developers
    const featuresByDeveloper = features.flatMap((feature) =>
      feature.assignee_ids ? feature.assignee_ids.map((assigneeId) => ({
        developer: developerLookup[assigneeId],
        feature,
      })) : []
    );

    // Group by developer
    const groupedByDeveloper = _.groupBy(featuresByDeveloper, 'developer.id');

    const groupedFeatures = Object.values(groupedByDeveloper).map((group) => ({
      developer: group[0].developer,
      features: group.map((item) => item.feature),
    }))
    // Transform the grouped data into the desired output format
    setFeaturesByDevelopers(groupedFeatures)
  };

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
    featuersByDevelopers,
    tickets,
    setTickets
  }

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>
}
