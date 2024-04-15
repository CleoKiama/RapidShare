import React, { useEffect, useState } from 'react'
import Device from './device.jsx'

let initialData = {
  devices: [
    {
      uid: 1001,
      gid: 1001,
      username: 'john',
      homedir: '/Users/john',
      shell: '/bin/zsh',
      address: '192.168.0.104',
      port: 4000,
      platform: 'Darwin'
    }
  ]
}

function DiscoveredDevices() {
  const [deviceData, setDeviceData] = useState(initialData)
  useEffect(() => {
    function listen(_, data) {
      setDeviceData(data)
    }
    window.electron.on('deviceFound', listen)
    window.electron.on('foundDevicesUpdate', listen)
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
        userName={device.username}
        platform={device.platform}
        address={device.address}
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
