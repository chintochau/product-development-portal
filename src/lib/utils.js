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


export function timeAgo(dateString) {
  const date = new Date(dateString);

  if (isNaN(date)) {
    throw new Error("Input must be a valid Date object or date string.");
  }

  const now = new Date();
  const diff = now - date; // Difference in milliseconds
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let timeAgoString;
  if (seconds < 60) {
    timeAgoString = `${seconds} sec${seconds === 1 ? "" : "s"} ago`;
  } else if (minutes < 60) {
    timeAgoString = `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  } else if (hours < 24) {
    timeAgoString = `${hours} hour${hours === 1 ? "" : "s"} ago`;
  } else if (days < 30) {
    timeAgoString = `${days} day${days === 1 ? "" : "s"} ago`;
  } else if (months < 12) {
    timeAgoString = `${months} month${months === 1 ? "" : "s"} ago`;
  } else {
    timeAgoString = `${years} year${years === 1 ? "" : "s"} ago`;
  }

  // Get the local time representation
  const localTime = date.toLocaleString();

  return `${localTime} (${timeAgoString})`;
}