import React, { createContext, useContext, useEffect, useState } from 'react'
import { getGroupIssuesWithQuery, getUiUxRequestIssues } from '../services/gitlabServices'
import frontMatter from 'front-matter'

const UiuxContext = createContext()

export const UiuxProvider = ({ children }) => {
  const [uiuxRequests, setUiuxRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [shouldRefresh, setShouldRefresh] = useState(true)
  const [uiuxTickets,setUiuxTickets] = useState([])

  const getUIUXTickets = async () => {
    const response = await getGroupIssuesWithQuery({
      assignee_id:10957472,
      state:'opened',
      per_page:100
    })
    
    setUiuxTickets(response)
  }

  useEffect(() => {
    const fetchUiux = async () => {
      const response = await getUiUxRequestIssues()
      setUiuxRequests(
        response.map((issue) => {
          const attributes = frontMatter(issue.body).attributes
          return { ...issue, ...attributes, iid: issue.iid, url: issue.web_url }
        })
      )
      setLoading(false)
      setShouldRefresh(false)
    }
    fetchUiux()
    getUIUXTickets()
  }, [shouldRefresh])

  return (
    <UiuxContext.Provider
      value={{
        uiuxRequests,
        setUiuxRequests,
        loading,
        setLoading,
        shouldRefresh,
        setShouldRefresh,
        uiuxTickets,
        setUiuxTickets
      }}
    >
      {children}
    </UiuxContext.Provider>
  )
}

export const useUiux = () => useContext(UiuxContext)
