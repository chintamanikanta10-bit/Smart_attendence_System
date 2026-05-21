import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, DollarSign, UploadCloud, ChevronDown } from 'lucide-react';
import { getCurrentUser, logoutUser } from '../auth';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Attendance Upload', path: '/upload', icon: UploadCloud },
    { name: 'Holidays', path: '/holidays', icon: Calendar },
    { name: 'Salary Reports', path: '/salary', icon: DollarSign },
  ];

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const userName = currentUser?.fullName || 'Admin Panel';
  const userInitial = currentUser?.fullName?.charAt(0).toUpperCase() || 'A';

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold tracking-tight text-white border-b border-slate-800">
          <span className="text-blue-500">Smart</span>Attendance
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    location.pathname.startsWith(item.path)
                      ? 'bg-blue-600 shadow-md text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-4 shrink-0 shadow-sm flex justify-end">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center space-x-3 rounded-full p-2 hover:bg-slate-100 transition"
            >
              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                {userInitial}
              </div>
              <div className="text-left">
                <div className="font-medium text-slate-700">{userName}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-white border border-slate-200 shadow-lg">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};
export default Layout;
