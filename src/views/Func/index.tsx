import { useEffect, useRef, useState, memo } from 'react'
import { getCurrentTime } from '@/utils/date'
import Hitokoto from '@/components/Hitokoto'
import Music from '@/components/Music'
import Weather from '@/components/Weather'
import { useMainStore } from '@/store'
import './index.css'

const playerHasId = import.meta.env.VITE_SONG_ID

function Func() {
  const mobileFuncState = useMainStore((s) => s.mobileFuncState)

  // 当前时间
  const [currentTime, setCurrentTime] = useState<ReturnType<typeof getCurrentTime>>(
    () => getCurrentTime(),
  )
  const timeInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const updateTimeData = () => setCurrentTime(getCurrentTime())
    updateTimeData()
    timeInterval.current = setInterval(updateTimeData, 1000)
    return () => {
      if (timeInterval.current) clearInterval(timeInterval.current)
    }
  }, [])

  return (
    <div className={`function${mobileFuncState ? ' mobile' : ''}`}>
      <div className="col left-col">
        <Hitokoto />
        {playerHasId && <Music />}
      </div>
      <div className="col right-col cards">
        <div className="time">
          <div className="date">
            <span>{currentTime.year}&nbsp;年&nbsp;</span>
            <span>{currentTime.month}&nbsp;月&nbsp;</span>
            <span>{currentTime.day}&nbsp;日&nbsp;</span>
            <span className="sm-hidden">{currentTime.weekday}</span>
          </div>
          <div className="text">
            <span>
              {' '}
              {currentTime.hour}:{currentTime.minute}:{currentTime.second}
            </span>
          </div>
        </div>
        <Weather />
      </div>
    </div>
  )
}

export default memo(Func)
