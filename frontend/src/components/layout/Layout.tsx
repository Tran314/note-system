import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#1a1a1a]">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 头部 */}
        <Header />

        {/* 内容区域 */}
        <main className="flex-1 overflow-y-auto bg-[#242424] p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;