import { useMainStore } from '@/store'
import Func from '@/views/Func'
import Links from '@/components/Links'
import './Right.css'

const siteUrl = (() => {
  const url = import.meta.env.VITE_SITE_URL
  if (!url) return 'zhaozeyu.top'.split('.')
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.replace(/^(https?:\/\/)/, '').split('.')
  }
  return url.split('.')
})()

export default function Right() {
  const mobileOpenState = useMainStore((s) => s.mobileOpenState)
  const mobileFuncState = useMainStore((s) => s.mobileFuncState)
  const setMobileFuncState = useMainStore((s) => s.setMobileFuncState)

  return (
    <div className={`main-right${mobileOpenState ? '' : ' g-hidden'}`}>
      {/* 移动端 Logo */}
      <div className="logo text-hidden" onClick={() => setMobileFuncState(!mobileFuncState)}>
        <span className="bg">{siteUrl[0]}</span>
        <span className="sm">.{siteUrl[1]}</span>
      </div>
      {/* 功能区 */}
      <Func />
      {/* 网站链接 */}
      <Links />
    </div>
  )
}
