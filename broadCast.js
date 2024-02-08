import dgram from "dgram";
import { userInfo } from "os";
import c from "ansi-colors";
import { clearInterval } from "timers";
import thisMachineAddress from "./currentAssignedAddress.js";
import EventEmitter from "events";

export const deviceDiscovery = new EventEmitter();

const udpSocket = dgram.createSocket("udp4");
const multicastAddress = "239.1.1.1";
const multicastAdrPort = 8080;
//const port = 4000;
const foundDevices = new Map();

udpSocket.on("error", (error) => {
  console.error(error.message);
  udpSocket.close();
  process.exit(1);
});
function sendUserData(callback) {
  const user = JSON.stringify(userInfo());
  udpSocket.send(user, multicastAdrPort, multicastAddress, (error) => {
    if (error) {
      if (typeof callback === "function") callback();
      throw error;
    }
    if (typeof callback === "function") callback();
    console.log(c.green("message sent"));
  });
}
function broadCastDevice() {
  const broadCastInterval = setInterval(() => {
    if (foundDevices.size > 0) {
      clearInterval(broadCastInterval);
      console.log(`found some devices`);
      return setTimeout(() => {
        udpSocket.close();
      }, 2000);
    }
    console.log(c.yellow("sending message"));
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
  console.log(c.green(`receiver is listening on ${address}:${port}`));
  broadCastDevice();
});

udpSocket.on("message", (msg, rinfo) => {
  if (rinfo.address === thisMachineAddress()) return;
  const deviceFound = JSON.parse(msg.toString());
  console.log(c.yellow(`received message from ${rinfo.address}`));
  foundDevices.set(rinfo.address, {
    port: rinfo.port,
    username: deviceFound.username,
  });
  deviceDiscovery.emit("deviceFound", rinfo.address, deviceFound.username);
});
