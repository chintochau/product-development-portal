import React, { useEffect, useState } from 'react'
import { useTickets } from '../contexts/ticketsContext'
import frontMatter from 'front-matter'
import { Button } from '../../../components/ui/button'
import { useNavigate, useParams } from 'react-router-dom'

const FeatureRequestDetailPage = () => {
  const { selectedTicket, setSelectedTicket } = useTickets()
  const { featureId } = useParams()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // If we don't have the selected ticket or the ID doesn't match, fetch it
    if (!selectedTicket || (selectedTicket.id !== featureId && selectedTicket.iid !== featureId)) {
      setLoading(true)
      // Try to fetch from PostgreSQL first
      window.api.features.getById(featureId).then(response => {
        if (response.success) {
          setSelectedTicket(response.data)
        }
        setLoading(false)
      }).catch(error => {
        console.error('Error fetching feature:', error)
        setLoading(false)
      })
    }
  }, [featureId, selectedTicket, setSelectedTicket])

  if (loading) {
    return <div className="px-4">Loading...</div>
  }

  const { title, overview, currentProblems, requirements, requestor } = selectedTicket || {}
  
  return (
    <div className="px-4">
      <div className="flex items-center">
        <h1 className="text-2xl">{title}</h1>{' '}
        <Button
          variant="link"
          size="sm"
          className="text-muted-foreground"
          onClick={() => {
            navigate(`/features/${selectedTicket.id || selectedTicket.iid}/edit`)
          }}
        >
          Edit
        </Button>
      </div>
      <p>{overview}</p>
      <p>{currentProblems}</p>
      <p>{requirements}</p>
      <p>{requestor}</p>
    </div>
  )
}

export default FeatureRequestDetailPage
