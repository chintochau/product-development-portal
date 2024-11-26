import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../../../../components/ui/card'
import { useSingleProduct } from '../../contexts/singleProductContext'
import { Input } from '../../../../components/ui/input'
import { Textarea } from "@/components/ui/textarea"

import { Button } from '../../../../components/ui/button'
import { Send } from 'lucide-react'
import { useUser } from '../../contexts/userContext'
import { cn, timeAgo } from '../../../../lib/utils'

const NotesCard = ({ className }) => {
  const { notes, postNote, setShouldReloadNotes } = useSingleProduct()
  const [message, setMessage] = useState('')
  const { user } = useUser()
  const sendNote = async (e) => {
    e.preventDefault()
    await postNote({ author: user.username }, message)
    setMessage('')
    setShouldReloadNotes(true)
  }

  const canSendMessage = () => {
    if (user.username) {
      return true
    }
    return false
  }

  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
        <CardDescription>Share your notes here</CardDescription>
      </CardHeader>
      <CardContent>
        {notes.map((item) => (
          <div key={item.id} className="my-2 border border-muted p-2 rounded-md">
            <p className=' whitespace-pre-wrap'>{item.body}</p>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">{item.attributes.author}</p>
              <p className="text-sm text-muted-foreground">{timeAgo(item.date)}</p>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <form onSubmit={sendNote} className="flex w-full gap-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your note here"
          />
          <Button size="icon" type="submit" variant="outline" disabled={!canSendMessage()}>
            <Send />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

export default NotesCard
