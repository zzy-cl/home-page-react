import { useState } from 'react'
import socialLinks from '@/assets/socialLinks.json'
import './index.css'

export default function SocialLinks() {
  const [socialTip, setSocialTip] = useState('通过这里联系我吧')

  return (
    <div className="social">
      <div className="link">
        {socialLinks.map((item) => (
          <a
            key={item.name}
            href={item.url}
            target="_blank"
            aria-label={item.name}
            rel="noopener noreferrer"
            onMouseEnter={() => setSocialTip(item.tip)}
            onMouseLeave={() => setSocialTip('通过这里联系我吧')}
          >
            <img className="icon" src={item.icon} height={24} alt={item.name} />
          </a>
        ))}
      </div>
      <span className="tip">{socialTip}</span>
    </div>
  )
}
