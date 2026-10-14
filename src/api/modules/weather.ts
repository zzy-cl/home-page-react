/**
 * 获取高德地理位置信息
 */
export const getAdcode = async (key: string): Promise<AmapIpResult> => {
  const res = await fetch(`https://restapi.amap.com/v3/ip?key=${key}`)
  return await res.json()
}

/**
 * 获取高德地理天气信息
 */
export const getWeather = async (key: string, city: string): Promise<AmapWeatherResult> => {
  const res = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${city}`)
  return await res.json()
}

/**
 * 获取教书先生天气 API（备用）
 * https://api.oioweb.cn/doc/weather/GetWeather
 */
export const getOtherWeather = async (): Promise<OtherWeatherResult> => {
  const res = await fetch('https://api.oioweb.cn/api/weather/GetWeather')
  return await res.json()
}

// ---------- 类型定义 ----------

export interface AmapIpResult {
  status: string
  infocode: string
  province?: string | string[]
  city?: string | string[]
  adcode?: string | string[]
  rectangle?: string
}

export interface AmapWeatherResult {
  status: string
  infocode?: string
  lives?: Array<{
    province?: string
    city?: string
    adcode?: string
    weather?: string
    temperature?: string
    winddirection?: string
    windpower?: string
    humidity?: string
    reporttime?: string
  }>
}

export interface OtherWeatherResult {
  code?: number
  result?: {
    city?: { City?: string }
    condition?: {
      day_weather?: string
      min_degree?: string | number
      max_degree?: string | number
      day_wind_direction?: string
      day_wind_power?: string
    }
  }
}
