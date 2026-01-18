import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { rfpService } from '../services/rfpService';
import type { RFPCreate } from '../types';

export default function CreateRFP() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<RFPCreate>();

  const onSubmit = async (data: RFPCreate) => {
    setIsSubmitting(true);
    try {
      const rfp = await rfpService.createRFP(data);
      toast.success('RFP created successfully! AI has parsed your requirements.');
      navigate(`/rfps/${rfp.rfp_id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create RFP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate('/rfps')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back to RFPs
      </button>

      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New RFP</h1>
          <p className="text-gray-600 mt-2">
            Describe your requirements in plain English. Our AI will parse and structure them automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
          <div>
            <label className="label">RFP Title *</label>
            <input
              {...register('rfp_title', { required: 'Title is required' })}
              className="input"
              placeholder="e.g., Office Furniture Procurement"
            />
            {errors.rfp_title && (
              <p className="text-red-500 text-sm mt-1">{errors.rfp_title.message}</p>
            )}
          </div>

          <div>
            <label className="label">Requirements & Details *</label>
            <div className="relative">
              <textarea
                {...register('rfp_raw_text', {
                  required: 'Requirements are required',
                  minLength: { value: 50, message: 'Please provide more details (at least 50 characters)' },
                })}
                className="input min-h-[200px] resize-y"
                placeholder="Describe what you need in natural language. Include:
- What products/services you need
- Quantity
- Budget range
- Timeline
- Delivery location
- Any specific requirements

Example: I need to buy 30 chairs and 30 tables for my new office. Budget around $15,000-$25,000. Timeline: 4 weeks. Must include 1 year warranty and delivery to Bangalore."
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2 text-primary-600 text-sm">
                <Sparkles size={16} />
                <span>AI will parse this</span>
              </div>
            </div>
            {errors.rfp_raw_text && (
              <p className="text-red-500 text-sm mt-1">{errors.rfp_raw_text.message}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 AI Processing</h4>
            <p className="text-sm text-blue-800">
              Our AI will automatically extract:
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4 list-disc">
              <li>Requirements list</li>
              <li>Budget range</li>
              <li>Timeline</li>
              <li>Delivery location</li>
              <li>Evaluation criteria</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/rfps')}
              className="btn btn-secondary flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <Sparkles size={18} />
                  Create RFP with AI
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
