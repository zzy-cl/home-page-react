import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { restoreAccent } from '@/lib/accent';
import './index.css';

// 启动恢复持久化强调色(data-accent 属性 + 动态 favicon),在渲染前应用
restoreAccent();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
