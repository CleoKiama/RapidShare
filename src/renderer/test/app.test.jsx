import React from 'react'
import  {render} from "@testing-library/react"
import { EventEmitter } from "node:events"
import App from "../app.jsx"
import os from 'os'

 
test("renders the TransferFileProgress component on startTransfer",async ()=>{
   const transferMonitor  = new EventEmitter()
    setTimeout(()=>{
      transferMonitor.emit('transferStart',{
       eventid : "1234142jIJ$%"
    },true)
  },700)
  window.electron = { 
     on : (channel,callback) => {
        transferMonitor.on(channel,callback)
    },
    removeListener : (channel,callback) => {
      transferMonitor.removeListener(channel,callback)
    },
     this_device: async ()=>{
        return {
            type: os.type(),
            userInfo: os.userInfo(),
        }
    }
  }
   const {findByText}  = render(<App />)
    const statusMessage = await findByText(/sending files/,{
    timeout : 950
  })
    expect(statusMessage).toBeInTheDocument()
})