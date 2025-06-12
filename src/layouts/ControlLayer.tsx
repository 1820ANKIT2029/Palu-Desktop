import { cn, onCloseApp } from '@/lib/utils'
import { UserButton } from '@clerk/clerk-react'
import { X } from 'lucide-react'
import { useState } from 'react'

type Props = {
    children: React.ReactNode
    className?: string
}

const ControlLayer = ({children, className}: Props) => {
    const [isVisible, setIsVisible] = useState<boolean>(false)

    window.ipcRenderer.on('hide-plugin', (_, payload)=>{
        // console.log(event);
        setIsVisible(payload.state)
    })
    return (
        <div 
            className={cn(
                className, 
                isVisible && 'invisible', 
                'bg-[#171717] border-2 border-neutral-700 flex flex-col rounded-3xl h-full w-full'
            )}
        >
            <div className='flex justify-between items-center p-2 draggable h-[60px] mx-3'>
                <span className='non-draggable'>
                    <UserButton />
                </span>
                <X
                    size={20}
                    className='text-gray-400 non-draggable hover:text-white cursor-pointer'
                    onClick={onCloseApp}
                />
            </div>
            <div className='flex-1 overflow-auto min-h-0'>
                {children}
            </div>
            <div className='h-[60px] p-2 flex w-full'>
                <div className='w-full flex items-center justify-center gap-x-2'>
                    <img className='logo' src='palu-logo.svg' alt='app logo' />
                    <p className='text-white text-3xl'>Palu</p>
                </div>
            </div>
        </div>
    )
}

export default ControlLayer