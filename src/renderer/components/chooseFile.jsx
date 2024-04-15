import React from 'react'
import PropTypes from 'prop-types'
import c from 'ansi-colors'

export default function ChooseFile({ handleClick, deviceName, address }) {
  const openDialogue = (address, type) => {
    window.electron.openFileDialog(address, type)
  }
  return (
    <section>
      <input
        onClick={handleClick}
        type='image'
        src='static://assets/arrow_back.svg'
        className='h-6 w-6'
      />
      <p>send files to  : {deviceName}</p>
      <div
        className='border pt-8 border-dotted h-32 w-3/4 mx-auto border-slate-700'
      >
        <img className='h-8 mx-auto w-8' src='static://assets/upload.svg' />
        <p className='text-center'>
          choose a
          <a
            onClick={() => openDialogue(address, 'file')}
            className='cursor-pointer text-blue-400'
          > file </a> or
          <a
            onClick={() => openDialogue(address, 'folder')}
            className='cursor-pointer text-blue-400'> folder </a> to send
        </p>
      </div>
    </section>
  )
}


ChooseFile.propTypes = {
  deviceName: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired
}
