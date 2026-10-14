import { useEffect, useRef, useState } from 'react'
import { useMainStore } from '@/store'
import { notice } from '@/utils/notice'
import Spinner from '../Spinner'
import './index.css'

// 常量配置
const IMAGE_COUNT = 2 // 本地壁纸数量
const LOAD_DELAY_MIN = 100 // 最小加载延迟
const LOAD_DELAY_MAX = 200 // 最大加载延迟

// 壁纸源映射
const wallpaperSources: Record<string, () => string> = {
  '0': () => `/images/background${Math.floor(Math.random() * IMAGE_COUNT) + 1}.jpg`,
  '1': () => 'https://api.dujin.org/bing/1920.php',
  '2': () => 'https://api.vvhan.com/api/wallpaper/views',
  '3': () => 'https://api.vvhan.com/api/wallpaper/acg',
}

interface BackgroundProps {
  /** 首张壁纸入场动画结束后回调（用于触发问候语、默哀模式） */
  onLoadComplete?: () => void
}

export default function Background({ onLoadComplete }: BackgroundProps) {
  const imgLoadStatus = useMainStore((s) => s.imgLoadStatus)
  const coverType = useMainStore((s) => s.coverType)
  const backgroundShow = useMainStore((s) => s.backgroundShow)
  const setImgLoadStatus = useMainStore((s) => s.setImgLoadStatus)

  const [bg, setBg] = useState(() => ({
    type: coverType,
    url: (wallpaperSources[coverType] ?? wallpaperSources['0'])(),
  }))
  const imgTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const errorHandled = useRef(false)

  // 壁纸类型变化时重新取图（渲染期调整 state，React 官方推荐模式）
  if (bg.type !== coverType) {
    setBg({ type: coverType, url: (wallpaperSources[coverType] ?? wallpaperSources['0'])() })
  }
  const bgUrl = bg.url

  // 图片加载完成处理：随机延迟后标记加载完成
  const handleImgLoad = () => {
    if (imgTimeout.current) {
      clearTimeout(imgTimeout.current)
    }
    imgTimeout.current = setTimeout(() => {
      setImgLoadStatus(true)
    }, Math.floor(Math.random() * (LOAD_DELAY_MAX - LOAD_DELAY_MIN + 1)) + LOAD_DELAY_MIN)
  }

  // 图片加载失败处理（仅首次生效，与原 @error.once 一致）：回退到本地随机壁纸
  const handleImgError = () => {
    if (errorHandled.current) return
    errorHandled.current = true
    console.error('壁纸加载失败：', bgUrl)
    notice()?.open({ content: '壁纸加载失败，已临时切换回默认' })
    setBg({ type: bg.type, url: wallpaperSources['0']() })
  }

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (imgTimeout.current) clearTimeout(imgTimeout.current)
    }
  }, [])

  return (
    <div className={`cover${backgroundShow ? ' show' : ''}`}>
      <img
        src={bgUrl}
        className="bg"
        alt="cover"
        style={{ display: imgLoadStatus ? 'block' : 'none' }}
        onLoad={handleImgLoad}
        onError={handleImgError}
        onAnimationEnd={onLoadComplete}
      />
      {imgLoadStatus ? null : (
        <div className="spinner-container">
          <Spinner size="large" color="#fff" />
        </div>
      )}
      <div className={`gray${backgroundShow ? ' g-hidden' : ''}`} />
      {backgroundShow && coverType !== '3' && (
        <a className="down" href={bgUrl} target="_blank" rel="noopener noreferrer">
          下载壁纸
        </a>
      )}
    </div>
  )
}
