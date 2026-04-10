import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useState } from 'react';

function Layout() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部导航 */}
      <Header />

      {/* 主内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧边栏 */}
        <Sidebar
          selectedFolder={selectedFolder}
          selectedTag={selectedTag}
          onFolderSelect={setSelectedFolder}
          onTagSelect={setSelectedTag}
        />

        {/* 右侧内容区 */}
        <main className="flex-1 overflow-hidden">
          <Outlet context={{ selectedFolder, selectedTag, setSelectedFolder, setSelectedTag }} />
        </main>
      </div>
    </div>
  );
}

export default Layout;