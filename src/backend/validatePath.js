import {normalize,isAbsolute} from 'node:path'

export default function validatePath(path) {
    if(!path) throw new Error("path not provided")
    const normalizedPath = normalize (path)
    if(!isAbsolute(normalizedPath)) throw new Error("path must be an absolute path")
      
    return normalizedPath
}
