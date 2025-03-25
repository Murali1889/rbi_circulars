import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const menuItems = [
    { name: 'RBI', path: '/rbi', color: '#3C4A94', hover: '#2D3970', light: '#D6D5E9', accent: '#6366F1' },
    { name: 'SEBI', path: '/sebi', color: '#1E3A8A', hover: '#172554', light: '#DBEAFE', accent: '#3B82F6' },
    { name: 'IRDAI', path: '/irdai', color: '#047857', hover: '#065F46', light: '#D1FAE5', accent: '#10B981' },
  ];

  return (
    <div
      className="w-64 h-screen bg-white border-r fixed left-0 transition-all duration-300"
      style={{ borderColor: '#E5E7EB' }}
    >
      <div className="flex items-center gap-6 p-4 border-b" style={{ borderColor: '#E5E7EB' }}>
        <h1
          onClick={() => navigate('/')}
          className="text-xl font-bold cursor-pointer transition-colors duration-200 hover:text-gray-600"
          style={{ color: '#111827' }}
        >
          Circulars
        </h1>
      </div>
      <nav className="mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 transition-all duration-200 hover:bg-[${item.light}] ${
              location.pathname.startsWith(item.path)
                ? `bg-[${item.light}] font-medium border-l-4`
                : 'border-l-4 border-transparent'
            }`}
            style={{
              color: location.pathname.startsWith(item.path) ? item.color : '#374151',
              borderColor: location.pathname.startsWith(item.path) ? item.accent : 'transparent',
            }}
          >
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;