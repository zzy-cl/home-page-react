import { useEffect, useRef, useState } from 'react'
import { HourglassFull } from '@icon-park/react'
import { getTimeProgressData, calculateSiteUptime } from '@/utils/date'
import type { TimeProgress } from '@/utils/date'
import { useMainStore } from '@/store'
import './index.css'

type TimeData = Record<'day' | 'week' | 'month' | 'year', TimeProgress>

export default function TimeCapsule() {
  const siteStartShow = useMainStore((s) => s.siteStartShow)

  const [timeData, setTimeData] = useState<TimeData>(() => getTimeProgressData())
  const [startDateText, setStartDateText] = useState<string | null>(null)
  const timeInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const startDate = import.meta.env.VITE_SITE_START

  useEffect(() => {
    const updateTimeData = () => {
      setTimeData(getTimeProgressData())
      if (startDate) {
        try {
          setStartDateText(calculateSiteUptime(new Date(startDate)))
        } catch (error) {
          console.error('计算站点运行时间失败:', error)
          setStartDateText('站点运行时间计算失败')
        }
      }
    }
    updateTimeData()
    timeInterval.current = setInterval(updateTimeData, 1000)
    return () => {
      if (timeInterval.current) {
        clearInterval(timeInterval.current)
        timeInterval.current = null
      }
    }
  }, [startDate])

  return (
    <div className="time-capsule">
      <div className="title">
        <HourglassFull theme="two-tone" size={24} fill={['#efefef', '#00000020']} />
        <span>时光胶囊</span>
      </div>
      {timeData && (
        <div className="all-capsule">
          {(
            [
              ['day', '小时'],
              ['week', '天'],
              ['month', '天'],
              ['year', '天'],
            ] as const
          ).map(([tag, unit]) => {
            const item = timeData[tag]
            return (
              <div key={tag} className="capsule-item">
                <div className="item-title">
                  <span className="percentage">
                    {item.name}已度过<strong>{item.passed}</strong>
                    {unit}
                  </span>
                  <span className="remaining">
                    剩余&nbsp;{item.remaining}&nbsp;{unit}
                  </span>
                </div>
                {/* 进度条（原 el-progress，纯 CSS 实现） */}
                <div className="progress-track">
                  <div className="progress-inner" style={{ width: `${item.percentage}%` }}>
                    <span className="progress-text">{item.percentage}%</span>
                  </div>
                </div>
              </div>
            )
          })}
          {/* 建站日期 */}
          {siteStartShow && startDateText && (
            <div className="capsule-item start">
              <div className="item-title">{startDateText}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
