import { Server } from "socket.io";
import { createServer } from "http";
import c from "ansi-colors";

const hostName = "localhost";
const port = 3000;
const httpServer = createServer();

export const io = new Server(httpServer);

io.on("connection", (socket) => {
   socket.emit('message','hello there client',(response)=>{
       console.log(c.green(`response from client: ${response}`))
   })
});

httpServer.listen({
  host: hostName,
  port: port,
});


