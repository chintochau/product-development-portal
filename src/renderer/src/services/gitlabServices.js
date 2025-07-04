const PRODUCT_PROJECTID = 61440508 //jasonfortesting
const SOVI_GROUP_ID = 17062603
const FIRMWARE_PROJECTID = 36518748
const IOS_PROJECTID = 34489453
const ANDROID_PROJECTID = 34489306
const DESKTOP_PROJECTID = 34489352
const FEATURES_PROJECTID = 36518895

import _ from 'lodash'

export const groupIssuesByProjectId = (issues) => {
  // Use Lodash's groupBy to group issues by project_id
  const groupedIssues = _.groupBy(issues, 'project_id')

  // Create a map for quick lookup of config details
  const projectConfigMap = _.keyBy(projectConfig, 'project_id')

  // Create the result object
  return Object.keys(groupedIssues).reduce((result, projectId) => {
    const config = projectConfigMap[projectId] || {}
    result[projectId] = {
      id: Number(projectId), // Use predefined ID or fallback to projectId
      name: config.name ?? `Project ${projectId}`, // Fallback name for unknown projects
      issues: groupedIssues[projectId], // Issues grouped by this project ID
      color: config.color ?? 'hsl(var(--default-chart-color))' // Fallback color,
    }
    return result
  }, {})
}

// Example usage:
const projectConfig = [
  { id: 5, name: 'Firmware', project_id: FIRMWARE_PROJECTID, color: 'hsl(var(--chart-1))' },
  { id: 6, name: 'iOS', project_id: IOS_PROJECTID, color: 'hsl(var(--chart-2))' },
  { id: 7, name: 'Android', project_id: ANDROID_PROJECTID, color: 'hsl(var(--chart-3))' },
  { id: 8, name: 'Desktop', project_id: DESKTOP_PROJECTID, color: 'hsl(var(--chart-4))' }
]

export function getProjectNamesAndIds(issues) {
  // Use a Map to ensure unique project names and IDs
  const projectMap = new Map()

  // Create a map for quick lookup of config details
  const projectConfigMap = _.keyBy(projectConfig, 'project_id')

  issues.forEach((issue) => {
    if (!projectMap.has(issue.project_id)) {
      const config = projectConfigMap[issue.project_id] || {}
      const projectRelativePath = issue.references.relative.split('#')[0]
      projectMap.set(issue.project_id, {
        id: config.id || issue.project_id,
        name: config.name || projectRelativePath, // Fallback name
        color: config.color || 'hsl(var(--default-chart-color))',
        projectId: issue.project_id,
        web_url: `https://gitlab.com/lenbrook/sovi/${projectRelativePath}/-/issues/`
      })
    }
  })
  // Convert the Map to an array
  return Array.from(projectMap.values()).sort((a, b) => a.id - b.id)
}

export const getProjects = async () => {
  const data = [
    {
      id: 1,
      name: 'BluOS Firmware',
      projectId: FIRMWARE_PROJECTID,
      labels: ['type::feature', 'BluOS', 'priority::high', 'workflow:: 1 to-do', 'stage::new']
    },
    {
      id: 2,
      name: 'iOS',
      projectId: IOS_PROJECTID,
      labels: ['type::feature', 'iOS', 'priority::normal', 'workflow:: 1 to-do', 'stage::new']
    },
    {
      id: 3,
      name: 'Android',
      projectId: ANDROID_PROJECTID,
      labels: ['type::feature', 'Android', 'priority::normal', 'workflow:: 1 to-do', 'stage::new']
    },
    {
      id: 4,
      name: 'Desktop',
      projectId: DESKTOP_PROJECTID,
      labels: ['type::feature', 'Desktop', 'priority::normal', 'workflow:: 1 to-do', 'stage::new']
    }
  ]
  return data
}

export const getNameForProject = (id) => {
  switch (id) {
    case FIRMWARE_PROJECTID:
      return ''
    case IOS_PROJECTID:
      return 'iOS'
    case ANDROID_PROJECTID:
      return 'Android'
    case DESKTOP_PROJECTID:
      return 'Desktop'
    default:
      return null
  }
}

import yaml from 'js-yaml'
import frontMatter from 'front-matter'
import { toQueryString } from '../../../lib/utils'

export const addLabelToTicket = async (label, ticketInfo) => {
  const { iid, project_id } = ticketInfo
  const issue = await window.api.gitlab(`projects/${project_id}/issues/${iid}`, 'GET')
  const labels = [...issue.labels, label]
  const response = await window.api.gitlab(
    `projects/${project_id}/issues/${iid}?labels=${labels.join(',')}`,
    'PUT'
  )
  return response
}

export const removeLabelFromTicket = async (label, ticketInfo) => {
  const { iid, project_id } = ticketInfo
  const issue = await window.api.gitlab(`projects/${project_id}/issues/${iid}`, 'GET')
  const labels = [...issue.labels, label]
  const response = await window.api.gitlab(
    `projects/${project_id}/issues/${iid}?labels=${labels.join(',')}`,
    'PUT'
  )
  return response
}

export const getProductsLog = async () => {
  const data = await window.api.gitlab(
    `projects/${PRODUCT_PROJECTID}/issues?labels=product&state=opened&per_page=100`,
    'GET'
  )
  return data
}

export const createGitlabIssue = async (data, projectId = PRODUCT_PROJECTID) => {
  const response = await window.api.gitlab(`projects/${projectId}/issues`, 'POST', data)

  console.log('createGitlabIssue', response)

  return response
}

export const createGitlabIssueInYamlFormat = async (data, projectId = PRODUCT_PROJECTID) => {
  const response = await window.api.gitlab(
    `projects/${projectId}/issues`,
    'POST',
    convertDataToTicketObject(data)
  )
  return response
}

export const saveGitlabIssue = async (iid, data, projectId = PRODUCT_PROJECTID) => {
  const response = await window.api.gitlab(
    `projects/${projectId}/issues/${iid}`,
    'PUT',
    convertDataToTicketObject(data)
  )
  return response
}

export const updateTicketDescription = async (iid, data) => {
  const description = jsonToMarkdown(data)
  const response = await window.api.gitlab(`projects/${PRODUCT_PROJECTID}/issues/${iid}`, 'PUT', {
    description
  })
  return response
}

// convert data to object for gitlab ticket
const convertDataToTicketObject = (data) => {
  const { title, projectName, useLookup } = data
  const isProduct = useLookup || projectName
  const descriptionData = {
    ...data
  }
  return {
    title: isProduct ? 'Product Initiation' : title,
    description: jsonToMarkdown(descriptionData),
    confidential: true,
    labels: [isProduct ? 'product' : 'type::feature']
  }
}

export const deleteTicket = async (iid) => {
  const response = await window.api.gitlab(`projects/${PRODUCT_PROJECTID}/issues/${iid}`, 'DELETE')
  return response
}

export const getProductDataFromGitlabWithIid = async (iid) => {
  const data = await window.api.gitlab(`projects/${PRODUCT_PROJECTID}/issues/${iid}`, 'GET')
  return data
}

const jsonToMarkdown = (data, message) => {
  const yamlContent = yaml.dump(data)
  const markdown = `---\n${yamlContent}---\n\n${message ? message : ''}`
  return markdown
}

export const ticketToJSON = (ticket) => {
  const { title, description, iid, epic, web_url, labels, created_at, updated_at } = ticket || {}
  const parsedData = frontMatter(description)
  return {
    ...parsedData.attributes,
    title,
    iid,
    epic,
    web_url,
    labels,
    created_at: created_at.split('T')[0],
    updated_at: updated_at.split('T')[0]
  }
}

export const getTicketsFromEpic = async (epicId) => {
  const data = await window.api.gitlab(
    `groups/${SOVI_GROUP_ID}/epics/${epicId}/issues?page=1&per_page=100`,
    'GET'
  )
  return data
}

export const postNotesToTicket = async (iid, data, message, project = PRODUCT_PROJECTID) => {
  const {
    type, // type of comment,
    author // author of comment
  } = data || {}
  const noteData = jsonToMarkdown(data, message)
  const response = await window.api.gitlab(`projects/${project}/issues/${iid}/notes`, 'POST', {
    body: noteData
  })
  return response
}

export const updateNotesToTicket = async (
  iid,
  noteId,
  data,
  message,
  project = PRODUCT_PROJECTID
) => {
  const {
    type, // type of comment,
    author // author of comment
  } = data || {}
  const noteData = jsonToMarkdown(data, message)
  const response = await window.api.gitlab(
    `projects/${project}/issues/${iid}/notes/${noteId}`,
    'PUT',
    { body: noteData }
  )
  return response
}

export const getNotesFromTicket = async (iid, project = PRODUCT_PROJECTID, page = 1) => {
  const data = await window.api.gitlab(
    `projects/${project}/issues/${iid}/notes?page=${page}&per_page=100`,
    'GET'
  )
  return data
}

export const getLabelsFromTicket = async (iid, project = PRODUCT_PROJECTID) => {
  const data = await window.api.gitlab(
    `projects/${project}/issues/${iid}/resource_label_events?per_page=100`,
    'GET'
  )
  return data
}

export const deleteNoteFromTicket = async (iid, noteId, project = PRODUCT_PROJECTID) => {
  const response = await window.api.gitlab(
    `projects/${project}/issues/${iid}/notes/${noteId}`,
    'DELETE'
  )
  return response
}

export const uploadPIFFile = async (iid, file, fileUrl) => {
  console.log('file', file)
  console.log('fileUrl', fileUrl)

  let fileData, fileBuffer
  if (file) {
    fileBuffer = await file.arrayBuffer() // Convert the file to an ArrayBuffer
    fileData = {
      name: file.name, // File name
      type: file.type, // MIME type
      size: file.size, // File size
      buffer: Array.from(new Uint8Array(fileBuffer)) // Convert ArrayBuffer to an array
    }
  }
  const response = await window.api.gitlab(`projects/${PRODUCT_PROJECTID}/uploads`, 'UPLOAD', {
    file: fileData,
    fileUrl: fileUrl
  })
  return response
}

export const getEpics = async () => {
  const data = await window.api.gitlab(
    `groups/${SOVI_GROUP_ID}/epics?state=opened&per_page=100`,
    'GET'
  )
  return data
}

export const getUsers = async () => {
  const data = await window.api.gitlab(`/groups/${SOVI_GROUP_ID}/members?per_page=100`, 'GET')
  return data
}

export const getGroupIssuesForDeveloper = async (developerId) => {
  const data = await window.api.gitlab(
    `groups/${SOVI_GROUP_ID}/issues?assignee_id=${developerId}&state=opened&per_page=100&labels=workflow:: 2 doing`,
    'GET'
  )
  return data
}

export const getGroupIssuesWithQuery = async (inputData) => {
  const query = toQueryString(inputData)
  const data = await window.api.gitlab(`groups/${SOVI_GROUP_ID}/issues${query}`, 'GET')
  return data
}

export const getMilestones = async () => {
  const firmware = await window.api.gitlab(
    `projects/${FIRMWARE_PROJECTID}/milestones?per_page=100&state=active`,
    'GET'
  )
  const ios = await window.api.gitlab(
    `projects/${IOS_PROJECTID}/milestones?per_page=100&state=active`,
    'GET'
  )
  const android = await window.api.gitlab(
    `projects/${ANDROID_PROJECTID}/milestones?per_page=100&state=active&state=active`,
    'GET'
  )
  const desktop = await window.api.gitlab(
    `projects/${DESKTOP_PROJECTID}/milestones?per_page=100&state=active&state=active`,
    'GET'
  )
  const data = [...firmware, ...ios, ...android, ...desktop]
  return data
}

export const getAllMilestones = async () => {
  // get updatedAfter from six months ago
  const updatedAfter = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString()

  const firmware = await window.api.gitlab(
    `projects/${FIRMWARE_PROJECTID}/milestones?per_page=15&updated_after=${updatedAfter}`,
    'GET'
  )
  const ios = await window.api.gitlab(
    `projects/${IOS_PROJECTID}/milestones?per_page=15&updated_after=${updatedAfter}`,
    'GET'
  )
  const android = await window.api.gitlab(
    `projects/${ANDROID_PROJECTID}/milestones?per_page=15&updated_after=${updatedAfter}`,
    'GET'
  )
  const desktop = await window.api.gitlab(
    `projects/${DESKTOP_PROJECTID}/milestones?per_page=15&updated_after=${updatedAfter}`,
    'GET'
  )
  const data = [...firmware, ...ios, ...android, ...desktop]
  return data
}

export const getIssuesFromMilestone = async (projectid, milestoneId) => {
  const data = await window.api.gitlab(
    `projects/${projectid}/milestones/${milestoneId}/issues?per_page=100`,
    'GET'
  )
  return data
}

/**
 * Get all feature requests issues
 * @param {number} page - page number
 * @param {number} ticketIid - ticket id, 1 for feature, 2 for adhoc task
 * @returns {Promise<Array>} - array of feature requests issues
 */
export const getFeaturesRequestsIssues = async (page = 1, ticketIid = 1) => {
  const data = await getNotesFromTicket(ticketIid, FEATURES_PROJECTID, page)
  const filteredData = data.filter((item) => !item.system)
  return filteredData
}

/**
 * Create a new feature request issue
 * @param {Object} data - data of feature request
 * @param {number} ticketIid - ticket id, 1 for feature, 2 for adhoc task
 * @returns {Promise<Object>} - created feature request issue
 */
export const createFeatureRequestIssue = async (data, ticketIid = 1) => {
  const response = await postNotesToTicket(ticketIid, data, null, FEATURES_PROJECTID)
  return response
}

/**
 * Update a feature request issue
 * @param {number} noteId - note id
 * @param {Object} data - data of feature request
 * @param {number} ticketIid - ticket id, 1 for feature, 2 for adhoc task
 * @returns {Promise<Object>} - updated feature request issue
 */
export const updateFeatureRequestIssue = async (noteId, data, ticketIid = 1) => {
  const response = await updateNotesToTicket(ticketIid, noteId, data, null, FEATURES_PROJECTID)
  return response
}

/**
 * Delete a feature request issue
 * @param {number} noteId - note id
 * @param {number} ticketIid - ticket id, 1 for feature, 2 for adhoc task
 * @returns {Promise<Object>} - deleted feature request issue
 */
export const deleteFeatureRequestIssue = async (noteId, ticketIid = 1) => {
  const response = await deleteNoteFromTicket(ticketIid, noteId, FEATURES_PROJECTID)
  return response
}

export const getMilestonePlanningIssues = async (page = 1) => {
  const data = await getNotesFromTicket(2, FEATURES_PROJECTID, page)
  const filteredData = data.filter((item) => !item.system)
  return filteredData
}

export const createMilestonePlanningIssue = async (data) => {
  const response = await postNotesToTicket(2, data, null, FEATURES_PROJECTID)
  return response
}

export const updateMilestonePlanningIssue = async (noteId, data) => {
  const response = await updateNotesToTicket(2, noteId, data, null, FEATURES_PROJECTID)
  return response
}

export const deleteMilestonePlanningIssue = async (noteId) => {
  const response = await deleteNoteFromTicket(2, noteId, FEATURES_PROJECTID)
  return response
}

// uiux request, with id 4
export const createUiUxRequestIssue = async (data) => {
  const response = await postNotesToTicket(4, data, null, FEATURES_PROJECTID)
  return response
}

export const updateUiUxRequestIssue = async (noteId, data) => {
  const response = await updateNotesToTicket(4, noteId, data, null, FEATURES_PROJECTID)
  return response
}

export const deleteUiUxRequestIssue = async (noteId) => {
  const response = await deleteNoteFromTicket(4, noteId, FEATURES_PROJECTID)
  return response
}

export const getUiUxRequestIssues = async (page = 1) => {
  const data = await getNotesFromTicket(4, FEATURES_PROJECTID, page)
  const filteredData = data.filter((item) => !item.system)
  return filteredData
}
