import { networkInterfaces, platform } from "os";

var getWifiAddress = () => {
  if (platform() === "linux") {
    return networkInterfaces()["wlo1"][0].address;
  } else return networkInterfaces()["Wi-Fi"][0].address;

}

const networkInterface = platform() === 'win32' ? 'Wi-Fi' : 'wlo1';


export function MonitorNetwork(callback) {
  const monitorInterval = setInterval(() => {
    if (networkInterfaces()[networkInterface]) {
      clearInterval(monitorInterval)
      let addr = networkInterfaces()[networkInterface][0].address
      callback(addr)
    }
  }, 4000)
}


export default function thisMachineAddress() {
  return getWifiAddress()
}


