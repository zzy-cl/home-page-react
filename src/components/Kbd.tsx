import type { ReactNode } from 'react';

/** 键帽样式(Cmd+K 提示等) */
export default function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd
      className="mono inline-flex h-6 min-w-6 items-center justify-center rounded-[6px] px-1.5 text-xs"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-1)',
      }}
    >
      {children}
    </kbd>
  );
}
