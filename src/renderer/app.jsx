import React  from 'react'
import Container from './components/container.jsx'
import Nav from './components/nav.jsx'
import Fallback from './components/fallback.jsx'
import { ErrorBoundary } from 'react-error-boundary'
import ThisDevice from './components/thisDevice.jsx'
import DiscoveredDevices from './components/discoveredDevices.jsx'


export default function App() {
           return (
        <ErrorBoundary fallbackRender={Fallback}>
            <main className="mx-auto mt-4 max-h-fit  w-[474px]  rounded-2xl bg-grey-200 px-6 py-4 ">
                <Container>
                    <header>
                        <h1>RapidShare</h1>
                    </header>
                    <Nav />
                    <ThisDevice  />   
                    <DiscoveredDevices  />
                </Container>
            </main>
        </ErrorBoundary>
    )
}
