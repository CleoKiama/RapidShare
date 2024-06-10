import React, { useEffect, useState } from 'react'


export default function Settings() {
  const [saveDirectory, setSaveDirectory] = useState('')
  useEffect(() => {
    if (!saveDirectory) {
      window.electron.invoke('getSaveDirectory')
        .then(dir => {
          setSaveDirectory(dir)
        })
    }
  })
  const onChangeSaveDirectory = () => {
    window.electron.invoke('dialog:handleSaveDirectory').then((choosenPath) => {
      if (choosenPath === "canceled") return
      setSaveDirectory(choosenPath)
    })
  }
  const openInExploer = async () => {
    try {
      await window.electron.openInExpoler(saveDirectory)
    } catch (error) {
      //TODO do proper error handling here 
    }
  }
  return (
    <div className='mx-auto mt-20 justify-evenly px-2  flex flex-row items-center'>
      <p className='text-wrap text-gray-700'>received files are saved in : <span onClick={() => openInExploer()} className='cursor-pointer decoration-solid text-blue-400'>{saveDirectory}</span></p>
      <button className='rounded-xl px-2 py-1 bg-blue-700 text-sm text-white hover:bg-blue-500 cursor-pointer'
        onClick={onChangeSaveDirectory}
      >change Save Directory
      </button>
    </div>
  )
}
