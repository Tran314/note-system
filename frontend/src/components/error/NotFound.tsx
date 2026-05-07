import { FileX2 } from 'lucide-react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="nebula-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="empty-state-shell page-enter p-10">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-white/60 text-stone-300 shadow-[0_20px_48px_rgba(63,44,24,0.1)]">
          <FileX2 size={40} />
        </div>
        <div className="mb-2 text-sm uppercase tracking-[0.24em] text-stone-400">404</div>
        <h2 className="mb-2 text-3xl font-semibold text-stone-900">页面走丢了</h2>
        <p className="mx-auto mb-6 max-w-md text-sm leading-6 text-stone-500">
          这个地址目前没有对应内容。你可以回到首页，继续浏览你的笔记与设置。
        </p>
        <Link to="/" className="btn-primary ui-inline">
          返回首页
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
