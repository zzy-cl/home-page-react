import { useMainStore } from '@/store'
import './index.css'

const siteName = import.meta.env.VITE_SITE_NAME

export default function Loading() {
  const imgLoadStatus = useMainStore((s) => s.imgLoadStatus)

  return (
    <div id="loader-wrapper" className={imgLoadStatus ? 'loaded' : ''}>
      <div className="loader-container">
        <div className="loader-content">
          <div className="loader-spinner">
            <div className="spinner-ring" />
            <div className="spinner-ring" />
            <div className="spinner-ring" />
          </div>
          <div className="loader-text">
            <span className="name">{siteName}</span>
            <span className="tip">加载中</span>
          </div>
        </div>
      </div>
    </div>
  )
}
