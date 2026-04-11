import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Search, Bell, Settings, LogOut, User, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark'),
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/notes?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="nebula-panel-strong flex h-16 items-center justify-between rounded-[24px] px-6">
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            placeholder="搜索笔记..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-stone-200/70 bg-white/60 py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>
      </form>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="rounded-xl p-2 transition-colors hover:bg-stone-200/60"
          title={isDarkMode ? '切换亮色模式' : '切换暗色模式'}
        >
          {isDarkMode ? (
            <Sun size={20} className="text-stone-600" />
          ) : (
            <Moon size={20} className="text-stone-600" />
          )}
        </button>

        <button
          className="rounded-xl p-2 transition-colors hover:bg-stone-200/60"
          title="通知"
        >
          <Bell size={20} className="text-stone-600" />
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="rounded-xl p-2 transition-colors hover:bg-stone-200/60"
          title="设置"
        >
          <Settings size={20} className="text-stone-600" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-2xl p-2 transition-colors hover:bg-stone-200/60"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-800">
              <User size={16} className="text-white" />
            </div>
            <span className="hidden text-sm text-stone-700 md:inline">
              {user?.nickname || user?.email || '用户'}
            </span>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="nebula-panel-strong absolute right-0 top-full z-50 mt-2 min-w-[180px] rounded-2xl py-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-100/80"
                >
                  <Settings size={16} />
                  设置
                </button>
                <div className="my-1 border-t border-stone-200/80" />
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50/80"
                >
                  <LogOut size={16} />
                  退出登录
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
