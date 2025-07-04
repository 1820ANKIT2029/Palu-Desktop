import { useEffect, useRef } from 'react'

const WebCam = () => {
    const camElement = useRef<HTMLVideoElement>(null)

    const streamWebCam = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
        })

        if(camElement.current){
            camElement.current.srcObject = stream
            await camElement.current.play()
        }
    }

    useEffect(() => {
        streamWebCam()
    }, [])

    return (
        <div className="inline-block overflow-hidden rounded-full">
            <video
                ref={camElement}
                className='h-screen draggable object-cover rounded-full 
                    aspect-video border-2 border-violet-950 
                    relative'
            >

            </video>
        </div>
    )
}

export default WebCam