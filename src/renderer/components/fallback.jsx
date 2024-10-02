import React from 'react'
import PropTypes from 'prop-types'

export default function Fallback({ error }) {
  return (
    <div>
      <h5 className="text-red-600 ">something went wrong</h5>
    </div>
  )
}

Fallback.propTypes = {
  error: PropTypes.string,
}
