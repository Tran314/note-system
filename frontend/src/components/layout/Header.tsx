import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { LogOut, Settings, User } from 'lucide-react';

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      // 左侧 Logo
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-blue-600">📝 笔记系统</span>
      </div>

      // 右侧用户信息
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.nickname}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <User size={16} />
            </div>
          )}
          <span className="text-sm font-medium">{user?.nickname || '用户'}</span>
        </div>

        <button
          onClick={() => navigate('/settings')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="设置"
        >
          <Settings size={18} />
        </button>

        <button
          onClick={handleLogout}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-600"
          title="登出"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

export default Header;