import { createReadStream } from "fs";
import lazystream from "lazystream";

export default function createStreamSources(files) {
  const sources = [];
  for (const file of files) {
    sources.push(
      new lazystream.Readable(() => {
        return createReadStream(file);
      })
    );
  }

  return sources;
}


