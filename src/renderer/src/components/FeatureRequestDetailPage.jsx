import React, { useEffect } from 'react'
import { useTickets } from '../contexts/ticketsContext'
import frontMatter from 'front-matter'
import { Button } from '../../../components/ui/button'
import { useNavigate } from 'react-router-dom'

const FeatureRequestDetailPage = () => {
  const { selectedTicket } = useTickets()
  const { title, overview, currentProblems, requirements, requestor } = selectedTicket || {}
  const navigate = useNavigate()
  return (
    <div className="px-4">
      <div className="flex items-center">
        <h1 className="text-2xl">{title}</h1>{' '}
        <Button
          variant="link"
          size="sm"
          className="text-muted-foreground"
          onClick={() => {
            navigate(`/features/${selectedTicket.iid}/edit`)
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
