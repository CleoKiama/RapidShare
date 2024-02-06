import dgram from "dgram";
import c from "ansi-colors";
import { networkInterfaces, platform,userInfo } from "os";

export const server = dgram.createSocket("udp4");
const multicastAddress = "239.1.1.1";
const bindingPort = 8080
const thisMachineAddress = function () {
  if (platform() === "linux") {
    return networkInterfaces()["wlo1"][0].address;
  }

  return networkInterfaces()["Wi-Fi"][0].address;
};

server.on("error", (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.bind(bindingPort,() => {
  server.addMembership(multicastAddress);
  server.setMulticastTTL(128)
  server.setMulticastLoopback(true)
  let {address,port} = server.address()
  console.log(c.green(`server listening to multicast group on adr : ${address}  port : ${port}`));
});

server.on("message", (msg, rinfo) => {
  if (rinfo.address === thisMachineAddress()) return;
  console.log(c.blue(`received message from multicast: ${msg}`));
  console.log(c.yellow(`adr ${rinfo.address} : port => ${rinfo.port}`));
  console.log(c.magenta(`sending back a reply...`));
  const deviceDetails = JSON.stringify(userInfo());

  server.send(
    deviceDetails,
    rinfo.port,
    rinfo.address,
    (error) => {
      if (error) {
        console.error(c.red(`error echoing back a response  ${error.message}`));
      }
    }
  );
});
