import fetchJsonp from 'fetch-jsonp'

export interface PlayerAudio {
  name: string
  artist: string
  url: string
  cover: string
  lrc: string
}

interface MetingSong {
  name?: string
  title?: string
  artist?: string
  author?: string
  url: string
  cover?: string
  pic?: string
  lrc?: string
}

interface TencentJsonpResponse {
  req_0?: {
    data?: {
      sip?: string[]
      midurlinfo?: Array<{ purl?: string }>
    }
  }
}

/**
 * 获取音乐播放列表
 * @param server - 音乐服务器 (netease-网易云, tencent-qq音乐)
 * @param type - 播放类型 (song-歌曲, playlist-播放列表, album-专辑, search-搜索, artist-艺术家)
 * @param id - 歌曲/播放列表ID
 */
export const getPlayerList = async (
  server: string,
  type: string,
  id: string,
): Promise<PlayerAudio[]> => {
  const res = await fetch(`${import.meta.env.VITE_SONG_API}?server=${server}&type=${type}&id=${id}`)
  const data: MetingSong[] = await res.json()

  // 原 data[0].url 在接口返回空数组时会直接抛错，先做保护
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('获取播放列表失败，返回数据为空')
  }

  const toAudio = (v: MetingSong, url: string): PlayerAudio => ({
    name: v.name || v.title || '未知歌曲',
    artist: v.artist || v.author || '未知歌手',
    url,
    cover: v.cover || v.pic || '',
    lrc: v.lrc || '',
  })

  if (data[0].url.startsWith('@')) {
    // QQ 音乐特殊处理：通过 jsonp 拿真实直链
    const [, , , url] = data[0].url.split('@').slice(1)
    const jsonpData: TencentJsonpResponse = await fetchJsonp(url).then((r) => r.json())
    const sips = jsonpData.req_0?.data?.sip ?? []
    const purls = jsonpData.req_0?.data?.midurlinfo ?? []
    const domain = (
      sips.find((i) => !i.startsWith('http://ws')) || sips[0] || 'https://'
    ).replace('http://', 'https://')

    return data.map((v, i) => toAudio(v, domain + (purls[i]?.purl ?? '')))
  } else {
    return data.map((v) => toAudio(v, v.url))
  }
}
