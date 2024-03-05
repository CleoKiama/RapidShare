import React, { useEffect, useState } from 'react'
import Device from './device.jsx'



function DiscoveredDevices() {
    const [deviceData, setDeviceData] = useState()
    useEffect(() => {
        function listen(event,data) {
           setDeviceData(data)
        }
        window.electron.on('deviceFound', listen)
        return () => {
            window.electron.removeListener('deviceFound', listen)
        }
    }, [])
    if (!deviceData) {
        // ** can render something else until a device is discovered
        return  <></>
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
    return <div className="grid grid-cols-1 divide-y-2 justify-between  mt-6 ">{devices}</div>
}

export default DiscoveredDevices
