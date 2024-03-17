import React, { useState, useEffect } from 'react'
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
        <>
            {!thisDevice? 
                <Loader />
             : 
        <div className="flex flex-row items-center " >
             <img
                src={`static://assets/${thisDevice.type}_logo.svg`}
                className="h-10 w-10"
                alt={`${thisDevice.type} platform logo`}
            />
            <div className="ml-6 flex flex-col">
                    <p className="self-start text-sm text-gray-600">you</p>
                <p>{thisDevice.userInfo.userName}</p>
            </div>
             
        </div>
            }
        </>
    )
}
