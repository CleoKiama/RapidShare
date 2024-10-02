import React from 'react'
import PropTypes from 'prop-types'

function Container({ children }) {
  return (
    <div className="mx-auto h-[90vh]  min-h-80 min-w-[413px]  rounded-2xl bg-grey-50 pt-4">
      {children}
    </div>
  )
}

Container.propTypes = {
  children: PropTypes.node,
}

export default Container
