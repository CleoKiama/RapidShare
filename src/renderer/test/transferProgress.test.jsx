import React from 'react'
import { render } from '@testing-library/react'
import { EventEmitter } from "node:events"
import TransferProgress from '../components/transferProgress.jsx'
import { act } from "@testing-library/react"


test("transfer Progress updates the ui accordingly", async () => {
  const fileProgress = new EventEmitter()
  const onNavigateBack = jest.fn()
  window.electron = {
    on: (channel, callback) => {
      fileProgress.on(channel, callback)
    },
    removeListener: (channel, callback) => {
      fileProgress.removeListener(channel, callback)
    }
  }
  const { findByText } = render(
    <TransferProgress
      onNavigateBack={onNavigateBack}
    />)
  await act(async () => {
    fileProgress.emit('fileProgress', {
      eventid: "1234142jIJ$%"
    }, {
      percentageProgress: 50,
      bytesTransferred: "500mib"
    })

  })
  const pTag = await findByText("500mib", {
    timeout: 1000
  })
  expect(pTag).toBeInTheDocument()
})

