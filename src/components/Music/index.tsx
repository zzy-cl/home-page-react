import { useEffect, useRef, useState } from 'react'
import {
  GoStart,
  PlayOne,
  Pause,
  GoEnd,
  CloseOne,
  VolumeMute,
  VolumeSmall,
  VolumeNotice,
} from '@icon-park/react'
import { Slider } from 'antd'
import Player from '../Player'
import type { PlayerHandle } from '../Player'
import { useMainStore } from '@/store'
import './index.css'

const playerData = {
  server: import.meta.env.VITE_SONG_SERVER,
  type: import.meta.env.VITE_SONG_TYPE,
  id: import.meta.env.VITE_SONG_ID,
}

export default function Music() {
  const musicOpenState = useMainStore((s) => s.musicOpenState)
  const setMusicOpenState = useMainStore((s) => s.setMusicOpenState)
  const playerState = useMainStore((s) => s.playerState)
  const playerTitle = useMainStore((s) => s.playerTitle)
  const playerArtist = useMainStore((s) => s.playerArtist)
  const musicVolume = useMainStore((s) => s.musicVolume)

  // 音量控制：store 中 0 视为未设置，给 0.7 的初始默认值
  const [volumeNum, setVolumeNum] = useState(musicVolume || 0.7)
  const [musicListShow, setMusicListShow] = useState(false)
  const [volumeShow, setVolumeShow] = useState(false)
  const playerRef = useRef<PlayerHandle>(null)

  // 音量变化同步到 store 与播放器
  useEffect(() => {
    useMainStore.setState({ musicVolume: volumeNum })
    playerRef.current?.changeVolume(volumeNum)
  }, [volumeNum])

  // 空格键控制播放/暂停
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!useMainStore.getState().musicIsOk) return
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if (e.code === 'Space') {
        e.preventDefault()
        playerRef.current?.playToggle()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const openMusicList = () => {
    setMusicListShow(true)
    playerRef.current?.toggleList()
  }

  const closeMusicList = () => {
    setMusicListShow(false)
    playerRef.current?.toggleList()
  }

  const changeSongByIndex = (type: 0 | 1) => {
    playerRef.current?.changeSong(type)
  }

  const volumeIcon =
    volumeNum === 0 ? (
      <VolumeMute theme="filled" size={24} fill="#efefef" />
    ) : volumeNum < 0.7 ? (
      <VolumeSmall theme="filled" size={24} fill="#efefef" />
    ) : (
      <VolumeNotice theme="filled" size={24} fill="#efefef" />
    )

  return (
    <>
      {/* 音乐控制面板 */}
      <div
        className="music"
        style={{ display: musicOpenState ? 'flex' : 'none' }}
        onMouseEnter={() => setVolumeShow(true)}
        onMouseLeave={() => setVolumeShow(false)}
      >
        <div className="btns">
          <button className="btn" onClick={openMusicList}>
            音乐列表
          </button>
          <button className="btn" onClick={() => setMusicOpenState(false)}>
            回到一言
          </button>
        </div>
        <div className="control">
          <GoStart
            theme="filled"
            size={30}
            fill="#efefef"
            className="control-icon"
            onClick={() => changeSongByIndex(0)}
          />
          <button
            key={String(playerState)}
            className="play-toggle-btn"
            onClick={() => playerRef.current?.playToggle()}
            aria-label={playerState ? '暂停' : '播放'}
          >
            {playerState ? (
              <Pause theme="filled" size={50} fill="#efefef" />
            ) : (
              <PlayOne theme="filled" size={50} fill="#efefef" />
            )}
          </button>
          <GoEnd
            theme="filled"
            size={30}
            fill="#efefef"
            className="control-icon"
            onClick={() => changeSongByIndex(1)}
          />
        </div>
        <div className="menu">
          {!volumeShow && (
            <div className="name">
              <span>{playerTitle ? `${playerTitle} - ${playerArtist}` : '未播放音乐'}</span>
            </div>
          )}
          {volumeShow && (
            <div className="volume">
              <div className="icon">{volumeIcon}</div>
              <Slider
                className="volume-slider"
                value={volumeNum}
                onChange={setVolumeNum}
                tooltip={{ open: false }}
                min={0}
                max={1}
                step={0.01}
              />
            </div>
          )}
        </div>
      </div>

      {/* 音乐列表弹窗（Player 常驻挂载，仅容器显隐，与原 v-show 行为一致） */}
      <div
        className={`music-list-overlay${musicListShow ? '' : ' g-hidden'}`}
        onClick={closeMusicList}
      >
        <div
          className={`music-list-container${musicListShow ? '' : ' g-hidden'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="close-btn" onClick={closeMusicList} aria-label="关闭音乐列表">
            <CloseOne theme="filled" size={28} fill="#ffffff60" />
          </button>
          <Player
            ref={playerRef}
            songServer={playerData.server}
            songType={playerData.type}
            songId={playerData.id}
            volume={volumeNum}
          />
        </div>
      </div>
    </>
  )
}
