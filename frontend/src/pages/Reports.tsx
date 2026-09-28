import { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';

export default function Reports() {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState('');

  // We are hardcoding a projectId for demo purposes. In reality, you'd select from a dropdown.
  const demoProjectId = "demo-project-id"; 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setExtractedData(null);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsExtracting(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', demoProjectId); // Required by backend

    try {
      const { data } = await api.post('/ai/extract-daily-report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setExtractedData(data.extractedData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to extract data. Is GEMINI_API_KEY set?');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Daily Site Reports (AI Extraction)</h2>
        <p className="text-sm text-gray-500 mt-1">Upload a photo of a handwritten site report or material receipt. Our AI will automatically digitize it.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700">
              {file ? file.name : 'Click or drag photo/PDF here'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG, PDF up to 10MB</p>
          </div>

          <button 
            onClick={handleUpload}
            disabled={!file || isExtracting}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition"
          >
            {isExtracting ? (
              <><Loader2 className="animate-spin" size={20} /> Extracting Data (Gemini)...</>
            ) : (
              'Extract with AI'
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2 border border-red-100">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Extracted Information</h3>
          
          {extractedData ? (
            <div className="flex-1 space-y-4">
              <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2 text-green-700 mb-6">
                <CheckCircle2 size={20} />
                <span className="text-sm font-medium">Data extracted successfully</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Date</label>
                  <p className="text-gray-900 font-medium">{extractedData.date || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Weather</label>
                  <p className="text-gray-900 font-medium">{extractedData.weather || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Workforce</label>
                  <p className="text-gray-900 font-medium">{extractedData.workforceCount || 0} workers</p>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Work Completed</label>
                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 border border-gray-100">
                  {extractedData.workCompleted || 'No details'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Materials Used</label>
                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 border border-gray-100">
                  {extractedData.materialsUsed || 'No details'}
                </div>
              </div>
              
              <button className="mt-4 w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition">
                Save to Database
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
              <CheckSquareIcon />
              <p className="mt-4 text-sm">Extracted fields will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckSquareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  );
}
