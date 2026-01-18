import { useEffect, useState } from 'react';
import { FileText, Users, CheckCircle, Clock } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { rfpService } from '../services/rfpService';
import type { Vendor, RFP } from '../types';
import Loading from '../components/Loading';

export default function Dashboard() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [rfps, setRFPs] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [vendorsData, rfpsData] = await Promise.all([
        vendorService.getAllVendors(),
        rfpService.getAllRFPs(),
      ]);
      setVendors(vendorsData);
      setRFPs(rfpsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading dashboard..." />;
  }

  const stats = [
    {
      label: 'Total Vendors',
      value: vendors.length,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Total RFPs',
      value: rfps.length,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      label: 'Active RFPs',
      value: rfps.filter((r) => r.rfp_status === 'SENT').length,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      label: 'Evaluated RFPs',
      value: rfps.filter((r) => r.rfp_status === 'EVALUATED').length,
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
  ];

  const recentRFPs = rfps.slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to Smart Request for Proposal Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent RFPs */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent RFPs</h2>
        {recentRFPs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No RFPs created yet</p>
        ) : (
          <div className="space-y-3">
            {recentRFPs.map((rfp) => (
              <div
                key={rfp.rfp_id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{rfp.rfp_title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Created: {new Date(rfp.rfp_created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    rfp.rfp_status === 'DRAFT'
                      ? 'bg-gray-200 text-gray-700'
                      : rfp.rfp_status === 'SENT'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {rfp.rfp_status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
