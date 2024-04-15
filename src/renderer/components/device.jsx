import React from 'react'
import clsx from 'clsx'
import PropTypes from 'prop-types'
function Device({ isCurrentDevice, userName, address, platform }) {
  console.log(address)
  const blurWindow = () => {
    console.log("Blurring the window until dialogue is closed")
  }
  const unBlurWindow = () => {
    console.log('unBlurring the window now after dialogue closed')
  }
  const handleClick = async () => {
    console.log(`sending a request to open file dialog to send to addr ${address}`)
    blurWindow()
    const fileStaff = await window.electron.openFileDialog(address)
    console.log(fileStaff)
    unBlurWindow()
  }
  return (
    <div className={clsx('flex flex-row items-center', !isCurrentDevice && 'py-6')} >
      <img
        src={`static://assets/${platform}_logo.svg`}
        className="h-10 w-10"
        alt={`${platform} platform logo`}
      />
      <p className='ml-4'>{userName}</p>
    </div>
  )
}

Device.propTypes = {
  userName: PropTypes.string.isRequired,
  platform: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
}

export default Device
