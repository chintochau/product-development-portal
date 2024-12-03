import React, { createContext, useContext, useEffect, useState } from 'react'
import { getGroupIssuesForDeveloper, getUsers } from '../services/gitlabServices'

const DeveloperContext = createContext()

export const useDevelopers = () => {
  return useContext(DeveloperContext)
}

export const DeveloperProvider = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [developers, setDevelopers] = useState([])
  const [selectedDevelopers, setSelectedDevelopers] = useState([])
  const [tickets, setTickets] = useState([])
  const loadDevelopers = async () => {
    const data = await getUsers()
    setDevelopers(data)
    setLoading(false)
  }

  useEffect(() => {
    loadDevelopers()
  }, [])

  const isSelected = (id) => {
    return selectedDevelopers.findIndex((dev) => dev.id === id) !== -1
  }

  const selectDeveloper = (id) => {
    if (isSelected(id)) {
      setSelectedDevelopers(selectedDevelopers.filter((dev) => dev.id !== id))
    } else {
      setSelectedDevelopers([...selectedDevelopers, developers.find((dev) => dev.id === id)])
    }
  }

  const getTicketsForSelectedDevelopers = async () => {
    setLoading(true)
    setTickets([])
    const allTickets = []

    console.log('searching for issues for developers:', selectedDevelopers)

    for (const developer of selectedDevelopers) {
      const developerTickets = await getGroupIssuesForDeveloper(developer.id)
      allTickets.push(...developerTickets)

      // check for duplicate tickets
      const uniqueTickets = allTickets.filter(
        (ticket, index) => allTickets.findIndex((t) => t.iid === ticket.iid) === index
      )

      setTickets(uniqueTickets)
    }

    setLoading(false)
  }

  const value = {
    loading,
    setLoading,
    developers,
    setDevelopers,
    selectedDevelopers,
    setSelectedDevelopers,
    isSelected,
    selectDeveloper,
    getTicketsForSelectedDevelopers,
    tickets
  }

  return <DeveloperContext.Provider value={value}>{children}</DeveloperContext.Provider>
}
