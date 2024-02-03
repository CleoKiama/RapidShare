import Transform from 'stream'

export default class ProcessPackets extends Transform { 
    constructor () {
        super()
    }
    _transform (chunk, encoding, callback) {
        this.push(chunk)
        callback()
    }
    _flush (callback) {
        callback()
    } 
   
}

const io = new ProcessPackets()
console.log(io.write)