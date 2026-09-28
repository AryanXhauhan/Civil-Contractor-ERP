import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects, useClients } from '../api/queries';
import { FolderPlus, MapPin, Building2, Calendar, X, HardHat } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/axios';

const PROJECT_TYPES = [
  'Road Construction',
  'Building Construction',
  'Bridge Construction',
  'Civil Works',
  'Municipal (Nagar Nigam)',
  'Maintenance & Repair',
  'Water Supply & Sanitation',
  'Electrical & HVAC',
  'Other'
];

export default function Projects() {
  const { data: projects, isLoading } = useProjects();
  const { data: clients } = useClients();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    location: '',
    type: 'Building Construction',
    contractValue: '',
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading projects...</div>;
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', {
        name: formData.name,
        clientName: formData.clientName, // sending clientName instead of clientId
        location: formData.location,
        type: formData.type,
        contractValue: Number(formData.contractValue) || 0,
        status: 'PLANNING'
      });
      setShowModal(false);
      window.location.reload();
    } catch (err: any) {
      alert('Failed to create project: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500 mt-1">Manage construction sites and contracts</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition"
        >
          <FolderPlus size={18} /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects?.map((project: any) => (
          <Link 
            key={project.id} 
            to={`/projects/${project.id}`}
            className="group block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{project.name}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                project.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 
                project.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border border-green-100' : 
                'bg-gray-100 text-gray-700 border border-gray-200'
              }`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600 gap-2">
                <Building2 size={16} className="text-gray-400" />
                <span>{project.client?.name || 'Client Not Found'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 gap-2">
                <HardHat size={16} className="text-gray-400" />
                <span className="bg-slate-100 px-2 rounded font-medium text-slate-700">{project.type || 'N/A'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span>{project.location}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span>{project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : 'TBD'} - {project.expectedEndDate ? format(new Date(project.expectedEndDate), 'MMM d, yyyy') : 'TBD'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 font-medium">Contract Value</p>
                <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                  {formatCurrency(project.contractValue)}
                </p>
              </div>
              <div className="text-blue-600 font-medium text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                View Details &rarr;
              </div>
            </div>
          </Link>
        ))}
        
        {projects?.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            No active projects found.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FolderPlus size={18} className="text-blue-600" />
                Create New Project
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Skyline Residency Phase 1"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project/Tender Type</label>
                <select 
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {PROJECT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client / Authority Name</label>
                <input 
                  type="text"
                  required
                  list="client-suggestions"
                  placeholder="Type new client or select..."
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <datalist id="client-suggestions">
                  {clients?.map((c: any) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bandra West, Mumbai"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Value (₹)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  placeholder="e.g. 15000000"
                  value={formData.contractValue}
                  onChange={(e) => setFormData({...formData, contractValue: e.target.value})}
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
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
