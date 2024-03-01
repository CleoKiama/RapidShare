import React, { useState, useEffect } from 'react'
import Device from './device.jsx'
import Loader from './loader.jsx'

export default function ThisDevice() {
    const [thisDevice, setThisDevice] = useState()
    const [thisDeviceInfo, setThisDeviceInfo] = useState(false)
    useEffect(() => {
        if (thisDeviceInfo) return
        window.electron.this_device().then((device) => {
            setThisDevice(device)
            setThisDeviceInfo(true)
        })
    })
    return (
        <div>
            {!thisDevice? 
                <Loader />
             : 
                <Device
                    isCurrentDevice={true}
                    userName={thisDevice.userInfo.username}
                    platform={thisDevice.type}
                />
            }
        </div>
    )
}
