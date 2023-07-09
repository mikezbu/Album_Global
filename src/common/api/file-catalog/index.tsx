//the purpose of this code is to create a file catalog, purging expired file catalogs, uploading, and deleting files.

import { destroy, post, put } from 'src/util/request/RequestHelper' //imports three functions "destroy, post, put"

const path = '/file-catalog'

export function createFileCatalog(body: any, callback: any) { //sends a HTTP Post request with provided 'body' and 'callback' as arguments. A HTTP Post sends data to a server.
  return post(`${path}`, body, callback)
}

export function purgeExpiredFileCatalog(callback: any) { //sends a HTTP Delete request with provided 'callback'
  return destroy(`${path}`, callback)
}

export function uploadFile(requestUrl: string, file: File, fileIsPublic: boolean, callback: any) {
  const headers = {
    'Content-Type': file.type,
  }

  if (fileIsPublic) {
    headers['x-amz-acl'] = 'public-read' //x-amz-acl is used within AWS S3 to grant public access to uploaded file
  }

  return put(requestUrl, file, callback, false, {
    headers,
    timeout: 0,
  })
}

export function deleteFile(requestUrl: string, fileId: number, callback: any) {
  destroy(requestUrl, callback, false) //false means that it is synchronous, function will wait for the request before returning
}

export enum FileType {
  NA = 0,
  Images = 1,
  Sample = 2,
  Track = 3,
}
