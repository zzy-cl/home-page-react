import { useState } from 'react'
import { CloseOne, SettingTwo, GithubOne, AddOne, Bug } from '@icon-park/react'
import { Tooltip } from 'antd'
import { useMainStore } from '@/store'
import Settings from '@/components/Settings'
import pkg from '../../../package.json'
import './index.css'

// 更新日志
const upData = {
  new: [
    '采用 React 重新重构',
    '音乐歌单支持快速自定义',
    '壁纸支持个性化设置',
    '音乐播放器支持音量控制',
  ],
  fix: ['修复天气 API', '时光胶囊显示错误', '移动端动画及细节', '图标更换为 IconPark'],
}

const siteUrl = (() => {
  const url = import.meta.env.VITE_SITE_URL
  if (!url) return 'zhaozeyu.top'.split('.')
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.replace(/^(https?:\/\/)/, '').split('.')
  }
  return url.split('.')
})()

export default function MoreSettings() {
  const setSetOpenState = useMainStore((s) => s.setSetOpenState)
  const [closeShow, setCloseShow] = useState(false)

  // 跳转源代码仓库
  const jumpTo = (url: string) => {
    window.open(url)
  }

  return (
    <div
      className="set"
      onMouseEnter={() => setCloseShow(true)}
      onMouseLeave={() => setCloseShow(false)}
      onClick={(e) => e.stopPropagation()}
    >
      {closeShow && (
        <CloseOne
          className="close"
          theme="filled"
          size={28}
          fill="#ffffff60"
          onClick={() => setSetOpenState(false)}
        />
      )}
      <div className="set-row">
        <div className="left">
          <div className="logo text-hidden">
            <span className="bg">{siteUrl[0]}</span>
            <span className="sm">.{siteUrl[1]}</span>
          </div>
          <div className="version">
            <div className="num">v&nbsp;{pkg.version}</div>
            <Tooltip title="Github 源代码仓库" placement="right" mouseEnterDelay={0.1}>
              <GithubOne
                className="github"
                theme="outline"
                size={24}
                onClick={() => jumpTo(pkg.github)}
              />
            </Tooltip>
          </div>
          <div className="update cards">
            <div className="card-header">
              <span>更新日志</span>
            </div>
            <div className="upnote">
              {upData.new.map((item) => (
                <div key={item} className="uptext">
                  <AddOne theme="outline" size={22} />
                  {item}
                </div>
              ))}
              {upData.fix.map((item) => (
                <div key={item} className="uptext">
                  <Bug theme="outline" size={22} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="right">
          <div className="title">
            <SettingTwo theme="filled" size={28} fill="#ffffff60" />
            <span className="name">全局设置</span>
          </div>
          <Settings />
        </div>
      </div>
    </div>
  )
}
