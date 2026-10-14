import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// PWA：ServiceWorker 更新提醒
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  // 弹出更新提醒
  console.log('站点已更新，刷新后生效')
})
