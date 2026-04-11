import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export function Loading({ text = '加载中...', fullScreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-[#10a37f]" />
      <span className="text-sm text-[#888888]">{text}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]/80 backdrop-blur-sm">
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

export function Empty({ icon, title = '暂无数据', description, action }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-[#888888]">{icon}</div>}
      <h3 className="mb-2 text-lg font-medium">{title}</h3>
      {description && <p className="mb-4 max-w-md text-sm text-[#888888]">{description}</p>}
      {action}
    </div>
  );
}