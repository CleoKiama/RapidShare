import { networkInterfaces, platform } from "node:os";

const networkInterface = platform() === 'win32' ? 'Wi-Fi' : 'wlo1';

const getWifiAddress = () => {
  const interfaces = networkInterfaces();
  const regex = platform() === 'win32' ? /^Wi-Fi/ : /^wlo\d*/;
  const wifiInterfaces = Object.keys(interfaces).filter((key) => regex.test(key));
  let address = null;

  for (const key of wifiInterfaces) {
    for (const iface of interfaces[key]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        address = iface.address;
        break;
      }
    }
    if (address) break;
  }

  console.log("returning from wifi", address)
  return address;
};

export const getEthernetAddress = () => {
  const interfaces = networkInterfaces();
  const regex = platform() === 'win32' ? /^Ethernet/ : /^en.*/;
  const ethInterfaces = Object.keys(interfaces).filter((key) => regex.test(key));
  let address = null

  for (const key of ethInterfaces) {
    for (const iface of interfaces[key]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        address = iface.address;
        break;
      }
    }
    if (address) break;
  }
  console.log("returning from ethernet", address)
  return address
};


export function MonitorNetwork(callback) {
  const monitorInterval = setInterval(() => {
    if (networkInterfaces()[networkInterface]) {
      clearInterval(monitorInterval)
      const addr = thisMachineAddress()
      callback(addr)
    }
  }, 4000)
}


export default function thisMachineAddress() {
  return getEthernetAddress() || getWifiAddress()
}



