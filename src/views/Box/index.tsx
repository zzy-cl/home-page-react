import { useState } from 'react'
import { CloseOne, SettingTwo } from '@icon-park/react'
import { useMainStore } from '@/store'
import TimeCapsule from '@/components/TimeCapsule'
import MoreContent from '@/components/MoreContent'
import './index.css'

export default function Box() {
  const setBoxOpenState = useMainStore((s) => s.setBoxOpenState)
  const setSetOpenState = useMainStore((s) => s.setSetOpenState)
  const [closeShow, setCloseShow] = useState(false)

  return (
    <div
      className="box cards"
      onMouseEnter={() => setCloseShow(true)}
      onMouseLeave={() => setCloseShow(false)}
    >
      {closeShow && (
        <>
          <CloseOne
            className="close"
            theme="filled"
            size={28}
            fill="#ffffff60"
            onClick={() => setBoxOpenState(false)}
          />
          <SettingTwo
            className="setting"
            theme="filled"
            size={28}
            fill="#ffffff60"
            onClick={() => setSetOpenState(true)}
          />
        </>
      )}
      <div className="content">
        {/* 可在此处自定义任意内容 */}
        <TimeCapsule />
        <MoreContent />
      </div>
    </div>
  )
}
