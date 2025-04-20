import { OnStopReconding, selectSources, StartRecording } from "@/lib/recorder"
import { cn, resizeWindow, videoRecordingTime } from "@/lib/utils"
import { Cast, Pause, Square } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const StudioTray = () => {
    let initialTime = new Date()

    const [iconSize, setIconSize] = useState(32);

    const [preview, setPreview] = useState(false)
    const [onTimer, setOnTimer] = useState<string>('00:00:00')
    const [count, setCount] = useState(0)

    const [recording, setRecording] = useState(false)
    const [onSources, setOnSources] = useState<
        | {
            screen: string
            id: string
            audio: string
            preset: 'HD' | 'SD'
            plan: 'PRO' | 'FREE'
        } | undefined
    >(undefined)

    const clearTime = () => {
        setOnTimer('00:00:00')
        setCount(0)
    }

    const videoElement = useRef<HTMLVideoElement | null>(null)

    useEffect(() => {
        const resizeWindowHelper = async () => {
            await resizeWindow(preview);
        }

        resizeWindowHelper();

        return () => resizeWindowHelper()
    }, [preview])

    window.ipcRenderer.on('profile-recieved', (_, payload) => {
        setOnSources(payload)
    })

    useEffect(() => {
        if (onSources && onSources.screen) selectSources(onSources, videoElement)
        return () => {
            selectSources(onSources!, videoElement)
        }
    }, [onSources])

    useEffect(() => {
        if (!recording) return
        const recondTimeInterval = setInterval(() => {
            const time = count + (new Date().getTime() - initialTime.getTime())
            setCount(time)
            const recondTime = videoRecordingTime(time)
            if (onSources?.plan === 'FREE' && recondTime.minute == '05') {
                setRecording(false)
                clearTime()
                OnStopReconding()
            }
            setOnTimer(recondTime.length)
            if (time <= 0) {
                setOnTimer('00:00:00')
                clearInterval(recondTimeInterval)
            }
        }, 1)

        return () => clearInterval(recondTimeInterval)
    }, [recording])

    useEffect(() => {
        if(recording && !preview) {
            setIconSize(25);
        }
        else{
            setIconSize(32);
        }

    }, [recording, preview])

    return !onSources ? (
        <></>
    ) : (
        <div className="h-screen w-screen flex items-center justify-center draggable">
            <div className={cn(`grid ${preview ? 'grid-cols-4' : 'grid-cols-2'} gap-1 p-1 w-full h-full`)}>

                {/* Left Large Box */}
                {preview && (
                    <div className="col-span-2 h-full flex items-center justify-center">
                        <video
                            autoPlay
                            ref={videoElement}
                            className={cn("w-full h-7/10 bg-white border-2 object-cover")}
                        />
                    </div>
                )}

                {/* Right Column */}
                <div className="col-span-2 flex flex-col justify-between gap-2 h-full">
                    {/* Timer Box */}
                    
                    {(recording || preview) && (
                        <div className="h-1/2 flex items-center justify-around">
                            <span className="text-red-500 font-bold text-xl">
                                {onTimer}
                            </span>
                        </div>
                    )}
                    

                    {/* Controls Box */}
                    <div className={
                        cn(`border border-black ${(recording || preview) ? 'h-1/2':'h-full'} flex items-center rounded-full 
                        justify-around bg-[#171717] border-white/40 draggable`
                    )}>
                        {/* Record Button */}
                        <div
                            {...(onSources && {
                                onClick: () => {
                                    setRecording(true);
                                    StartRecording(onSources);
                                },
                            })}
                            className={cn(
                                "non-draggable rounded-full cursor-pointer relative hover:opacity-80",
                                recording ? "bg-red-500 w-6 h-6" : "bg-red-400 w-8 h-8"
                            )}
                        />

                        {/* Pause/Stop */}
                        <div>
                            {!recording ? (
                                <Pause
                                    className="non-draggable opacity-50"
                                    size={iconSize}
                                    fill="white"
                                    stroke="none"
                                />
                            ) : (
                                <Square
                                    size={iconSize}
                                    className="non-draggable cursor-pointer hover:scale-110 transform transition duration-150"
                                    fill="white"
                                    onClick={() => {
                                        setRecording(false);
                                        clearTime();
                                        OnStopReconding();
                                    }}
                                    stroke="white"
                                />
                            )}
                        </div>

                        {/* Cast */}
                        <div>
                            <Cast
                                onClick={() => setPreview((prev) => !prev)}
                                size={iconSize}
                                fill="white"
                                className="non-draggable cursor-pointer hover:opacity-60"
                                stroke="white"
                            />
                        </div>
                        {/* </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudioTray