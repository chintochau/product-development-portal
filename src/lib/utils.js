import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}


export const daysFromToday = (dateString) => {
  // dateString should be in format "yyyy-MM-dd"
  const today = new Date()
  const date = new Date(dateString)
  const timeDiff = date.getTime() - today.getTime()
  const daysDiff = timeDiff / (1000 * 3600 * 24)
  return daysDiff > 0 ? `${Math.round(daysDiff)} days` : "Due"
}

export const filterTicketInformation = (ticket) => {
  const {iid,state,web_url,title,closed_at,created_at,updated_at,milestone,assignee,labels} = ticket
  return {
    iid,
    state,
    web_url,
    title,
    closed_at,
    created_at,
    updated_at,
    milestoneTitle: milestone?.title,
    assigneeName: assignee?.name,
    labels,
    isFeature: labels?.includes("type::feature"),
    isBug: labels?.includes("type::bug")
  }
}