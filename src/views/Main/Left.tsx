import { useMainStore } from '@/store'
import Message from '@/components/Message'
import SocialLinks from '@/components/SocialLinks'
import './Left.css'

export default function Left() {
  const mobileOpenState = useMainStore((s) => s.mobileOpenState)

  return (
    <div className={`main-left${mobileOpenState ? ' g-hidden' : ''}`}>
      <Message />
      <SocialLinks />
    </div>
  )
}
