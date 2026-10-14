declare module 'aplayer' {
  export interface APlayerAudio {
    name?: string
    artist?: string
    url: string
    cover?: string
    lrc?: string
    theme?: string
  }

  export interface APlayerOptions {
    container: HTMLElement
    audio: APlayerAudio[]
    fixed?: boolean
    mini?: boolean
    autoplay?: boolean
    theme?: string
    loop?: 'all' | 'one' | 'none'
    order?: 'list' | 'random'
    preload?: string
    volume?: number
    mutex?: boolean
    lrcType?: number
    listFolded?: boolean
    listMaxHeight?: number
    listOpened?: boolean
    storageName?: string
  }

  export default class APlayer {
    constructor(options: APlayerOptions)
    /** 当前音频元素（单曲时为元素，列表时为数组） */
    audio: HTMLAudioElement | HTMLAudioElement[]
    /** 当前播放索引 */
    index: number
    list: {
      audios: APlayerAudio[]
      index: number
      show(): void
      hide(): void
      toggle(): void
      switch(index: number): void
      add(audios: APlayerAudio | APlayerAudio[]): void
      remove(index: number | number[]): void
      clear(): void
    }
    play(): void
    pause(): void
    toggle(): void
    skipBack(): void
    skipForward(): void
    /** 设置音量（0-1），caching 为是否写入 localStorage */
    volume(percentage: number, caching?: boolean): number
    on(event: string, handler: (...args: unknown[]) => void): void
    destroy(): void
  }
}
