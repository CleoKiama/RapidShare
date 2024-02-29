import React from 'react'
import PropTypes from 'prop-types'

function Device({ isCurrentDevice, userName ,platform}) {
             
    return (
        <div className="flex flex-row items-center  ">
            <img
                src={`static://assets/${platform}_logo.svg`}
                className="h-10 w-10"
                alt="windows"
            />
            <div className='flex flex-col ml-6'>
                {isCurrentDevice && <p className="self-start text-sm text-gray-600">you</p>}
                <p>{userName}</p>
            </div>
        </div>
    )
}

Device.propTypes = {
    isCurrentDevice: PropTypes.bool,
    userName: PropTypes.string,
    platform : PropTypes.string,
}

export default Device
