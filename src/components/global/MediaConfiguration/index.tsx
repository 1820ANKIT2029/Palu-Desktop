import { SourceDeviceStateProps } from '@/hooks/useMediaSources'
import { useStudioSettings } from '@/hooks/useStudioSettings'
import { Loader } from '../Loader'
import { Headphones, Monitor, Settings2 } from 'lucide-react'

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
        firstView: boolean
        image: string | null
      }
    ) | null
}

const MediaConfiguration = ({user, state}: Props) => {

  const activeScreen = state.displays?.find((screen)=> screen.id === user?.studio?.screen)
  const activeAudio = state.audioInputs?.find((device)=> device.deviceId === user?.studio?.mic)

  const  { isPending, onPreset, register } = useStudioSettings(
    user!.id,
    user?.studio?.screen || state?.displays?.[0]?.id,
    user?.studio?.mic || state?.audioInputs?.[0]?.deviceId,
    user?.studio?.preset,
    user?.subscription?.plan,
  )

  return (
    <form className='flex h-full relative w-full flex-col gap-y-2'>
      {isPending && (
        <div className='fixed z-50 w-full top-0 left-0 right-0 bottom-0 rounded-2xl h-full bg-black/80 flex
        justify-center items-center'>
          <Loader color='#fff' />
        </div>
      )}
      <div className='flex gap-x-5 justify-center items-center'>
        <Monitor
          fill='#575655'
          color='#575655'
          size={36}
        />
        <select
          {...register('screen')}
          className='outline-none cursor-pointer px-5 py-2 rounded-xl border-2 text-white border-[#575655]
          bg-transparent w-full'
        >
          {state.displays?.map((display, key) => (
            <option
              selected={activeScreen && activeScreen.id === display.id}
              value={display.id}
              className='bg-[#171717] cursor-pointer'
              key={key}
            >
              {display.name}
            </option>
          ))}
        </select>
      </div>
      <div className='flex gap-x-5 items-center justify-center'>
        <Headphones color='#575655' size={36} />
        <select
          {...register('audio')}
          className='outline-none cursor-pointer px-5 py-2 rounded-xl border-2 text-white border-[#575655]
          bg-transparent w-full'
        >
          {state.audioInputs?.map((display, key) => (
            <option
              selected={activeAudio && activeAudio.deviceId === display.deviceId}
              value={display.deviceId}
              className='bg-[#171717] cursor-pointer'
              key={key}
            >
              {display.label}
            </option>
          ))}
        </select>
      </div>
      <div className='flex gap-x-5 items-center justify-center'>
        <Settings2 color='#575655' size={36} />
        <select
          {...register('preset')}
          className='outline-none cursor-pointer px-5 py-2 rounded-xl border-2 text-white border-[#575655]
          bg-transparent w-full'
        >
          <option
            disabled={user?.subscription?.plan === 'FREE'}
            selected={onPreset === 'HD' && user?.studio?.preset === 'HD'}
            value={'HD'}
            className='bg-[#171717] cursor-pointer'
          >
            1080p{' '}
            {user?.subscription?.plan === 'FREE' && '(Upgrade to PRO plan)'}
          </option>
          <option
            selected={onPreset === 'SD' && user?.studio?.preset === 'SD'}
            value={'SD'}
            className='bg-[#171717] cursor-pointer'
          >
            720p
          </option>
        </select>
      </div>
    </form>
  )
}

export default MediaConfiguration