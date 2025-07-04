export const getWrikeProjects = async () => {
  const data = await window.api.wrike(`folders`, 'GET')
  return data
}

export const getWrikeTasksWithFolderId = async (folderId) => {
  const data = await window.api.wrike(`folders/${folderId}/tasks`, 'GET')
  return data
}
