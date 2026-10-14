import { useState, memo } from 'react'
import { Collapse, Radio, Switch, message } from 'antd'
import { SuccessPicture } from '@icon-park/react'
import { useMainStore } from '@/store'
import './index.css'

function Settings() {
  const coverType = useMainStore((s) => s.coverType)
  const siteStartShow = useMainStore((s) => s.siteStartShow)
  const musicClick = useMainStore((s) => s.musicClick)
  const playerLrcShow = useMainStore((s) => s.playerLrcShow)
  const footerBlur = useMainStore((s) => s.footerBlur)
  const playerAutoplay = useMainStore((s) => s.playerAutoplay)
  const playerOrder = useMainStore((s) => s.playerOrder)
  const playerLoop = useMainStore((s) => s.playerLoop)

  // 默认选中项
  const [activeName, setActiveName] = useState<string>('1')

  // 壁纸切换提示
  const radioChange = () => {
    message.open({
      content: '壁纸更换成功',
      icon: <SuccessPicture theme="filled" size={16} fill="#efefef" />,
    })
  }

  const switchNode = (checked: boolean, onChange: (v: boolean) => void) => (
    <Switch size="small" checked={checked} onChange={onChange} />
  )

  return (
    <div className="setting">
      <Collapse
        className="setting-collapse"
        accordion
        activeKey={activeName}
        onChange={(key) => setActiveName((Array.isArray(key) ? key[0] : key) ?? '')}
        items={[
          {
            key: '1',
            label: '个性壁纸',
            children: (
              <div className="bg-set">
                <Radio.Group
                  value={coverType}
                  onChange={(e) => {
                    useMainStore.setState({ coverType: e.target.value })
                    radioChange()
                  }}
                >
                  <Radio value="0">默认壁纸</Radio>
                  <Radio value="1">每日一图</Radio>
                  <Radio value="2">随机风景</Radio>
                  <Radio value="3">随机动漫</Radio>
                </Radio.Group>
              </div>
            ),
          },
          {
            key: '2',
            label: '个性化调整',
            children: (
              <>
                <div className="item">
                  <span className="text">建站日期显示</span>
                  {switchNode(siteStartShow, (v) => useMainStore.setState({ siteStartShow: v }))}
                </div>
                <div className="item">
                  <span className="text">音乐点击是否打开面板</span>
                  {switchNode(musicClick, (v) => useMainStore.setState({ musicClick: v }))}
                </div>
                <div className="item">
                  <span className="text">底栏歌词显示</span>
                  {switchNode(playerLrcShow, (v) => useMainStore.setState({ playerLrcShow: v }))}
                </div>
                <div className="item">
                  <span className="text">底栏背景模糊</span>
                  {switchNode(footerBlur, (v) => useMainStore.setState({ footerBlur: v }))}
                </div>
              </>
            ),
          },
          {
            key: '3',
            label: '播放器配置',
            children: (
              <>
                <div className="item">
                  <span className="text">自动播放</span>
                  {switchNode(playerAutoplay, (v) =>
                    useMainStore.setState({ playerAutoplay: v }),
                  )}
                </div>
                <div className="item">
                  <span className="text">随机播放</span>
                  {switchNode(playerOrder === 'random', (v) =>
                    useMainStore.setState({ playerOrder: v ? 'random' : 'list' }),
                  )}
                </div>
                <div className="item">
                  <span className="text">循环模式</span>
                  <Radio.Group
                    value={playerLoop}
                    onChange={(e) => useMainStore.setState({ playerLoop: e.target.value })}
                  >
                    <Radio value="all">列表</Radio>
                    <Radio value="one">单曲</Radio>
                    <Radio value="none">不循环</Radio>
                  </Radio.Group>
                </div>
              </>
            ),
          },
          {
            key: '4',
            label: '其他设置',
            children: <div>设置内容待增加</div>,
          },
        ]}
      />
    </div>
  )
}

export default memo(Settings)
