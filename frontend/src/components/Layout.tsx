import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Box, FileText, LogOut, CheckSquare, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userStr));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Projects', path: '/projects', icon: <FolderOpen size={20} /> },
    { name: 'Materials', path: '/materials', icon: <Box size={20} /> },
    { name: 'Invoices', path: '/invoices', icon: <FileText size={20} /> },
    { name: 'Daily Reports', path: '/reports', icon: <CheckSquare size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden font-sans">
      {/* Premium Sidebar */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col border-r border-white/10 shadow-2xl relative overflow-hidden z-20">
        {/* Subtle gradient orb behind sidebar */}
        <div className="absolute top-0 left-0 w-full h-64 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 pointer-events-none"></div>
        
        <div className="p-8 pb-4 flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">BuildFlow</h1>
            <p className="text-[10px] text-indigo-300 font-medium tracking-widest uppercase mt-0.5">Civil ERP System</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 mt-8 space-y-1.5 relative z-10">
          {navItems.map((item, i) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-300 border border-indigo-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' 
                    : 'hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </div>
                <span className="font-medium tracking-wide">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 relative z-10 mb-4 mx-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white/20">
               {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
               <p className="text-xs text-slate-400 truncate">{user?.role?.replace('_', ' ')}</p>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-semibold text-slate-300 hover:text-white border border-white/5"
          >
            <LogOut size={16} /> SIGN OUT
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Subtle background effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        {/* Glass Header */}
        <header className="glass sticky top-0 z-30 px-10 py-5 flex justify-between items-center border-b border-slate-200/60">
          <div>
            <h2 className="text-slate-800 font-medium">Welcome back, <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{user?.firstName}</span>! 👋</h2>
            <p className="text-xs text-slate-500 mt-1">Here is what's happening with your projects today.</p>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-auto p-10 relative z-10 scroll-smooth">
          <div className="animate-in slide-up h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
