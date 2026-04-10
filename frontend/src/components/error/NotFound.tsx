import { FileX2 } from 'lucide-react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card max-w-md text-center">
        <FileX2 size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">404</h2>
        <p className="text-gray-500 mb-4">页面不存在</p>
        <Link to="/" className="btn-primary">
          返回首页
        </Link>
      </div>
    </div>
  );
}

export default NotFound;