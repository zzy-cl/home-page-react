import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import APlayer from 'aplayer'
import 'aplayer/dist/APlayer.min.css'
import { getPlayerList } from '@/api'
import type { PlayerAudio } from '@/api'
import { useMainStore } from '@/store'
import { notice } from '@/utils/notice'
import './index.css'

export interface PlayerHandle {
  playToggle: () => void
  changeVolume: (value: number) => void
  changeSong: (type: 0 | 1) => void
  toggleList: () => void
}

interface PlayerProps {
  /** 主题色 */
  theme?: string
  /** 默认音量 */
  volume?: number
  /** 歌曲服务器 ( netease-网易云, tencent-qq音乐 ) */
  songServer: string
  /** 播放类型 ( song-歌曲, playlist-播放列表, album-专辑, search-搜索, artist-艺术家 ) */
  songType: string
  /** 歌曲/播放列表 ID */
  songId: string
  /** 列表是否默认折叠 */
  listFolded?: boolean
  /** 列表最大高度 */
  listMaxHeight?: number
}

const Player = forwardRef<PlayerHandle, PlayerProps>(function Player(
  {
    theme = '#efefef',
    volume = 0.7,
    songServer,
    songType,
    songId,
    listFolded = false,
    listMaxHeight = 420,
  },
  ref,
) {
  const setPlayerState = useMainStore((s) => s.setPlayerState)
  const setPlayerLrc = useMainStore((s) => s.setPlayerLrc)
  const setPlayerData = useMainStore((s) => s.setPlayerData)

  const containerRef = useRef<HTMLDivElement>(null)
  const aplayerRef = useRef<APlayer | null>(null)
  const playIndexRef = useRef(0)
  const [playList, setPlayList] = useState<PlayerAudio[]>([])
  const initStarted = useRef(false)

  // 初始化播放器：拉取歌单
  useEffect(() => {
    if (initStarted.current) return
    initStarted.current = true

    const initializePlayer = async () => {
      const store = useMainStore.getState()
      try {
        const playlistData = await getPlayerList(songServer, songType, songId)
        if (!playlistData || playlistData.length === 0) {
          throw new Error('获取播放列表失败，返回数据为空')
        }
        store.musicIsOk = true
        setPlayList(playlistData)
        console.info('音乐列表加载完成，共', playlistData.length, '首歌曲')
      } catch (err) {
        console.error('播放器初始化失败:', err)
        store.musicIsOk = false
        notice()?.open({ content: '播放器加载失败' })
      }
    }

    initializePlayer()
  }, [songServer, songType, songId])

  // 歌单就绪后创建 APlayer 实例
  useEffect(() => {
    if (playList.length === 0 || !containerRef.current) return

    const ap = new APlayer({
      container: containerRef.current,
      audio: playList,
      theme,
      loop: useMainStore.getState().playerLoop,
      order: useMainStore.getState().playerOrder,
      volume,
      lrcType: 3,
      listFolded,
      listMaxHeight,
    })
    aplayerRef.current = ap

    // 播放事件：更新播放状态与歌曲信息
    ap.on('play', () => {
      const index = ap.list.index
      playIndexRef.current = index
      setPlayerState(true)
      const currentTrack = playList[index]
      if (currentTrack) {
        setPlayerData(currentTrack.name, currentTrack.artist)
        notice()?.open({
          key: 'music-playing',
          content: `${currentTrack.name} - ${currentTrack.artist}`,
        })
      }
    })

    // 暂停事件
    ap.on('pause', () => {
      setPlayerState(false)
    })

    // 时间更新：同步歌词到 store（从 APlayer 渲染出的当前歌词行读取）
    ap.on('timeupdate', () => {
      try {
        const currentEl = containerRef.current?.querySelector('.aplayer-lrc-current')
        let lrcText = currentEl?.textContent ?? ''
        if (lrcText === 'Loading') lrcText = '歌词加载中'
        else if (lrcText === 'Not available') lrcText = '歌词加载失败'
        if (lrcText) setPlayerLrc(lrcText)
      } catch (error) {
        console.warn('歌词更新出错:', error)
      }
    })

    // 播放出错提示
    ap.on('error', () => {
      try {
        const msg =
          playList.length > 1
            ? '播放歌曲出现错误，播放器将在 2s 后进行下一首'
            : '播放歌曲出现错误'
        notice()?.open({ key: 'music-error', content: msg, duration: 2000 })
        console.error('播放歌曲错误:', playList[ap.list.index]?.name || '未知歌曲')
      } catch (error) {
        console.error('错误处理过程中出现异常:', error)
      }
    })

    return () => {
      try {
        ap.destroy()
      } catch {
        // destroy 过程中 audio 可能已中断，忽略
      }
      aplayerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playList])

  // 音量变化同步到播放器
  useEffect(() => {
    aplayerRef.current?.volume(volume, true)
  }, [volume])

  // 暴露控制方法
  useImperativeHandle(ref, () => ({
    playToggle: () => aplayerRef.current?.toggle(),
    changeVolume: (value: number) => {
      if (typeof value === 'number') aplayerRef.current?.volume(value, false)
    },
    changeSong: (type: 0 | 1) => {
      const ap = aplayerRef.current
      if (!ap) return
      if (type === 0) {
        ap.skipBack()
      } else {
        ap.skipForward()
      }
      // 确保切换后继续播放
      setTimeout(() => ap.play(), 0)
    },
    toggleList: () => aplayerRef.current?.list.toggle(),
  }))

  if (playList.length === 0) return null

  return (
    <div
      className="player-container"
      ref={containerRef}
      style={{ '--list-height': `${listMaxHeight}px` } as CSSProperties}
    />
  )
})

export default Player
