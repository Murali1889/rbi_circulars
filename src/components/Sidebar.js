import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const menuItems = [
        { name: 'RBI', path: '/rbi' },
        { name: 'SEBI', path: '/sebi' }
    ];

    return (
        <div className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0">
            <div className="flex items-center gap-6 p-4">
                <h1
                    onClick={() => navigate('/')}
                    className="text-xl font-bold text-[#3C4A94] cursor-pointer hover:text-[#2d3970] transition-colors"
                >
                    Circulars
                </h1>
            </div>
            <nav className="mt-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${location.pathname.startsWith(item.path) ? 'bg-gray-100 font-medium' : ''
                            }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar