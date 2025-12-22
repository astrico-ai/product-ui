import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { Search, ArrowRight } from 'lucide-react';
import ConnectCardModal from '@/components/ConnectCardModal';
import * as connectorService from '@/services/connectorService';

export default function ConnectorGallery() {
  const navigate = useNavigate();
  const [connectors, setConnectors] = useState([]);
  const [filteredConnectors, setFilteredConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [connectCardOpen, setConnectCardOpen] = useState(false);
  const [connectCardUrl, setConnectCardUrl] = useState('');
  const [selectedConnector, setSelectedConnector] = useState(null);

  useEffect(() => {
    loadConnectors();
  }, []);

  useEffect(() => {
    filterConnectors();
  }, [connectors, searchTerm, filterStatus]);

  const loadConnectors = async () => {
    try {
      setLoading(true);
      const response = await connectorService.listAvailableConnectors();
      setConnectors(response.connectors);
    } catch (error) {
      console.error('Failed to load connectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterConnectors = () => {
    let filtered = connectors;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name?.toLowerCase().includes(term) ||
          c.description?.toLowerCase().includes(term) ||
          c.category?.toLowerCase().includes(term)
      );
    }

    setFilteredConnectors(filtered);
  };

  const handleConnect = async (connectorId, connectorName) => {
    try {
      setLoading(true);
      setSelectedConnector(connectorName);

      // Call backend to create connector and get Connect Card URL
      const response = await fetch(`http://localhost:3000/api/connectors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: connectorId,
          name: connectorName || `${connectorName} Connection`
        })
      });

      if (!response.ok) throw new Error('Failed to create connector');
      const data = await response.json();

      // Store connection ID in localStorage so callback page can access it
      localStorage.setItem('currentConnectionId', data.connectionId);
      localStorage.setItem('currentConnectorName', connectorName);

      // Open modal with Connect Card URL instead of redirecting
      setConnectCardUrl(data.connectCardUrl);
      setConnectCardOpen(true);
      setLoading(false);
    } catch (error) {
      console.error('Failed to create connector:', error);
      setLoading(false);
      alert('Failed to connect to ' + connectorName);
    }
  };

  const handleViewConnected = () => {
    navigate('/connectors/dashboard');
  };

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Data Connectors
              </h1>
              <p className="text-gray-600">
                Browse and connect your data sources to sync with Astrico
              </p>
            </div>
            <button
              onClick={handleViewConnected}
              className="px-4 py-2 bg-[#3551F3] text-white rounded-lg hover:bg-[#2B41D9] transition-colors font-medium flex items-center gap-2"
            >
              View Connected
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search connectors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3551F3]/20 focus:border-[#3551F3]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3551F3]/20 focus:border-[#3551F3]"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="coming_soon">Coming Soon</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3551F3] mb-4"></div>
              <p className="text-gray-600">Loading connectors...</p>
            </div>
          </div>
        ) : filteredConnectors.length === 0 ? (
          <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-gray-100">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-2">No connectors found</p>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <>
            {/* Connectors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredConnectors.map((connector) => (
                <div
                  key={connector.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Logo */}
                  <div className="mb-4 h-16 flex items-center justify-center bg-gray-50 rounded-lg">
                    <img
                      src={connector.logo}
                      alt={connector.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.target.src =
                          'https://via.placeholder.com/100x50?text=Logo';
                      }}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {connector.name || 'Unknown Connector'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {connector.description || 'No description available'}
                  </p>

                  {/* Status */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-gray-500">
                      {connector.category || 'Data Source'}
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        connector.status === 'available'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {connector.status === 'available' ? 'Available' : 'Coming Soon'}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-gray-500 mb-4 space-y-1">
                    {connector.setupTime && <p>Setup time: {connector.setupTime}</p>}
                    {connector.estimatedRows && <p>Est. rows: {connector.estimatedRows.toLocaleString()}</p>}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleConnect(connector.id, connector.name)}
                    disabled={connector.status !== 'available'}
                    className={`w-full py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      connector.status === 'available'
                        ? 'bg-[#3551F3] text-white hover:bg-[#2B41D9] cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {connector.status === 'available' ? (
                      <>
                        Connect
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      'Notify Me'
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Results Count */}
            <div className="text-center text-sm text-gray-500">
              Showing {filteredConnectors.length} of {connectors.length} connectors
            </div>
          </>
        )}
      </div>

      {/* Connect Card Modal */}
      <ConnectCardModal
        isOpen={connectCardOpen}
        onClose={() => setConnectCardOpen(false)}
        connectCardUrl={connectCardUrl}
        connectorName={selectedConnector}
      />
    </MainLayout>
  );
}
