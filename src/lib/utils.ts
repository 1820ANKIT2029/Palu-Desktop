import axios from "axios"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const HttpsClient = axios.create({
  baseURL: import.meta.env.VITE_HOST_URL,
})

export const onCloseApp = () => window.ipcRenderer.send('closeApp')

export const fetchUserProfile = async (clerkId:string) => {
  const response = await HttpsClient.get(`/auth/${clerkId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // console.log(response.data)

  return response.data
}

export const getMediaSources = async () => {
  const displays = await window.ipcRenderer.invoke('getSources')
  const enumerateDevices = await window.navigator.mediaDevices.enumerateDevices()
  const audioInputs = enumerateDevices.filter(
    (device) => device.kind === 'audioinput'
  )

  window.ipcRenderer.send(
    'debug', 
    'getMediaSources', 
    {
      "Display": JSON.stringify(displays, null, 2),
      "EnumerateDevice": JSON.stringify(enumerateDevices, null, 2),
      "AudioInput": JSON.stringify(audioInputs, null, 2)
    }
  )

  return { displays, audio: audioInputs }
}

export const updateStudioSettings = async (
  id: string,
  screen: string,
  audio: string,
  preset: 'HD' | 'SD'
) => {
  const response = await HttpsClient.post(
    `/studio/${id}`,
    {
      screen,
      audio,
      preset,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

  return response.data
}

export const hidePluginWindow = (state: boolean) => {
  window.ipcRenderer.send('hide-plugin', { state })
}

export const videoRecordingTime = (ms: number) => {
  const second = Math.floor((ms/1000) % 60).toString().padStart(2, '0')
  const minute = Math.floor((ms/1000 /60) % 60).toString().padStart(2, '0')
  const hour = Math.floor((ms /1000 /60 /60) % 60).toString().padStart(2, '0')

  return { length: `${hour}:${minute}:${second}`,minute}
}

export const resizeWindow = async (shrink:boolean) => {
  window.ipcRenderer.send('resize-studio', { shrink })
}