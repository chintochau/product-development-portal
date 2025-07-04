import React, { createContext, useContext, useEffect, useState } from 'react'
import { getGroupIssuesWithQuery, getUiUxRequestIssues } from '../services/gitlabServices'
import frontMatter from 'front-matter'
import type { UiUxRequest, UiUxRequestStats } from '../../../@types/models/uiux.types'

interface UiuxContextType {
  uiuxRequests: UiUxRequest[]
  setUiuxRequests: React.Dispatch<React.SetStateAction<UiUxRequest[]>>
  loading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  shouldRefresh: boolean
  setShouldRefresh: React.Dispatch<React.SetStateAction<boolean>>
  uiuxTickets: any[]
  setUiuxTickets: React.Dispatch<React.SetStateAction<any[]>>
  assignTicketToTask: (taskId: string, ticketId: number) => void
  stats?: UiUxRequestStats
}

const UiuxContext = createContext<UiuxContextType | undefined>(undefined)

export const UiuxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uiuxRequests, setUiuxRequests] = useState<UiUxRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [shouldRefresh, setShouldRefresh] = useState(true)
  const [uiuxTickets, setUiuxTickets] = useState<any[]>([])
  const [stats, setStats] = useState<UiUxRequestStats>()
  const [usePostgreSQL, setUsePostgreSQL] = useState(true)

  const getUIUXTickets = async () => {
    const response = await getGroupIssuesWithQuery({
      assignee_id: 10957472,
      state: 'opened',
      per_page: 100
    })
    setUiuxTickets(response)
  }

  useEffect(() => {
    const fetchUiux = async () => {
      setLoading(true)
      
      try {
        if (usePostgreSQL) {
          // Fetch from PostgreSQL
          const result = await window.api.uiux.getAll()
          if (result.success && result.data) {
            setUiuxRequests(result.data)
            
            // Fetch stats
            const statsResult = await window.api.uiux.getStats()
            if (statsResult.success && statsResult.data) {
              setStats(statsResult.data)
            }
          } else {
            throw new Error(result.error || 'Failed to fetch UI/UX requests from PostgreSQL')
          }
        } else {
          // Fallback to GitLab
          console.log('Falling back to GitLab for UI/UX requests...')
          const response = await getUiUxRequestIssues()
          const mappedRequests: UiUxRequest[] = response.map((issue: any) => {
            const attributes = frontMatter(issue.body).attributes as any
            return {
              id: issue.id.toString(),
              gitlab_note_id: issue.id,
              title: attributes.title || 'Untitled',
              description: attributes.description || '',
              priority: attributes.priority,
              status: attributes.status || 'todo',
              step: attributes.step,
              assignee: attributes.assignee,
              requestor: attributes.by,
              tags: attributes.tags || [],
              gitlab_tickets: attributes.gitlabTickets || [],
              created_at: issue.created_at,
              updated_at: issue.updated_at,
              created_by: issue.author?.username,
              // GitLab-specific fields
              iid: issue.iid,
              url: issue.web_url,
              ...attributes
            }
          })
          setUiuxRequests(mappedRequests)
        }
      } catch (error) {
        console.error('Error fetching UI/UX requests:', error)
        
        // If PostgreSQL fails, try GitLab
        if (usePostgreSQL) {
          console.log('PostgreSQL failed, falling back to GitLab...')
          setUsePostgreSQL(false)
          setShouldRefresh(true)
          return
        }
      } finally {
        setLoading(false)
        setShouldRefresh(false)
      }
    }
    
    if (shouldRefresh) {
      fetchUiux()
      getUIUXTickets()
    }
  }, [shouldRefresh, usePostgreSQL])

  // Function to assign a GitLab ticket to a UI/UX task
  const assignTicketToTask = (taskId: string, ticketId: number) => {
    setUiuxRequests((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              gitlab_tickets: task.gitlab_tickets
                ? [...new Set([...task.gitlab_tickets, ticketId])] // Avoid duplicates
                : [ticketId]
            }
          : task
      )
    )
  }

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
        setUiuxTickets,
        assignTicketToTask,
        stats
      }}
    >
      {children}
    </UiuxContext.Provider>
  )
}

export const useUiux = () => {
  const context = useContext(UiuxContext)
  if (!context) {
    throw new Error('useUiux must be used within a UiuxProvider')
  }
  return context
}