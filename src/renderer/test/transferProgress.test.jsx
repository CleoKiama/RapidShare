import React from 'react'
import { render } from '@testing-library/react'
import { EventEmitter } from "node:events"
import TransferProgress from '../components/transferProgress.jsx'


test("transfer Progress updates the ui accordingly", async () => {
  const fileProgress = new EventEmitter()
  setTimeout(() => {
    fileProgress.emit('fileProgress', {
      eventid: "1234142jIJ$%"
    }, {
      percentageProgress: 50,
      bytesTransferred: "500mib"
    })
  }, 700)
  window.electron = {
    on: (channel, callback) => {
      fileProgress.on(channel, callback)
    },
    removeListener: (channel, callback) => {
      fileProgress.removeListener(channel, callback)
    }
  }
  const { findByText } = render(<TransferProgress />)
  const pTag = await findByText("500mib", {
    timeout: 1000
  })
  expect(pTag).toBeInTheDocument()
})

