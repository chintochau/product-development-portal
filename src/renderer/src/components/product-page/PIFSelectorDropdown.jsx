import React from 'react'

const PIFSelectorDropdown = () => {
  const [filesList, setFilesList] = React.useState([])
  const listFiles = async () => {
    const files = await window.api.graphGet(import.meta.env.VITE_ENDPOINT_TO_ROADMAP)
    console.log(files['@microsoft.graph.downloadUrl'])
    setFilesList(files?.value)
  }

  return (
    <div>
      {' '}
      <button onClick={listFiles}> list files</button>
      {filesList &&
        filesList.length > 0 &&
        filesList.map((file) => (
          <div className="flex flex-col">
            <div key={file.id} className="grid grid-cols-2">
              <p>{file.name}</p>
              {file.folder && <div>folder</div>}
              {file.file && <div>file</div>}
            </div>
            {file.id}
          </div>
        ))}
    </div>
  )
}

export default PIFSelectorDropdown
