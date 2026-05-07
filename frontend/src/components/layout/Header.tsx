import { useNavigate } from 'react-router-dom';
import { Search, Settings } from 'lucide-react';
import { useState } from 'react';

function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/notes?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-[#3a3a3a] bg-[#242424] px-4">
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

      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/settings')} className="btn-ghost rounded-lg p-2" title="设置">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}

export default Header;
