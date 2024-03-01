import createMulticastListener from '../backend/multicastListener.js'
import c from 'ansi-colors'
import { broadCastUdp } from '../backend/broadCast.js'
import { deviceDiscovery } from '../backend/broadCast.js'
let multicastSocket
beforeEach(() => {
    multicastSocket = createMulticastListener()
})
afterEach(() => {
    multicastSocket.close()
})

test('jest is fine', async () => {
    deviceDiscovery.on('deviceFound', (foundDevices) => {
        console.log(foundDevices)
    })
    return new Promise((done) => {
        deviceDiscovery.on('end', () => {
            console.log(c.yellow(`device discovery ended`))
            console.log(c.blue(`ending the test now resolving the promise....`))
            done()
        })
    })
})
