import React, { useEffect, useState } from 'react'
import Device from './device.jsx'
import ChooseFile from './chooseFile.jsx'


function DiscoveredDevices() {
  // TODO remember to remove the initual data here when done with the ui
  const [deviceData, setDeviceData] = useState()
  const [deviceSelected, setDeviceSelected] = useState()
  const [isSelected, setIsSelected] = useState(false)

  useEffect(() => {
    function listen(_, data) {
      console.log('recieved a device on the ui')
      setDeviceData(data)
    }
    window.electron.on('deviceFound', listen)
    return () => {
      window.electron.removeListener('deviceFound', listen)
    }
  }, [])
  useEffect(() => {
    if (!deviceData)
      window.electron.invoke('currentDevices').then((foundDevices) => {
        setDeviceData(foundDevices)
      })
  }, [])
  const handleNavigationBack = () => {
    setIsSelected(false)
  }
  const handleDeviceClick = (address) => {
    for (const device of deviceData.devices) {
      if (device.address === address) {
        setDeviceSelected(<ChooseFile handleClick={handleNavigationBack} address={address} deviceName={device.username} />)
        setIsSelected(true)
        break;
      }
    }
  }
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
        handleClick={handleDeviceClick}
      />
    )
  })
  return (
    <div className="mt-6 grid grid-cols-1 justify-between  divide-y-2 ">
      {
        isSelected ? deviceSelected
          :
          devices
      }
    </div>
  )
}

export default DiscoveredDevices
