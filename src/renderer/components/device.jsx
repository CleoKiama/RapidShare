import React from 'react'
import clsx from 'clsx'
import PropTypes from 'prop-types'


function Device({ userName, handleClick, address, platform }) {
  return (
    <div onClick={() => handleClick(address)}
      className={clsx('flex flex-row items-center cursor-pointer')} >
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
  handleClick: PropTypes.func.isRequired
}

export default Device
