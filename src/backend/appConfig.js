import os from 'os'

export const config = {
  getDestinationPath: function() {
    const platform = os.platform()
    if (platform === 'win32') {
      const { username } = os.userInfo()
      return `C:\\Users\\cleop\\Downloads\\RapidShare`
    } else if (platform === 'linux') {
      const { username } = os.userInfo()
      return `/home/${username}/Downloads/RapidShare`
    } else if (platform === 'darwin') {
      const { username } = os.userInfo()
      return `/Users/${username}/Downloads/RapidShare`
    }
  },
}
