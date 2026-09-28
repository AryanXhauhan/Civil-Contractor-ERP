import { useParams, Link } from 'react-router-dom';
import { useProjectDetails, useProjectProfitability } from '../api/queries';
import { ArrowLeft, TrendingUp, TrendingDown, MapPin } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const { data: project, isLoading: projectLoading } = useProjectDetails(id!);
  const { data: profit, isLoading: profitLoading } = useProjectProfitability(id!);

  if (projectLoading || profitLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading details...</div>;
  }

  if (!project) return <div>Project not found</div>;

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const isProfitable = profit?.actualMargin >= 0;

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link to="/projects" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-4 w-fit">
          <ArrowLeft size={16} /> Back to Projects
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{project.name}</h2>
            <div className="flex items-center text-sm text-gray-500 mt-2 gap-2">
              <MapPin size={16} /> {project.location} &bull; Client: {project.client?.name}
            </div>
          </div>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-sm font-medium transition">
            Edit Project
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Contract Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(project.contractValue)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Est. BOQ Cost</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">{formatCurrency(profit?.estimatedCost || 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Actual Cost</p>
          <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(profit?.actualCost || 0)}</p>
        </div>
        <div className={`p-6 rounded-xl shadow-sm border ${isProfitable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-sm font-medium ${isProfitable ? 'text-green-700' : 'text-red-700'}`}>Current Margin</p>
          <div className="flex items-center gap-2 mt-2">
            <p className={`text-2xl font-bold ${isProfitable ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(profit?.actualMargin || 0)}
            </p>
            {isProfitable ? <TrendingUp size={24} className="text-green-500" /> : <TrendingDown size={24} className="text-red-500" />}
          </div>
        </div>
      </div>

      {/* BOQ Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900">Bill of Quantities (BOQ)</h3>
          <button className="text-sm text-blue-600 font-medium hover:text-blue-800">Add Item</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Est. Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {project.boqItems?.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.itemCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{item.estimatedQty} <span className="text-xs text-gray-500">{item.unit}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">₹{item.rate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    {formatCurrency(item.estimatedQty * item.rate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
