import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { restoreAccent } from '@/lib/accent'
import './index.css'

// 启动时恢复持久化的强调色(在 React 渲染前应用,避免默认色闪烁)
restoreAccent()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
