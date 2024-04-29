import React, { useEffect, useState } from 'react'
import Container from './components/container.jsx'
import Nav from './components/nav.jsx'
import Fallback from './components/fallback.jsx'
import { ErrorBoundary } from 'react-error-boundary'
import ThisDevice from './components/thisDevice.jsx'
import DiscoveredDevices from './components/discoveredDevices.jsx'
import TransferProgress from './components/transferProgress.jsx'


export default function App() {
  const [transferStart, setTransferStart] = useState(false)
  useEffect(() => {
    const listener = (_, status) => {
      setTransferStart(status)
    }
    window.electron.on('transferring', listener)
    return () => {
      window.electron.removeListener('transferring', listener)
    }
  }, [])
  const HandleNavigationBack = () => {
    setTransferStart(false)
  }
  return (
    <ErrorBoundary fallbackRender={Fallback}>
      <main className="mx-auto mt-4 max-h-fit  w-[474px]  rounded-2xl bg-grey-200 px-6 py-4 ">
        <Container>
          <header>
            <h1>RapidShare</h1>
          </header>
          <Nav />
          {
            transferStart ?
              <TransferProgress
                onNavigateBack={HandleNavigationBack}
              />
              :
              <div>
                <ThisDevice />
                <DiscoveredDevices />
              </div>
          }
        </Container>
      </main>
    </ErrorBoundary>
  )
}
