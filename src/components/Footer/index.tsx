import { MusicOne } from '@icon-park/react'
import { memo } from 'react'
import { useMainStore } from '@/store'
import pkg from '../../../package.json'
import './index.css'

const fullYear = new Date().getFullYear()

const startYearRaw = import.meta.env.VITE_SITE_START
const startYear = startYearRaw && startYearRaw.length >= 4 ? startYearRaw.substring(0, 4) : null
const siteIcp = import.meta.env.VITE_SITE_ICP
const siteAuthor = import.meta.env.VITE_SITE_AUTHOR

const siteUrl = (() => {
  const url = import.meta.env.VITE_SITE_URL
  if (!url) return 'https://www.zhaozeyu.top'
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return '//' + url
  }
  return url
})()

function Footer({ className }: { className?: string }) {
  const playerState = useMainStore((s) => s.playerState)
  const playerLrcShow = useMainStore((s) => s.playerLrcShow)
  const playerLrc = useMainStore((s) => s.playerLrc)
  const footerBlur = useMainStore((s) => s.footerBlur)

  return (
    <footer id="footer" className={`${footerBlur ? 'footer-blur' : ''} ${className ?? ''}`}>
      {/*
        与原版一致：未播放或不显示歌词时展示版权信息，
        播放中且开启歌词时展示歌词
      */}
      {!playerState || !playerLrcShow ? (
        <div className="power">
          <span>
            <span className={startYear && Number(startYear) < fullYear ? 'c-hidden' : 'g-hidden'}>
              Copyright&nbsp;
            </span>
            &copy;
            {startYear && Number(startYear) < fullYear && (
              <span className="site-start">
                &nbsp;{startYear}
                {' '}-{' '}
              </span>
            )}
            {fullYear}
            <a href={siteUrl}>{siteAuthor}</a>
          </span>
          {/* 以下信息请不要修改哦 */}
          <span className="g-hidden">
            &amp;&nbsp;Made&nbsp;by&nbsp;
            <a href={pkg.github} target="_blank" rel="noopener noreferrer">
              {pkg.author}
            </a>
          </span>
          {/* 站点备案 */}
          <span>
            &amp;
            {siteIcp && (
              <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer">
                {siteIcp}
              </a>
            )}
          </span>
        </div>
      ) : (
        <div className="lrc">
          <div className="lrc-all" key={playerLrc}>
            <MusicOne theme="filled" size={18} fill="#efefef" />
            <span className="lrc-text text-hidden" dangerouslySetInnerHTML={{ __html: playerLrc }} />
            <MusicOne theme="filled" size={18} fill="#efefef" />
          </div>
        </div>
      )}
    </footer>
  )
}

export default memo(Footer)
