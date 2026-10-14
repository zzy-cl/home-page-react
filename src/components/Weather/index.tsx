import { useEffect, useState } from 'react'
import { getAdcode, getWeather, getOtherWeather } from '@/api'
import { notice } from '@/utils/notice'
import './index.css'

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_KEY
const DEFAULT_CITY = '未知地区'

interface WeatherInfo {
  weather: string
  temperature: string | number
  winddirection: string
  windpower: string
}

interface WeatherData {
  city: string
  weather: WeatherInfo
}

// 格式化风向
const formatWindDirection = (direction: string) => {
  if (!direction) return ''
  return direction.endsWith('风') ? direction : `${direction}风`
}

// 计算温度平均值
const calculateTemperatureAverage = (min: string | number, max: string | number) => {
  try {
    const minTemp = Number(min)
    const maxTemp = Number(max)
    if (isNaN(minTemp) || isNaN(maxTemp)) {
      throw new Error('无效的温度值')
    }
    return Math.round((minTemp + maxTemp) / 2)
  } catch (error) {
    console.error('计算温度出现错误：', error)
    return 'N/A'
  }
}

// 获取天气数据（主接口为高德，Key 未配置时走备用接口）
const fetchWeatherData = async (): Promise<WeatherData> => {
  if (!WEATHER_API_KEY) {
    console.log('未配置主天气API，使用备用接口')
    const result = await getOtherWeather()
    if (!result?.result) throw new Error('备用接口返回格式异常')
    const data = result.result
    return {
      city: data.city?.City || DEFAULT_CITY,
      weather: {
        weather: data.condition?.day_weather || '',
        temperature: calculateTemperatureAverage(
          data.condition?.min_degree || 0,
          data.condition?.max_degree || 0,
        ),
        winddirection: data.condition?.day_wind_direction || '',
        windpower: data.condition?.day_wind_power || '',
      },
    }
  }

  // 使用高德主接口
  const adCodeResult = await getAdcode(WEATHER_API_KEY)
  if (adCodeResult.infocode !== '10000') {
    throw new Error('地区查询失败')
  }
  const city = (Array.isArray(adCodeResult.city) ? adCodeResult.city[0] : adCodeResult.city) || DEFAULT_CITY
  const adcode = (Array.isArray(adCodeResult.adcode) ? adCodeResult.adcode[0] : adCodeResult.adcode) ?? ''

  const weatherResult = await getWeather(WEATHER_API_KEY, adcode)
  const liveData = weatherResult.lives?.[0] || {}

  return {
    city,
    weather: {
      weather: liveData.weather || '',
      temperature: liveData.temperature || '',
      winddirection: liveData.winddirection || '',
      windpower: liveData.windpower || '',
    },
  }
}

export default function Weather() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)

  useEffect(() => {
    fetchWeatherData()
      .then(setWeatherData)
      .catch((error: unknown) => {
        const msg = `天气信息获取失败: ${error instanceof Error ? error.message : error}`
        notice()?.open({ content: msg })
        console.error(`天气模块错误: ${msg}`)
      })
  }, [])

  const showWeather =
    weatherData && weatherData.city && weatherData.weather.weather ? weatherData : null

  return (
    <div className="weather">
      {showWeather ? (
        <>
          {/* 间距由 .weather 的 gap 提供，不再使用 &nbsp; */}
          <span>{showWeather.city}</span>
          <span>{showWeather.weather.weather}</span>
          <span>{showWeather.weather.temperature}℃</span>
          <span className="sm-hidden">{formatWindDirection(showWeather.weather.winddirection)}</span>
          <span className="sm-hidden">{showWeather.weather.windpower} 级</span>
        </>
      ) : (
        <span>天气数据获取失败</span>
      )}
    </div>
  )
}
