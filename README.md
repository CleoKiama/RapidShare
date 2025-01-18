# RapidShare

A lightweight, secure desktop application for rapid peer-to-peer file sharing over local networks. Built with Electron.

## Features

- Fast peer-to-peer file transfers over local network
- No file size limits
- Simple, intuitive interface
- No internet connection required
- Secure local network transfers
- Cross-platform support (Windows, macOS, Linux)
- Real-time transfer progress monitoring
- Automatic peer discovery on local network

## Prerequisites

- Both sender and receiver must have RapidShare installed
- Computers must be connected to the same local network
- Supported operating systems:
  - Windows 10 or later
  - macOS 10.13 or later
  - Linux (major distributions)

## Installation

1. Download the latest release for your operating system from the releases page
2. Run the installer
3. Follow the on-screen instructions to complete installation

## Usage

1. Launch RapidShare on both computers
2. The app will automatically discover other RapidShare instances on the local network
3. Select the target device from the "Devices" list
4. Choose files to send using the file picker or drag-and-drop
5. Monitor transfer progress in real-time

## Security

- All transfers are encrypted end-to-end
- Files are transferred directly between devices without intermediate servers
- No data is stored or transmitted outside your local network

## Troubleshooting

Common issues and solutions:

1. Devices not discovering each other:

   - Ensure both devices are on the same network
   - Check if firewall is blocking the application
   - Verify network discovery settings are enabled

2. Transfer speeds are slow:
   - Check network connection quality
   - Ensure no bandwidth-heavy applications are running
   - Consider switching to a wired connection

## Development

### Requirements

- Node.js 16.x or later
- npm or yarn
- Electron

### Setup

```bash
# Clone the repository
git clone https://github.com/CleoKiama/RapidShare
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

## Contributing

Contributions are welcome!

## License

- MIT

## Support

- Submit issues through the GitHub issue tracker

