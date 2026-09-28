import { useState } from 'react';
import { useInvoices, useProjects } from '../api/queries';
import { FileText, Download, CheckCircle, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/axios';

export default function Invoices() {
  const { data: invoices, isLoading } = useInvoices();
  const { data: projects } = useProjects();
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    description: '',
    amount: '',
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading invoices...</div>;
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const filteredInvoices = invoices?.filter((inv: any) => filter === 'ALL' ? true : inv.status === filter);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProject = projects?.find((p: any) => p.id === formData.projectId);
    if (!selectedProject) {
      alert("Please select a valid project");
      return;
    }

    try {
      await api.post('/invoices', {
        projectId: selectedProject.id,
        clientId: selectedProject.clientId,
        items: [{ description: formData.description, quantity: 1, rate: Number(formData.amount) }],
        taxRate: 18,
        billingPeriod: 'Current Month'
      });
      setShowModal(false);
      window.location.reload();
    } catch (err: any) {
      alert('Failed to create invoice: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Invoices</h2>
          <p className="text-sm text-gray-500 mt-1">Manage project billing and track payment status</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition shadow-md shadow-blue-500/20 hover:-translate-y-0.5"
        >
          <FileText size={18} /> Create Quick Invoice
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><FileText size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Invoiced</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(invoices?.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0) || 0)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Paid (Received)</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(invoices?.filter((i:any) => i.status === 'PAID').reduce((acc: number, curr: any) => acc + (curr.total || 0), 0) || 0)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Clock size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(invoices?.filter((i:any) => i.status === 'PENDING').reduce((acc: number, curr: any) => acc + (curr.total || 0), 0) || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-2">
          {['ALL', 'PENDING', 'PAID', 'OVERDUE'].map(status => (
            <button 
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === status ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice / Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredInvoices?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No invoices found for this filter.</td>
                </tr>
              ) : (
                filteredInvoices?.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-xs text-gray-500">{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.project?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-gray-900">{formatCurrency(invoice.total || 0)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                        invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {invoice.status === 'PENDING' && (
                        <button 
                          onClick={async () => {
                            try {
                              // 1. Create order on backend
                              const { data: order } = await api.post('/payments/create-order', {
                                invoiceId: invoice.id,
                                amount: invoice.total
                              });
                              
                              // 2. Load Razorpay script dynamically
                              const script = document.createElement('script');
                              script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                              script.onload = () => {
                                const options = {
                                  key: 'rzp_test_YOUR_KEY_HERE', // Replace with your test key ID for frontend
                                  amount: order.amount,
                                  currency: 'INR',
                                  name: 'BuildFlow ERP',
                                  description: `Payment for Invoice ${invoice.invoiceNumber}`,
                                  order_id: order.id,
                                  handler: async function (response: any) {
                                    // 3. Verify on backend
                                    await api.post('/payments/verify', {
                                      ...response,
                                      paymentId: order.paymentId // Need to return payment ID from create-order
                                    });
                                    alert('Payment successful!');
                                    window.location.reload();
                                  },
                                  theme: { color: '#2563eb' }
                                };
                                const rzp = new (window as any).Razorpay(options);
                                rzp.open();
                              };
                              document.body.appendChild(script);
                            } catch (err) {
                              alert('Failed to initiate payment. Ensure Razorpay keys are in backend .env');
                            }
                          }}
                          className="text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg mr-4 font-semibold inline-flex items-center gap-1 transition"
                        >
                          Pay Now
                        </button>
                      )}
                      <button className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1 mr-4">
                        <Download size={14} /> PDF
                      </button>
                      <button className="text-slate-600 hover:text-slate-900">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                Create New Invoice
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
                <select 
                  required
                  value={formData.projectId}
                  onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Project --</option>
                  {projects?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.client?.name || 'No Client'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Milestone 1 - Foundation"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  placeholder="e.g. 50000"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
