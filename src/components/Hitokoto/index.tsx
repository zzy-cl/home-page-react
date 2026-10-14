import { useMemo, useState, memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MusicMenu } from '@icon-park/react'
import { getHitokoto } from '@/api'
import { useMainStore } from '@/store'
import { notice } from '@/utils/notice'
import { debounce } from '@/utils'
import './index.css'

function Hitokoto() {
  const musicOpenState = useMainStore((s) => s.musicOpenState)
  const musicIsOk = useMainStore((s) => s.musicIsOk)
  const setMusicOpenState = useMainStore((s) => s.setMusicOpenState)

  // 开启音乐面板按钮显隐
  const [openMusicShow, setOpenMusicShow] = useState(false)

  // 一言数据
  const [hitokotoText, setHitokotoText] = useState('这里应该显示一句话')
  const [hitokotoFrom, setHitokotoFrom] = useState('zzy')
  const [hitokotoKey, setHitokotoKey] = useState(0)

  const { refetch } = useQuery({
    queryKey: ['hitokoto'],
    queryFn: async () => {
      try {
        const result = await getHitokoto()
        setHitokotoText(result.hitokoto)
        setHitokotoFrom(result.from)
        setHitokotoKey((k) => k + 1)
        return result
      } catch {
        notice()?.open({ content: '一言获取失败' })
        setHitokotoText('这里应该显示一句话')
        setHitokotoFrom('zzy')
        return null
      }
    },
  })

  // 防抖 500ms 后更新一言（原版防抖实现失效，此处为修正后的标准防抖）
  const debouncedFetch = useMemo(() => debounce(() => refetch(), 500), [refetch])

  const updateHitokoto = () => {
    debouncedFetch()
  }

  return (
    <div
      className="hitokoto cards"
      style={{ display: musicOpenState ? 'none' : 'block' }}
      onMouseEnter={() => setOpenMusicShow(true)}
      onMouseLeave={() => setOpenMusicShow(false)}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 打开音乐面板 */}
      {openMusicShow && musicIsOk && (
        <div className="open-music" onClick={() => setMusicOpenState(true)}>
          <MusicMenu theme="filled" size={18} fill="#efefef" />
          <span>打开音乐播放器</span>
        </div>
      )}
      {/* 一言内容 */}
      <div key={hitokotoKey} className="content" onClick={updateHitokoto}>
        <span className="text">{hitokotoText}</span>
        <span className="from">
          -「&nbsp;{hitokotoFrom}&nbsp;」
        </span>
      </div>
    </div>
  )
}

export default memo(Hitokoto)
