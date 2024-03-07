import createMulticastListener from './multicastListener.js'
import startBroadCaster from './broadCast.js'
import DeviceStatusUpdater from './deviceStatusUpdater.js'
import RestartBroadCaster  from './restartBroadCaster.js'

export default function Main() {
    try {
        createMulticastListener()
        startBroadCaster()
        DeviceStatusUpdater()
        RestartBroadCaster()
          } catch (error) {
        console.log(`something went wrong in the backend ${error.message}`)
    }
}
