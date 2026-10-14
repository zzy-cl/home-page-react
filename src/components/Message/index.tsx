import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa'
import { Error } from '@icon-park/react'
import { useMainStore } from '@/store'
import { notice } from '@/utils/notice'
import './index.css'

const siteLogo = import.meta.env.VITE_SITE_MAIN_LOGO

const siteUrl = (() => {
  const url = import.meta.env.VITE_SITE_URL
  if (!url) return 'zhaozeyu.top'.split('.')
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.replace(/^(https?:\/\/)/, '').split('.')
  }
  return url.split('.')
})()

export default function Message() {
  const boxOpenState = useMainStore((s) => s.boxOpenState)
  const setBoxOpenState = useMainStore((s) => s.setBoxOpenState)
  const innerWidth = useMainStore((s) => s.innerWidth)

  // 简介文案由盒子开关状态直接派生，无需额外 state
  const hello = boxOpenState ? import.meta.env.VITE_DESC_HELLO_OTHER : import.meta.env.VITE_DESC_HELLO
  const text = boxOpenState ? import.meta.env.VITE_DESC_TEXT_OTHER : import.meta.env.VITE_DESC_TEXT

  // 点击简介区域切换右侧功能区（盒子）
  const changeBox = () => {
    if ((innerWidth ?? 0) >= 721) {
      setBoxOpenState(!boxOpenState)
    } else {
      notice()?.open({
        content: '当前页面宽度不足以开启盒子',
        icon: <Error theme="filled" size={16} fill="#efefef" />,
      })
    }
  }

  return (
    <div className="message">
      {/* Logo */}
      <div className="logo">
        <img className="logo-img" src={siteLogo} alt="logo" />
        <div className={`name text-hidden${siteUrl[0].length >= 6 ? ' long' : ''}`}>
          <span className="bg">{siteUrl[0]}</span>
          <span className="sm">.{siteUrl[1]}</span>
        </div>
      </div>
      {/* 简介 */}
      <div className="description cards" onClick={changeBox}>
        <div className="content">
          <FaQuoteLeft size={16} />
          <div key={hello + text} className="text">
            <p>{hello}</p>
            <p>{text}</p>
          </div>
          <FaQuoteRight size={16} />
        </div>
      </div>
    </div>
  )
}
