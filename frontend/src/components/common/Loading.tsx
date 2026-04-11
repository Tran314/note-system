import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export function Loading({ text = '加载中...', fullScreen = false }: LoadingProps) {
  const content = (
    <div className="surface-enter flex flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 shadow-[0_14px_36px_rgba(63,44,24,0.12)]">
        <Loader2 className="h-6 w-6 animate-spin text-stone-600" />
      </div>
      <span className="text-sm tracking-[0.01em] text-stone-500">{text}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="overlay-enter fixed inset-0 z-50 flex items-center justify-center bg-[rgba(247,242,235,0.72)] backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
}

interface EmptyProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function Empty({
  icon,
  title = '暂无数据',
  description,
  action,
}: EmptyProps) {
  return (
    <div className="empty-state-shell page-enter py-12 text-stone-400">
      {icon && (
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/55 text-stone-300 shadow-[0_16px_36px_rgba(63,44,24,0.08)]">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-xl font-medium text-stone-800">{title}</h3>
      {description && <p className="mx-auto mb-5 max-w-md text-sm leading-6 text-stone-500">{description}</p>}
      {action}
    </div>
  );
}
