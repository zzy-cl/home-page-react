import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface MainState {
  /** 壁纸加载状态 */
  imgLoadStatus: boolean
  /** 当前窗口宽度 */
  innerWidth: number | null
  /** 壁纸种类 */
  coverType: string
  /** 建站日期显示 */
  siteStartShow: boolean
  /** 音乐链接是否打开面板 */
  musicClick: boolean
  /** 音乐是否加载完成 */
  musicIsOk: boolean
  /** 音乐音量 */
  musicVolume: number
  /** 音乐面板开启状态 */
  musicOpenState: boolean
  /** 壁纸展示状态 */
  backgroundShow: boolean
  /** 盒子开启状态 */
  boxOpenState: boolean
  /** 移动端开启状态 */
  mobileOpenState: boolean
  /** 移动端功能区开启状态 */
  mobileFuncState: boolean
  /** 设置页面开启状态 */
  setOpenState: boolean
  /** 当前播放状态（true = 播放中） */
  playerState: boolean
  /** 当前播放歌曲名 */
  playerTitle: string | null
  /** 当前播放歌手名 */
  playerArtist: string | null
  /** 当前播放歌词 */
  playerLrc: string
  /** 是否显示底栏歌词 */
  playerLrcShow: boolean
  /** 底栏模糊 */
  footerBlur: boolean
  /** 是否自动播放 */
  playerAutoplay: boolean
  /** 循环播放 "all" | "one" | "none" */
  playerLoop: 'all' | 'one' | 'none'
  /** 循环顺序 "list" | "random" */
  playerOrder: 'list' | 'random'

  // ---------- actions ----------
  setInnerWidth: (value: number) => void
  setPlayerState: (playing: boolean) => void
  setPlayerLrc: (value: string) => void
  setPlayerData: (title: string, artist: string) => void
  setImgLoadStatus: (value: boolean) => void
  setMusicOpenState: (value: boolean) => void
  setBoxOpenState: (value: boolean) => void
  setMobileOpenState: (value: boolean) => void
  setMobileFuncState: (value: boolean) => void
  setSetOpenState: (value: boolean) => void
}

/** 需要持久化到 localStorage 的字段（与原版 persist.paths 一致） */
type PersistedKeys =
  | 'coverType'
  | 'musicVolume'
  | 'siteStartShow'
  | 'musicClick'
  | 'playerLrcShow'
  | 'footerBlur'
  | 'playerAutoplay'
  | 'playerLoop'
  | 'playerOrder'

type PersistedState = Pick<MainState, PersistedKeys>

export const useMainStore = create<MainState>()(
  persist<MainState, [], [], PersistedState>(
    (set) => ({
      imgLoadStatus: false,
      innerWidth: null,
      coverType: '0',
      siteStartShow: false,
      musicClick: false,
      musicIsOk: false,
      musicVolume: 0,
      musicOpenState: false,
      backgroundShow: false,
      boxOpenState: false,
      mobileOpenState: false,
      mobileFuncState: false,
      setOpenState: false,
      playerState: false,
      playerTitle: null,
      playerArtist: null,
      playerLrc: '歌词加载中',
      playerLrcShow: true,
      footerBlur: true,
      playerAutoplay: false,
      playerLoop: 'all',
      playerOrder: 'list',

      setInnerWidth: (value) => {
        if (value >= 720) {
          set({ innerWidth: value, mobileOpenState: false, mobileFuncState: false })
        } else {
          set({ innerWidth: value })
        }
      },
      // 原版 setPlayerState(value){ this.playerState = !value } 的取反为历史遗留，
      // 这里直接以「是否正在播放」赋值
      setPlayerState: (playing) => set({ playerState: playing }),
      setPlayerLrc: (value) => set({ playerLrc: value }),
      setPlayerData: (title, artist) => set({ playerTitle: title, playerArtist: artist }),
      setImgLoadStatus: (value) => set({ imgLoadStatus: value }),
      setMusicOpenState: (value) => set({ musicOpenState: value }),
      setBoxOpenState: (value) => set({ boxOpenState: value }),
      setMobileOpenState: (value) => set({ mobileOpenState: value }),
      setMobileFuncState: (value) => set({ mobileFuncState: value }),
      setSetOpenState: (value) => set({ setOpenState: value }),
    }),
    {
      name: 'data',
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state): PersistedState => ({
        coverType: state.coverType,
        musicVolume: state.musicVolume,
        siteStartShow: state.siteStartShow,
        musicClick: state.musicClick,
        playerLrcShow: state.playerLrcShow,
        footerBlur: state.footerBlur,
        playerAutoplay: state.playerAutoplay,
        playerLoop: state.playerLoop,
        playerOrder: state.playerOrder,
      }),
    },
  ),
)
