import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, TrendingUp, Clock, DollarSign, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { rfpService } from '../services/rfpService';
import type { RFP, VendorResponse, Evaluation } from '../types';
import Loading from '../components/Loading';

export default function RFPDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rfp, setRFP] = useState<RFP | null>(null);
  const [responses, setResponses] = useState<VendorResponse[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    if (id) {
      loadRFPData();
    }
  }, [id]);

  // Poll for responses every 30 seconds if RFP is sent
  useEffect(() => {
    if (rfp?.rfp_status === 'SENT') {
      const interval = setInterval(() => {
        loadResponses();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [rfp?.rfp_status, id]);

  const loadRFPData = async () => {
    try {
      setLoading(true);
      const rfpData = await rfpService.getRFPById(Number(id));
      setRFP(rfpData);
      
      if (rfpData.rfp_status !== 'DRAFT') {
        await loadResponses();
      }
    } catch (error) {
      toast.error('Failed to load RFP details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadResponses = async () => {
    try {
      const responsesData = await rfpService.getRFPResponses(Number(id));
      setResponses(responsesData);
    } catch (error) {
      console.error('Failed to load responses:', error);
    }
  };

  const handleEvaluate = async () => {
    if (responses.length === 0) {
      toast.error('No responses to evaluate');
      return;
    }

    setEvaluating(true);
    try {
      const evaluationData = await rfpService.evaluateRFP(Number(id));
      setEvaluation(evaluationData);
      toast.success('Evaluation completed!');
      loadRFPData(); // Reload to update status
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to evaluate RFP');
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return <Loading text="Loading RFP details..." />;
  }

  if (!rfp) {
    return <div>RFP not found</div>;
  }

  const structured = rfp.rfp_structured_json;

  return (
    <div>
      <button
        onClick={() => navigate('/rfps')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back to RFPs
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{rfp.rfp_title}</h1>
          <p className="text-gray-600 mt-2">
            Created: {new Date(rfp.rfp_created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
          <span
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              rfp.rfp_status === 'DRAFT'
                ? 'bg-gray-200 text-gray-700'
                : rfp.rfp_status === 'SENT'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {rfp.rfp_status}
          </span>
          {rfp.rfp_status === 'DRAFT' && (
            <button
              onClick={() => navigate(`/rfps/${id}/send`)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Send size={18} />
              Send to Vendors
            </button>
          )}
          {rfp.rfp_status === 'SENT' && responses.length > 0 && (
            <button
              onClick={handleEvaluate}
              className="btn btn-primary flex items-center gap-2"
              disabled={evaluating}
            >
              <TrendingUp size={18} />
              {evaluating ? 'Evaluating...' : 'Evaluate Responses'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Raw Description */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{rfp.rfp_raw_text}</p>
          </div>

          {/* AI Parsed Data */}
          {structured && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">AI Parsed Requirements</h2>
              
              {structured.requirements && structured.requirements.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Requirements:</h3>
                  <ul className="space-y-1">
                    {structured.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-primary-600 mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                {structured.budget_range && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="text-green-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Budget Range</p>
                      <p className="font-medium">
                        ${structured.budget_range.min?.toLocaleString()} - 
                        ${structured.budget_range.max?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                
                {structured.timeline && (
                  <div className="flex items-center gap-3">
                    <Calendar className="text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Timeline</p>
                      <p className="font-medium">{structured.timeline}</p>
                    </div>
                  </div>
                )}
                
                {structured.delivery_location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="text-red-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Delivery Location</p>
                      <p className="font-medium">{structured.delivery_location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vendor Responses */}
          {rfp.rfp_status !== 'DRAFT' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Vendor Responses ({responses.length})</h2>
                {rfp.rfp_status === 'SENT' && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} className="animate-pulse" />
                    <span>Polling every 30s</span>
                  </div>
                )}
              </div>

              {responses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock size={48} className="mx-auto mb-3 text-gray-400" />
                  <p>Waiting for vendor responses...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {responses.map((response) => (
                    <div
                      key={response.id}
                      className={`p-4 border-2 rounded-lg ${
                        response.ai_recommended
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Vendor : {response.vendor_name}</h3>
                        {response.ai_recommended && (
                          <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                            ⭐ Recommended
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Price</p>
                          <p className="font-semibold text-lg">
                            ${response.total_price?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Delivery</p>
                          <p className="font-semibold">{response.delivery_days || 'N/A'} days</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Warranty</p>
                          <p className="font-semibold">{response.warranty_years || 'N/A'} years</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Payment Terms</p>
                          <p className="font-semibold text-sm">{response.payment_terms || 'N/A'}</p>
                        </div>
                      </div>

                      {response.ai_score && (
                        <div className="pt-3 border-t border-gray-300">
                          <p className="text-sm text-gray-600">AI Score: <span className="font-semibold">{response.ai_score}/100</span></p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Evaluation Results */}
          {evaluation && (
            <div className="card bg-gradient-to-br from-primary-50 to-purple-50 border-2 border-primary-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="text-primary-600" />
                AI Evaluation Results
              </h2>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Vendor Scores:</h3>
                <div className="space-y-2">
                  {Object.entries(evaluation.recommendations).map(([vendorId, score]) => (
                    <div key={vendorId} className="flex items-center gap-3">
                      <span className="font-medium w-24">Vendor {vendorId}:</span>
                      <div className="flex-1 bg-white rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-primary-600 h-full flex items-center justify-end px-2 text-white text-sm font-medium"
                          style={{ width: `${score}%` }}
                        >
                          {score}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {evaluation.best_vendor_id && (
                <div className="bg-white rounded-lg p-4 border-2 border-green-500">
                  <h3 className="font-semibold text-green-700 mb-2">
                    ⭐ Best Vendor: #{evaluation.best_vendor_id}
                  </h3>
                  <p className="text-gray-700">{evaluation.reasoning}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span className="font-medium">{rfp.rfp_status}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Responses</span>
                <span className="font-medium">{responses.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Created</span>
                <span className="font-medium text-sm">
                  {new Date(rfp.rfp_created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
