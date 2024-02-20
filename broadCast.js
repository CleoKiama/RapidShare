import dgram from "dgram";
import { userInfo } from "os";
import c from "ansi-colors";
import { clearInterval } from "timers";
import thisMachineAddress from "./currentAssignedAddress.js";
import EventEmitter from "events";
import {bindingPort as multicastAdrPort ,multicastAddress } from './multicastListener.js'
export const deviceDiscovery = new EventEmitter();

const udpSocket = dgram.createSocket("udp4");


//const port = 4000;
const foundDevices = new Map();

udpSocket.on("error", (error) => {
  console.error(error.message);
  udpSocket.close();
  process.exit(1);
});
function sendUserData() {
  const user = JSON.stringify(userInfo());
  udpSocket.send(user, multicastAdrPort, multicastAddress, (error) => {
    if (error) {
      throw error;
    }
    
  });
}
function broadCastDevice() {
  const broadCastInterval = setInterval(() => {
    if (foundDevices.size > 0) {
      clearInterval(broadCastInterval);
      
      return setTimeout(() => {
        udpSocket.close();
      },1500);
    }
    sendUserData();
  }, 2000);
 
}

udpSocket.bind((error) => {
  if (error) {
    console.error(error.message);
    udpSocket.close();
  }
  udpSocket.addMembership(multicastAddress);
  const { address, port } = udpSocket.address();
  console.log(c.green(`broadCaster is listening on ${address}:${port}`));
  broadCastDevice();
});

udpSocket.on("message", (msg, rinfo) => {
  if (rinfo.address === thisMachineAddress()) return;
  const clientPort = 3000
  const deviceFound = JSON.parse(msg.toString());
  const deviceFoundInfo = {
    ...deviceFound,
    address : rinfo.address,
    port : clientPort
  }
  console.log(c.yellow(`broadCaster received message from device below .. `));
  console.log(deviceFoundInfo)
  
  foundDevices.set(rinfo.address,deviceFoundInfo);
  deviceDiscovery.emit("deviceFound",deviceFoundInfo);
});
