import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { userRoles } from "../renderer/src/constant"

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
  const { iid, state, web_url, title, closed_at, created_at, updated_at, milestone, assignee, labels } = ticket
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

export const isInProgress = (startDate, endDate) => {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  return now >= start && now <= end
}


export function toQueryString(params) {
  return (
    '?' +
    Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
  );
}

// Example usage:
const input = {
  state: "opened",
  per_page: 100
};


// A function to calculate the color based on priority level
export const getColorIntensityByLevel = (level, scale = 5) => {

  let r, g, b

  if (level <= scale / 2) {
    g = 255
    b = 0
    r = Math.min(255, (Math.round((255 / (scale / 2)) * level)))
  } else {
    g = Math.max(0, 255 - Math.round((255 / (scale )) * level))
    b = 0
    r = 255
  }


  return `rgb(${r}, ${g}, ${b})`
}



export const findTeamByRole = (role) => {
  const team = userRoles.find((userRole) => userRole.role === role)
  if (team) {
      return team.team
  } else {
      return null
  }
}


export const findCommitsFromNotes = (notes) => {
  const commits = []
  notes.forEach((note) => {
    if (note.noteType === "commit") {
      commits.push(note)
    }
  })
  return commits
}




const predefinedColors = ["#FF5733", "#33FF57", "#3357FF", "#F1C40F", "#8E44AD"]; // 5 distinct colors

const stringToHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

export const getColorForAuthor = (author) => {
  const hash = Math.abs(stringToHash(author)); // Ensure non-negative hash
  const colorIndex = hash % predefinedColors.length; // Map hash to one of the 5 colors
  return predefinedColors[colorIndex];
};