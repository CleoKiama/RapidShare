import React from 'react'
import { act, render, } from '@testing-library/react'
import DiscoveredDevices from '../components/discoveredDevices.jsx'
import { EventEmitter } from 'node:events'

let foundDevices = {
  devices: [
    {
      uid: 1000,
      gid: 1000,
      username: 'cleo',
      homedir: '/home/cleo',
      shell: 'bin/bash',
      address: '192.168.0.103',
      port: 3000,
      platform: 'Linux',
    },
    {
      uid: 1001,
      gid: 1001,
      username: 'john',
      homedir: '/Users/john',
      shell: '/bin/zsh',
      address: '192.168.0.104',
      port: 4000,
      platform: 'Darwin',
    },
    {
      uid: 1002,
      gid: 1002,
      username: 'sarah',
      homedir: '/Users/sarah',
      shell: '/bin/bash',
      address: '192.168.0.105',
      port: 5000,
      platform: 'Darwin',
    },
    {
      uid: 1003,
      gid: 1003,
      username: 'bob',
      homedir: 'C:\\Users\\Bob',
      shell: 'C:\\Windows_NT\\System32\\cmd.exe',
      address: '192.168.0.106',
      port: 6000,
      platform: 'Windows_NT',
    },
    {
      uid: 1004,
      gid: 1004,
      username: 'emma',
      homedir: 'C:\\Users\\Emma',
      shell: 'C:\\Windows_NT\\System32\\cmd.exe',
      address: '192.168.0.107',
      port: 7000,
      platform: 'Windows_NT',
    },
    {
      uid: 1005,
      gid: 1005,
      username: 'alex',
      homedir: '/home/alex',
      shell: '/bin/bash',
      address: '192.168.0.108',
      port: 8000,
      platform: 'Linux',
    },
  ],
}

test('renders all the discovered devices', async () => {
  const device = new EventEmitter()
  window.electron = {
    on: (channel, callback) => {
      device.on(channel, callback)
    },
    removeListener: (channel, fn) => {
      device.removeListener(channel, fn)
    },
    async invoke() {
      return foundDevices
    }
  }
  const { findAllByAltText } = render(<DiscoveredDevices />)
  await act(async () => {
    device.emit(
      'updateDevices',
      {
        eventId: '79374375835730',
      },
      foundDevices
    )
  })
  const deviceLogos = await findAllByAltText(/platform/i)
  deviceLogos.forEach((img, index) => {
    expect(img).toHaveAttribute(
      'src',
      `static://assets/${foundDevices.devices[index].platform}_logo.svg`
    )
  })
  expect(deviceLogos).toHaveLength(foundDevices.devices.length)
})

test('updates when a device goes offline', async () => {
  const device = new EventEmitter()
  var onlineDevices = { devices: [] }
  window.electron = {
    on: (channel, callback) => {
      device.on(channel, callback)
    },
    removeListener: (channel, fn) => {
      device.removeListener(channel, fn)
    },
    async invoke() {
      return onlineDevices
    }
  }
  onlineDevices.devices = foundDevices.devices.slice(0, 3)
  const { findAllByAltText } = render(<DiscoveredDevices />)
  await act(async () => {
    device.emit(
      'updateDevices',
      {
        eventId: '7@E70',
      },
      foundDevices
    )
  })
  await act(async () => {
    device.emit(
      'updateDevices',
      {
        eventId: '79374375835730',
      },
      onlineDevices
    )
  })
  const deviceLogos = await findAllByAltText(/platform/i)
  deviceLogos.forEach((img, index) => {
    expect(img).toHaveAttribute(
      'src',
      `static://assets/${onlineDevices.devices[index].platform}_logo.svg`
    )
  })
  expect(deviceLogos).toHaveLength(onlineDevices.devices.length)
})

