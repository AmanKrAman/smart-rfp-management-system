import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/vendors', icon: Users, label: 'Vendors' },
    { path: '/rfps', icon: FileText, label: 'RFPs' },
  ];
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-600">Smart RFP</h1>
        <p className="text-sm text-gray-500 mt-1">Management System</p>
      </div>
      
      <nav className="px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
