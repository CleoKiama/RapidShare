import React, { useEffect, useState } from 'react'
import Device from './device.jsx'

function DiscoveredDevices() {
    const [deviceData, setDeviceData] = useState()
    useEffect(() => {
        function listen(event, data) {
            setDeviceData(data)
        }
        window.electron.on('deviceFound', listen)
        window.electron .on('foundDevicesUpdate', listen)
        window.electron.on('foundDevicesUpdate',listen)
        return () => {
            window.electron.removeListener('deviceFound', listen)
            window.electron.removeListener('foundDevicesUpdate', listen)
        }
    }, [])
    if (!deviceData) {
        // ** can render something else until a device is discovered
        return <></>
    }
    const devices = deviceData.devices.map((device) => {
        return (
            <Device
                key={device.address}
                isCurrentDevice={false}
                userName={device.username}
                platform={device.platform}
            />
        )
    })
    return (
        <div className="mt-6 grid grid-cols-1 justify-between  divide-y-2 ">
            {devices}
        </div>
    )
}

export default DiscoveredDevices
