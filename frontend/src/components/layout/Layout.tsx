import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout() {
  return (
    <div className="nebula-shell flex h-screen overflow-hidden px-3 py-3">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden pl-3">
        <Header />
        <main className="nebula-panel mt-3 flex-1 overflow-y-auto rounded-[28px] p-6 nebula-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
