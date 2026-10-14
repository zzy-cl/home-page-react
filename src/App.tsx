import { useEffect } from 'react'
import { App as AntApp, ConfigProvider, theme } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HamburgerButton, CloseSmall } from '@icon-park/react'
import { showGreetingMessage, checkSpecialDates } from '@/utils/date'
import { cursorInit } from '@/utils/dom'
import { notice, setNoticeInstance } from '@/utils/notice'
import { useMainStore } from '@/store'
import pkg from '../package.json'
import Loading from '@/components/Loading'
import Background from '@/components/Background'
import Footer from '@/components/Footer'
import Left from '@/views/Main/Left'
import Right from '@/views/Main/Right'
import Box from '@/views/Box'
import MoreSettings from '@/views/MoreSettings'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

/** 应用外壳：注入 antd 主题 / 全局通知实例 / React Query */
export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#efefef',
          borderRadius: 8,
        },
      }}
    >
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <AppShell />
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  )
}

function AppShell() {
  // 把 antd 的 message 实例交给组件树之外的工具函数使用
  const { message } = AntApp.useApp()
  useEffect(() => {
    setNoticeInstance(message)
  }, [message])

  return <MainPage />
}

function MainPage() {
  const imgLoadStatus = useMainStore((s) => s.imgLoadStatus)
  const innerWidth = useMainStore((s) => s.innerWidth)
  const backgroundShow = useMainStore((s) => s.backgroundShow)
  const boxOpenState = useMainStore((s) => s.boxOpenState)
  const mobileOpenState = useMainStore((s) => s.mobileOpenState)
  const setOpenState = useMainStore((s) => s.setOpenState)
  const setMobileOpenState = useMainStore((s) => s.setMobileOpenState)
  const setSetOpenState = useMainStore((s) => s.setSetOpenState)
  const setInnerWidth = useMainStore((s) => s.setInnerWidth)

  // 加载完成事件：欢迎提示 + 默哀模式
  const loadComplete = () => {
    setTimeout(() => {
      showGreetingMessage()
      checkSpecialDates()
    }, 0)
  }

  // 宽度小于 721 时关闭盒子和设置页（对应原 watch innerWidth）
  useEffect(() => {
    if (innerWidth !== null && innerWidth < 721) {
      useMainStore.setState({ boxOpenState: false, setOpenState: false })
    }
  }, [innerWidth])

  useEffect(() => {
    // 自定义鼠标
    cursorInit()

    // 屏蔽右键
    document.oncontextmenu = () => {
      notice()?.open({
        key: 'contextmenu',
        content: '为了浏览体验，本站禁用右键',
      })
      return false
    }

    // 鼠标中键切换壁纸展示状态
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 1) {
        const next = !useMainStore.getState().backgroundShow
        useMainStore.setState({ backgroundShow: next })
        notice()?.open({
          key: 'background-show',
          content: `已${next ? '开启' : '退出'}壁纸展示状态`,
        })
      }
    }

    // 监听当前页面宽度
    const getWidth = () => setInnerWidth(window.innerWidth)
    getWidth()
    window.addEventListener('resize', getWidth)
    window.addEventListener('mousedown', handleMouseDown)

    // 控制台输出
    const logInfo = `%c呓语小屋 v${pkg.version}\n%c主页: ${pkg.home}\nGithub: ${pkg.github}`
    console.info(
      logInfo,
      'font-size: 20px; font-weight: 600; color: rgb(244,167,89);',
      'color: rgb(30,152,255);',
    )

    return () => {
      window.removeEventListener('resize', getWidth)
      window.removeEventListener('mousedown', handleMouseDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {/* 加载 */}
      <Loading />
      {/* 壁纸 */}
      <Background onLoadComplete={loadComplete} />
      {/* 主界面 */}
      {imgLoadStatus && (
        <main id="main">
          <div className="container" style={{ display: backgroundShow ? 'none' : 'block' }}>
            <section className="all" style={{ display: setOpenState ? 'none' : 'flex' }}>
              <Left />
              {!boxOpenState && <Right />}
              {boxOpenState && <Box />}
            </section>
            {setOpenState && (
              <section className="more" onClick={() => setSetOpenState(false)}>
                <MoreSettings />
              </section>
            )}
          </div>
          {/* 移动端菜单按钮 */}
          {!backgroundShow && (
            <div className="menu" onClick={() => setMobileOpenState(!mobileOpenState)}>
              {mobileOpenState ? (
                <CloseSmall theme="outline" size={24} fill="#fff" />
              ) : (
                <HamburgerButton theme="outline" size={24} fill="#fff" />
              )}
            </div>
          )}
          {/* 页脚 */}
          {!backgroundShow && !setOpenState && <Footer className="f-ter" />}
        </main>
      )}
    </>
  )
}
