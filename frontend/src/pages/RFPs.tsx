import { useEffect, useState } from 'react';
import { Plus, Eye, Trash2, Send, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { rfpService } from '../services/rfpService';
import type { RFP } from '../types';
import Loading from '../components/Loading';

export default function RFPs() {
  const [rfps, setRFPs] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    try {
      setLoading(true);
      const data = await rfpService.getAllRFPs();
      setRFPs(data);
    } catch (error) {
      toast.error('Failed to load RFPs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      await rfpService.deleteRFP(id);
      toast.success('RFP deleted successfully');
      loadRFPs();
    } catch (error) {
      toast.error('Failed to delete RFP');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-200 text-gray-700';
      case 'SENT':
        return 'bg-blue-100 text-blue-700';
      case 'EVALUATED':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  if (loading) {
    return <Loading text="Loading RFPs..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RFPs</h1>
          <p className="text-gray-600 mt-2">Manage your Request for Proposals</p>
        </div>
        <button
          onClick={() => navigate('/rfps/create')}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Create RFP
        </button>
      </div>

      {rfps.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No RFPs yet</h3>
          <p className="text-gray-600 mb-4">Create your first RFP to get started</p>
          <button onClick={() => navigate('/rfps/create')} className="btn btn-primary">
            Create Your First RFP
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rfps.map((rfp) => (
            <div
              key={rfp.rfp_id}
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/rfps/${rfp.rfp_id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {rfp.rfp_title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rfp.rfp_status)}`}>
                  {rfp.rfp_status}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {rfp.rfp_raw_text}
              </p>

              {rfp.rfp_structured_json && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium">
                      ${rfp.rfp_structured_json.budget_range?.min?.toLocaleString()} - 
                      ${rfp.rfp_structured_json.budget_range?.max?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Timeline:</span>
                    <span className="font-medium">{rfp.rfp_structured_json.timeline}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  {new Date(rfp.rfp_created_at).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/rfps/${rfp.rfp_id}`);
                    }}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  {rfp.rfp_status === 'DRAFT' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/rfps/${rfp.rfp_id}/send`);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Send RFP"
                    >
                      <Send size={18} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(rfp.rfp_id, rfp.rfp_title);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
