import { hidePluginWindow } from "./utils"
import { v4 as uuid } from 'uuid'
import { io } from "socket.io-client"
// import { Stream } from "node:stream"

interface Source {
    screen: string
    audio: string
    id: string
    preset: 'HD' | 'SD'
}

let videoTransferFileName: string | undefined
let mediaRecorder: MediaRecorder
let userId: string

const socket = io(import.meta.env.VITE_SOCKET_URL as string)

export const StartRecording = (onSources: {
    screen: string
    audio: string
    id: string
}) => {
    hidePluginWindow(true)
    videoTransferFileName = `${uuid()}-${onSources?.id.slice(0, 8)}.webm`
    mediaRecorder.start(1000)
}

export const OnStopReconding = () => mediaRecorder.stop()

const stopRecording = () => {
    hidePluginWindow(false);
    socket.emit('process-video', {
        filename: videoTransferFileName,
        userId
    })
}

export const OnDataAvailable = (e: BlobEvent) => {
    socket.emit("video-chunks", {
        chunks: e.data,
        filename: videoTransferFileName,
    })
}

export const selectSources = async (
    onSources: Source,
    videoElement: React.RefObject<HTMLVideoElement>
) => {
    if(onSources && onSources.screen && onSources.audio && onSources.id){
        const videoConstraints: any = {
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: onSources?.screen,
                    minWidth: onSources.preset === 'HD' ? 1920 : 1280,
                    maxWidth: onSources.preset === 'HD' ? 1920 : 1280,
                    minHeight: onSources.preset === 'HD' ? 1080: 720,
                    maxHeight: onSources.preset === 'HD' ? 1080: 720,
                    frameRate: 30,
                },
            },
        };
          
        const audioConstraints = onSources?.audio ? {
            deviceId: { exact: onSources.audio },
        } : false;

        

        userId = onSources.id

        try {
            const videoStream = await navigator.mediaDevices.getUserMedia(videoConstraints)
          
            const audioStream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: audioConstraints,
            })

            const combinedStream = new MediaStream([
                ...videoStream.getVideoTracks(),
                ...audioStream.getAudioTracks()
            ]);
            
            if (videoElement && videoElement.current) {
              videoElement.current.srcObject = videoStream;
              await videoElement.current.play();
            }
          
            mediaRecorder = new MediaRecorder(combinedStream, {
              mimeType: 'video/webm; codecs=vp9',
            });
          
            mediaRecorder.ondataavailable = OnDataAvailable;
            mediaRecorder.onstop = stopRecording;
          
        } catch (error) {
            console.error("Error accessing media devices:", error);
            alert("Could not access selected media devices.");
        }
    }
}