import { useDashboardOverview, useCashFlow } from '../api/queries';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Briefcase, CreditCard, AlertTriangle, TrendingUp, Wallet, LayoutGrid } from 'lucide-react';

export default function Dashboard() {
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: cashFlow, isLoading: cashFlowLoading } = useCashFlow();

  if (overviewLoading || cashFlowLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-indigo-500 font-medium animate-pulse">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="ml-4">Loading your dashboard...</span>
      </div>
    );
  }

  // Formatting currency helper
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <LayoutGrid className="text-indigo-600" />
            Executive Overview
          </h2>
          <p className="text-slate-500 mt-1">Real-time metrics for your construction projects.</p>
        </div>
      </div>
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <div className="glass p-6 rounded-2xl animate-in slide-up relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/30">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Projects</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">{overview?.totalProjects || 0}</h3>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass p-6 rounded-2xl animate-in slide-up stagger-1 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-emerald-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/30">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Contract Value</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(overview?.totalContractValue || 0)}</h3>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass p-6 rounded-2xl animate-in slide-up stagger-2 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-amber-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/30">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Payments</p>
              <h3 className="text-2xl font-black text-amber-500 mt-1">{formatCurrency(overview?.pendingPayments || 0)}</h3>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass p-6 rounded-2xl animate-in slide-up stagger-3 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-rose-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/30">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Low Stock Alerts</p>
              <h3 className="text-3xl font-black text-rose-500 mt-1">{overview?.lowStockMaterials || 0} <span className="text-lg text-rose-400 font-bold">Items</span></h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cash Flow Chart */}
      <div className="mt-10 glass p-8 rounded-3xl animate-in slide-up stagger-4 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] transition-shadow duration-500">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Wallet className="text-indigo-500" />
              Cash Flow Analysis
            </h3>
            <p className="text-sm text-slate-500 mt-1">Income vs Expenses over recent months</p>
          </div>
        </div>
        
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cashFlow || []}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontWeight: 500 }}
                tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                dx={-10}
              />
              <Tooltip 
                cursor={{ fill: '#F1F5F9' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Legend 
                iconType="circle" 
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Bar dataKey="income" name="Income" fill="url(#colorIncome)" radius={[6, 6, 0, 0]} barSize={32} />
              <Bar dataKey="expense" name="Expenses" fill="url(#colorExpense)" radius={[6, 6, 0, 0]} barSize={32} />
              
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#E11D48" stopOpacity={1}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
