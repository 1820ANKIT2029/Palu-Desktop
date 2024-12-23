import { SourceDeviceStateProps } from '@/hooks/useMediaSources'
import { useStudioSettings } from '@/hooks/useStudioSettings'

type Props = {
    state: SourceDeviceStateProps
    user: 
      |  ({
            subscription: {
                plan: 'FREE' | 'PRO'
            } | null
            studio: {
                id: string
                screen: string | null
                mic: string | null
                camera: string | null
                preset: 'HD' | 'SD'
                userId: string | null
            } | null
      } & {
        id: string
        email: string
        firstname: string | null
        lastname: string | null
        createdAt: Date
        clerkId: string
      }
    ) | null
}

const MediaConfiguration = ({user, state}: Props) => {
    const  {} = useStudioSettings()
  return (
    <form className='flex h-full relative w-full flex-col gap-y-5'>
        {}
    </form>
  )
}

export default MediaConfiguration