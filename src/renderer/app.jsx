import React, { useEffect, useState } from 'react'
import Container from './components/container.jsx'
import Nav from './components/nav.jsx'
import Device from './components/device.jsx'
import Fallback from './components/fallback.jsx'
import { ErrorBoundary } from 'react-error-boundary'
import Loader from './components/loader.jsx'
export default function App() {
    const [thisDevice, setThisDevice] = useState({})
    const [thisDeviceInfo, setThisDeviceInfo] = useState(false)
    useEffect(() => {
        if (thisDeviceInfo) return
        window.electron.this_device().then((device) => {
            setThisDevice(() => {
                return {
                    ...device,
                }
            })
            setThisDeviceInfo(true)
        })
    })
    if (thisDevice) {
        console.log(thisDevice)
    }
    return (
        <ErrorBoundary FallBackComponent={Fallback}>
            <main className="mx-auto mt-4 h-[534px] w-[474px]  rounded-2xl bg-grey-200 px-6 py-4 ">
                <Container>
                    <header>
                        <h1>RapidShare</h1>
                    </header>
                    <Nav />
                    {Object.keys(thisDevice).length === 0 ? (
                        <Loader />
                    ) : (
                        <Device
                            userName={thisDevice.userInfo.username}
                            isCurrentDevice={true}
                            platform={"Darwin"}
                        />
                    )}
                </Container>
            </main>
        </ErrorBoundary>
    )
}
