import { useMemo, memo } from 'react'
import type { ComponentType } from 'react'
import { FaBlog, FaCloud, FaCompactDisc, FaCompass, FaLink, FaRobot, FaSearch } from 'react-icons/fa'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Mousewheel } from 'swiper/modules'
import type { PaginationOptions } from 'swiper/types'
import { useMainStore } from '@/store'
import siteLinks from '@/assets/siteLinks.json'
import 'swiper/css'
import 'swiper/css/pagination'
import './index.css'

// 网站链接图标（可前往 https://www.xicons.org 自行挑选并在此处引入）
const siteIcon: Record<string, ComponentType<{ size?: number }>> = {
  Blog: FaBlog,
  Cloud: FaCloud,
  CompactDisc: FaCompactDisc,
  Compass: FaCompass,
  Robot: FaRobot,
  Search: FaSearch,
}

interface SiteLink {
  icon: string
  name: string
  link: string
}

const paginationConfig: PaginationOptions = {
  el: '.links .swiper-pagination',
  clickable: true,
  bulletElement: 'div',
}

function Links() {
  const musicClick = useMainStore((s) => s.musicClick)
  const setMusicOpenState = useMainStore((s) => s.setMusicOpenState)

  // 每 6 个一组分页
  const siteLinksList = useMemo(() => {
    const result: SiteLink[][] = []
    for (let i = 0; i < siteLinks.length; i += 6) {
      result.push(siteLinks.slice(i, i + 6) as SiteLink[])
    }
    return result
  }, [])

  // 链接跳转；勾选「音乐点击是否打开面板」后，点击音乐站点改为展开播放器
  const jumpLink = (data: SiteLink) => {
    if (data.name === '音乐' && musicClick) {
      setMusicOpenState(true)
    } else {
      window.open(data.link, '_blank')
    }
  }

  if (!siteLinks[0]) return null

  return (
    <div className="links">
      <div className="line">
        <FaLink size={20} />
        <span className="title">网站列表</span>
      </div>
      <Swiper
        modules={[Pagination, Mousewheel]}
        slidesPerView={1}
        spaceBetween={40}
        pagination={paginationConfig}
        mousewheel
      >
        {siteLinksList.map((site, idx) => (
          <SwiperSlide key={idx}>
            <div className="link-all">
              {site.map((item, index) => {
                const IconCmp = siteIcon[item.icon]
                return (
                  <div
                    key={`${item.name}-${index}`}
                    className="item cards"
                    style={index < 3 ? { marginBottom: '20px' } : undefined}
                    onClick={() => jumpLink(item)}
                  >
                    {IconCmp ? <IconCmp size={26} /> : null}
                    <span className="name text-hidden">{item.name}</span>
                  </div>
                )
              })}
            </div>
          </SwiperSlide>
        ))}
        <div className="swiper-pagination" />
      </Swiper>
    </div>
  )
}

export default memo(Links)
