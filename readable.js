import { Readable } from "node:stream";

async function* generate() {
  yield ["hello", "master", "cleo"];
  yield "streams";
  yield ["hello", "master", "cleo"];
  yield ["hello", "master", "cleo"];
  yield ["hello", "master", "cleo"];
  yield ["hello", "master", "cleo"];
}

const readable = Readable.from(generate());
let running = 0;
readable.on("readable", () => {
  console.log(`running readable ${++running}`);
  let chunk;
  while (( chunk = readable.read()) !== null) {
    console.log(chunk);
  }
});
