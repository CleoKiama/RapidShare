import React from 'react'
import PropTypes from 'prop-types'

function Container({ children }) {
    return (
        <div className="mx-auto max-h-fit  min-h-80 pt-4 pl-4 w-[413px] rounded-2xl bg-grey-50 ">
            {children}
        </div>
    )
}

Container.propTypes = {
    children: PropTypes.node,
}

export default Container
