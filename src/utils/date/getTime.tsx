import { SpaCandle } from '@icon-park/react'
import { notice } from '../notice'
import dayjs from 'dayjs'

// 常量定义
const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const SPECIAL_DATES: Record<string, string> = {
  '4.4': '清明节',
  '5.12': '汶川大地震纪念日',
  '7.7': '中国人民抗日战争纪念日',
  '9.18': '九·一八事变纪念日',
  '12.13': '南京大屠杀死难者国家公祭日',
}

/**
 * 获取当前时间信息
 */
export const getCurrentTime = () => {
  const now = dayjs()

  return {
    year: now.year(),
    month: String(now.month() + 1).padStart(2, '0'),
    day: String(now.date()).padStart(2, '0'),
    hour: String(now.hour()).padStart(2, '0'),
    minute: String(now.minute()).padStart(2, '0'),
    second: String(now.second()).padStart(2, '0'),
    weekday: WEEKDAYS[now.day()],
  }
}

export interface TimeProgress {
  name: string
  total: number
  passed: number
  remaining: number
  percentage: string
}

/**
 * 计算时光胶囊数据（日 / 周 / 月 / 年）
 */
export const getTimeProgressData = (): Record<'day' | 'week' | 'month' | 'year', TimeProgress> => {
  const now = dayjs()
  const timeLabels: Record<'day' | 'week' | 'month' | 'year', string> = {
    day: '今日',
    week: '本周',
    month: '本月',
    year: '本年',
  }

  const calculateProgress = (unit: 'day' | 'week' | 'month' | 'year'): TimeProgress => {
    const start = now.startOf(unit)
    const end = now.endOf(unit)
    const measureUnit = unit === 'day' ? 'hour' : 'day'

    const total = end.diff(start, measureUnit) + 1
    let passed = now.diff(start, measureUnit)

    // 特殊处理周进度计算
    if (unit === 'week') {
      passed = (passed + 6) % 7
    }

    const remaining = total - passed
    const percentage = (passed / total) * 100

    return {
      name: timeLabels[unit],
      total,
      passed,
      remaining,
      percentage: percentage.toFixed(2),
    }
  }

  return {
    day: calculateProgress('day'),
    week: calculateProgress('week'),
    month: calculateProgress('month'),
    year: calculateProgress('year'),
  }
}

/**
 * 根据当前时间生成问候语
 */
export const showGreetingMessage = () => {
  const hour = dayjs().hour()

  const greeting =
    hour < 6
      ? '凌晨好'
      : hour < 9
        ? '早上好'
        : hour < 12
          ? '上午好'
          : hour < 14
            ? '中午好'
            : hour < 17
              ? '下午好'
              : hour < 19
                ? '傍晚好'
                : hour < 22
                  ? '晚上好'
                  : '夜深了'

  notice()?.open({
    content: (
      <>
        <strong>{greeting}</strong> 欢迎来到我的主页
      </>
    ),
  })
}

/**
 * 检查是否为特殊纪念日并启用默哀模式
 */
export const checkSpecialDates = () => {
  const now = dayjs()
  const key = `${now.month() + 1}.${now.date()}`

  if (Object.prototype.hasOwnProperty.call(SPECIAL_DATES, key)) {
    const holidayName = SPECIAL_DATES[key]
    console.log(`今天是${holidayName}`)

    // 添加灰度滤镜样式
    const styleElement = document.createElement('style')
    styleElement.innerHTML = 'html{filter: grayscale(100%)}'
    document.head.appendChild(styleElement)

    // 显示提示消息
    notice()?.open({
      content: `今天是${holidayName}`,
      duration: 14000,
      icon: <SpaCandle theme="filled" size={18} fill="#efefef" />,
    })
  }
}

/**
 * 计算网站运行时间统计
 */
export const calculateSiteUptime = (startDate: Date | string) => {
  const start = dayjs(startDate)
  const now = dayjs()

  let years = now.year() - start.year()
  let months = now.month() - start.month()
  let days = now.date() - start.date()

  // 处理日期不足的情况
  if (days < 0) {
    months--
    const lastMonth = now.subtract(1, 'month')
    days += lastMonth.daysInMonth()
  }

  if (months < 0) {
    years--
    months += 12
  }

  return `本站已经运行了 ${years} 年 ${months} 月 ${days} 天`
}
