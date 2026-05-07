import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Search, Bell, Settings, LogOut, User } from 'lucide-react';
import { useState } from 'react';

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  return (
    <header className="flex h-14 items-center justify-between border-b border-[#3a3a3a] bg-[#242424] px-4">
      {/* 搜索框 */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="搜索笔记..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </form>

      {/* 右侧操作区 */}
      <div className="flex items-center gap-2">
        {/* 通知按钮 */}
        <button className="btn-ghost rounded-lg p-2" title="通知">
          <Bell size={18} />
        </button>

        {/* 设置按钮 */}
        <button onClick={() => navigate('/settings')} className="btn-ghost rounded-lg p-2" title="设置">
          <Settings size={18} />
        </button>

        {/* 用户菜单 */}
        <div className="relative">
          <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[#363636]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#10a37f]">
              <User size={14} className="text-white" />
            </div>
            <span className="hidden text-sm text-[#b4b4b4] md:inline">
              {user?.nickname || user?.email?.split('@')[0] || '用户'}
            </span>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 min-w-[160px] rounded-lg border border-[#3a3a3a] bg-[#242424] py-1 shadow-lg">
                <button onClick={() => { setShowUserMenu(false); navigate('/settings'); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-[#363636]">
                  <Settings size={14} />
                  设置
                </button>
                <div className="my-1 border-t border-[#3a3a3a]" />
                <button onClick={() => { setShowUserMenu(false); handleLogout(); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[#ef4444] hover:bg-[#ef4444]/10">
                  <LogOut size={14} />
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