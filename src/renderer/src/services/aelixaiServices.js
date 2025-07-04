import { prompts } from './prompts'

const baseUrl = 'https://api.aelix.ai'

export const getChatCompletion = async (messages) => {
  const body = {
    selectedModel: 'gpt-4o-mini', // or gpt-4o
    messages: messages
  }
  const response = await fetch(`${baseUrl}/llm/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = await response.json()

  return data.content
}

export const createFeatureTicket = async (data) => {
  const { title, description, product } = data

  const messages = [
    {
      role: 'system',
      content: prompts.featureTicketSystemPrompt
    },
    {
      role: 'user',
      content: `Generate a ticket description for the following information: ${title} ${description || ''} ${product && `Product: ${product}`}`
    }
  ]
  const aiDescription = await getChatCompletion(messages)

  return aiDescription
}
