import crypto from 'crypto'
import fs from 'fs'
import { join } from 'path'
import FormData from 'form-data'
import axios from 'axios'
import { Agent } from 'https'
import fetch from 'electron-fetch'
import { pipeline } from 'stream'

export const ESTUARY_API_KEY = 'ESTdaeabaa9-1bf5-47ac-9c85-d159f4761f84ARY'

export async function createCollection() {
  const request = await fetch('https://api.estuary.tech/collections/create', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ESTUARY_API_KEY}`,
    },
    body: JSON.stringify({
      name: 'Discharge Data',
      description: 'A collection of data for a specific user of Discharge.',
    }),
  })
  return await request.json()
}

export async function getItems(userId: string, path: string) {
  const request = await fetch(
    `https://api.estuary.tech/collections/fs/list?col=${userId}&dir=${path}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ESTUARY_API_KEY}`,
      },
    }
  )
  return await request.json()
}

export async function readItem(file: any, path: string) {
  const res = await fetch(`https://dweb.link/ipfs/${file.cid}`)
  const dest = fs.createWriteStream(join(path, file.name))
  const data = res.body as fs.ReadStream
  const pipe = pipeline(data, dest, (err: any) => console.error(err))
  await new Promise(fulfill => pipe.on('finish', fulfill))
  return join(path, file.name)
}

export async function deleteItem(userId: string, file: any) {
  await fetch(
    `https://api.estuary.tech/collections/fs/add?col=${userId}&content=${file.contId}&path=/${userId}/${file.name}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ESTUARY_API_KEY}`,
      },
    }
  )
}

export async function uploadFile(
  userId: string,
  file: string,
  path: string,
  onprogress: null | ((event: ProgressEvent) => void)
) {
  try {
    const items = await getItems(userId, path.replace(/\\/g, '%2F'))
    if (items !== null) return
    const form = new FormData()
    form.append('data', fs.createReadStream(file))
    await axios.post(
      `https://shuttle-4.estuary.tech/content/add?collection=${userId}&collectionPath=${path.replace(
        /\\/g,
        '/'
      )}`,
      form,
      {
        httpsAgent: new Agent({
          rejectUnauthorized: false,
        }),
        headers: {
          Authorization: `Bearer ${ESTUARY_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onprogress ? onprogress : () => {},
      }
    )
  } catch (error) {
    console.error(error)
  }
}

const IV_LENGTH = 16

export async function encrypt(path: string, key: string, out: string) {
  const name = path.substring(path.lastIndexOf('\\') + 1)
  const bytes =
    key.length >= 32
      ? Buffer.from(key).slice(0, 32)
      : Buffer.from(key).slice(0, key.length) + '-'.repeat(32 - key.length)
  if (bytes.length != 32)
    throw new Error('Encryption key is unstable in estuary.ts: encrypt()')
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', bytes, iv)
  const input = fs.createReadStream(path)
  const output = fs.createWriteStream(join(out, name + '.enc'))
  await new Promise((fulfill, reject) =>
    output.write(iv, (err: any) => {
      if (err) reject(err)
      else fulfill(null)
    })
  )
  const pipe = pipeline(input, cipher, output, (err: any) => console.error(err))
  await new Promise(fulfill => pipe.on('finish', fulfill))
  return join(out, name + '.enc')
}

export async function decrypt(path: string, key: string, out: string) {
  const name = path.substring(path.lastIndexOf('\\') + 1)
  const bytes =
    key.length >= 32
      ? Buffer.from(key).slice(0, 32)
      : Buffer.from(key).slice(0, key.length) + '-'.repeat(32 - key.length)
  if (bytes.length != 32)
    throw new Error('Encryption key is unstable in estuary.ts: decrypt()')
  const chunks = []
  for await (let chunk of fs.createReadStream(path, { start: 0, end: 15 }))
    chunks.push(chunk)
  const iv = Buffer.concat(chunks)
  const input = fs.createReadStream(path, { start: 16 })
  const output = fs.createWriteStream(join(out, name.slice(0, name.length - 4)))
  const cipher = crypto.createDecipheriv('aes-256-cbc', bytes, iv)
  const pipe = pipeline(input, cipher, output, (err: any) => console.error(err))
  await new Promise(fulfill => pipe.on('finish', fulfill))
  return join(out, name.slice(0, name.length - 4))
}
