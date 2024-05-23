import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

function Nav({ navState, onNavUpdate }) {
  return (
    <nav className="flex flex-row items-center py-1 justify-evenly rounded-xl max-w-56 mx-auto  bg-gray-200 mt-2 mb-8">
      <h5
        className={clsx(navState === 'devices' && 'bg-blue-400 text-white', 'cursor-pointer hover:bg-blue-300 hover:text-white px-5 py-1 rounded-xl')}
        onClick={() => onNavUpdate("devices")}
      >Devices
      </h5>
      <h5
        className={clsx(navState === 'settings' && 'bg-blue-400 text-white', 'cursor-pointer hover:bg-blue-300 hover:text-white px-5 py-1 rounded-xl')}
        onClick={() => onNavUpdate("settings")}
      >
        settings
      </h5>
    </nav >
  )
}

Nav.propTypes = {
  navState: PropTypes.string.isRequired,
  onNavUpdate: PropTypes.func.isRequired
}

export default Nav

