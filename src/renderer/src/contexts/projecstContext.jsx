import React, { createContext, useContext, useEffect, useState } from 'react'
import { getGroupIssuesWithQuery, getProjects } from '../services/gitlabServices'
import dayjs from 'dayjs'

const ProjectsContext = createContext()

export const useProjects = () => {
  return useContext(ProjectsContext)
}

export const ProjectsProvider = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [projectDict, setProjectDict] = useState({})
  const [weekIssues, setWeekIssues] = useState([])
  const [shouldRefresh, setShouldRefresh] = useState(true)
  const [issuesOpenedThisWeek, setIssuesOpenedThisWeek] = useState([])
  const [issuesClosedThisWeek, setIssuesClosedThisWeek] = useState([])
  const [issuesOpenedLastWeek, setIssuesOpenedLastWeek] = useState([])
  const [issuesClosedLastWeek, setIssuesClosedLastWeek] = useState([])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const projects = await getProjects()
      // make the project array a dictionary
      const projectDict = projects.reduce((acc, project) => {
        acc[project.projectId] = project
        return acc
      }, {})
      setProjects(projects)
      setProjectDict(projectDict)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const getTicketsForRecentTwoWeeks = async () => {
    const createQuery = {
      created_after: dayjs().startOf('week').subtract(1, 'week').toDate(),
      per_page: 100
    }

    const closedQuery = {
      updated_after: dayjs().startOf('week').subtract(1, 'week').toDate(),
      per_page: 100,
      state: 'closed'
    }

    const createResult = await getGroupIssuesWithQuery(createQuery)
    const closedResult = await getGroupIssuesWithQuery(closedQuery)

    const allTickets = createResult.concat(
      closedResult.filter((issue) =>
        dayjs(issue.closed_at).isAfter(dayjs().startOf('week').subtract(1, 'week'))
      )
    )
    const uniqueTickets = allTickets.filter(
      (ticket, index) => allTickets.findIndex((t) => t.iid === ticket.iid) === index
    )

    const startOfLastweek = dayjs().startOf('week').subtract(1, 'week')
    const startOfThisWeek = dayjs().startOf('week')

    setIssuesOpenedLastWeek(
      uniqueTickets.filter(
        (issue) =>
          dayjs(issue.created_at).isBetween(startOfLastweek, startOfThisWeek) ||
          (issue.closed_at && dayjs(issue.closed_at).isBetween(startOfLastweek, startOfThisWeek))
      )
    )

    setIssuesOpenedThisWeek(
      uniqueTickets.filter(
        (issue) =>
          dayjs(issue.created_at).isAfter(startOfThisWeek) ||
          (issue.closed_at && dayjs(issue.closed_at).isAfter(startOfThisWeek))
      )
    )

    setIssuesClosedLastWeek(
      uniqueTickets.filter((issue) =>
        dayjs(issue.closed_at).isBetween(startOfLastweek, startOfThisWeek)
      )
    )

    setIssuesClosedThisWeek(
      uniqueTickets.filter((issue) => dayjs(issue.closed_at).isAfter(startOfThisWeek))
    )
    setWeekIssues(uniqueTickets)
    setLoading(false)
    setShouldRefresh(false)
    return uniqueTickets
  }

  useEffect(() => {
    if (weekIssues.length === 0 || shouldRefresh) {
      getTicketsForRecentTwoWeeks()
    }
  }, [weekIssues, shouldRefresh])

  const value = {
    loading,
    projects,
    setProjects,
    weekIssues,
    issuesOpenedThisWeek,
    issuesOpenedLastWeek,
    issuesClosedThisWeek,
    issuesClosedLastWeek,
    setShouldRefresh,
    shouldRefresh,
    projectDict
  }

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}
