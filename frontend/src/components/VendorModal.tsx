import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { Vendor, VendorCreate } from '../types';

interface VendorModalProps {
  vendor: Vendor | null;
  onClose: () => void;
  onSubmit: (data: VendorCreate) => void;
}

export default function VendorModal({ vendor, onClose, onSubmit }: VendorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<VendorCreate>({
    defaultValues: vendor ? {
      vendor_name: vendor.vendor_name,
      vendor_email: vendor.vendor_email,
      vendor_rating: vendor.vendor_rating || undefined,
    } : undefined,
  });

  const handleFormSubmit = async (data: VendorCreate) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {vendor ? 'Edit Vendor' : 'Create New Vendor'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div>
            <label className="label">Vendor Name *</label>
            <input
              {...register('vendor_name', { required: 'Vendor name is required' })}
              className="input"
              placeholder="Enter vendor name"
            />
            {errors.vendor_name && (
              <p className="text-red-500 text-sm mt-1">{errors.vendor_name.message}</p>
            )}
          </div>

          <div>
            <label className="label">Email *</label>
            <input
              {...register('vendor_email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              type="email"
              className="input"
              placeholder="vendor@example.com"
            />
            {errors.vendor_email && (
              <p className="text-red-500 text-sm mt-1">{errors.vendor_email.message}</p>
            )}
          </div>

          <div>
            <label className="label">Rating (Optional)</label>
            <input
              {...register('vendor_rating', {
                min: { value: 0, message: 'Rating must be between 0 and 5' },
                max: { value: 5, message: 'Rating must be between 0 and 5' },
              })}
              type="number"
              step="0.1"
              className="input"
              placeholder="4.5"
            />
            {errors.vendor_rating && (
              <p className="text-red-500 text-sm mt-1">{errors.vendor_rating.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : vendor ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
