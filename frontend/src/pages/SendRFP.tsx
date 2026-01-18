import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { rfpService } from '../services/rfpService';
import { vendorService } from '../services/vendorService';
import type { Vendor } from '../types';
import Loading from '../components/Loading';

export default function SendRFP() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const data = await vendorService.getAllVendors();
      setVendors(data);
    } catch (error) {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const toggleVendor = (vendorId: number) => {
    setSelectedVendors((prev) =>
      prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleSend = async () => {
    if (selectedVendors.length === 0) {
      toast.error('Please select at least one vendor');
      return;
    }

    setSending(true);
    try {
      await rfpService.sendRFP(Number(id), selectedVendors);
      toast.success(`RFP sent to ${selectedVendors.length} vendor(s) successfully!`);
      navigate(`/rfps/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to send RFP');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <Loading text="Loading vendors..." />;
  }

  return (
    <div>
      <button
        onClick={() => navigate(`/rfps/${id}`)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back to RFP
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Send RFP to Vendors</h1>
        <p className="text-gray-600 mt-2">Select vendors to send this RFP to</p>
      </div>

      {vendors.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors available</h3>
          <p className="text-gray-600 mb-4">Create vendors first before sending RFPs</p>
          <button
            onClick={() => navigate('/vendors')}
            className="btn btn-primary"
          >
            Go to Vendors
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Available Vendors ({vendors.length})
              </h2>
              <div className="text-sm text-gray-600">
                Selected: <span className="font-semibold text-primary-600">{selectedVendors.length}</span>
              </div>
            </div>

            <div className="space-y-2">
              {vendors.map((vendor) => (
                <label
                  key={vendor.vendor_id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedVendors.includes(vendor.vendor_id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedVendors.includes(vendor.vendor_id)}
                    onChange={() => toggleVendor(vendor.vendor_id)}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{vendor.vendor_name}</h3>
                    <p className="text-sm text-gray-600">{vendor.vendor_email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium">
                      {vendor.vendor_rating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/rfps/${id}`)}
              className="btn btn-secondary flex-1"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={sending || selectedVendors.length === 0}
            >
              {sending ? (
                'Sending...'
              ) : (
                <>
                  <Send size={18} />
                  Send to {selectedVendors.length} Vendor{selectedVendors.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
