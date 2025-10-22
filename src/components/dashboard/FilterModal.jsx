import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function FilterModal({ 
  isOpen, 
  onClose, 
  fieldData, 
  onApply,
  currentFilters = []
}) {
  const [selectedValues, setSelectedValues] = useState(new Set(currentFilters));
  const [searchQuery, setSearchQuery] = useState('');
  const [allSelected, setAllSelected] = useState(false);

  // Get unique values for the field based on its type
  const getFieldValues = () => {
    switch (fieldData?.id) {
      case 'lead_source':
        return ['Organic Search', 'Paid Search', 'Social Media', 'Email', 'Direct'];
      case 'region':
        return ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
      case 'industry':
        return ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Others'];
      case 'stage':
        return ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
      case 'campaign_name':
        return ['Summer Sale', 'Black Friday', 'Product Launch', 'Brand Awareness', 'Holiday Special'];
      case 'device':
        return ['Desktop', 'Mobile', 'Tablet'];
      default:
        return ['Value 1', 'Value 2', 'Value 3', 'Value 4', 'Value 5'];
    }
  };

  const values = getFieldValues();
  const filteredValues = values.filter(value => 
    value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Update allSelected state based on whether all values are selected
    setAllSelected(values.length === selectedValues.size);
  }, [selectedValues]);

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedValues(new Set());
    } else {
      setSelectedValues(new Set(values));
    }
    setAllSelected(!allSelected);
  };

  const handleToggleValue = (value) => {
    const newSelected = new Set(selectedValues);
    if (newSelected.has(value)) {
      newSelected.delete(value);
    } else {
      newSelected.add(value);
    }
    setSelectedValues(newSelected);
  };

  const handleApply = () => {
    onApply(Array.from(selectedValues));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-lg w-[400px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-[16px] font-medium text-gray-900">
            Filter: {fieldData?.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search values..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Select All */}
        <div className="px-4 py-2 border-b border-gray-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleToggleAll}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-[14px] font-medium text-gray-700">Select All</span>
          </label>
        </div>

        {/* Values List */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="space-y-1">
            {filteredValues.map((value) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={selectedValues.has(value)}
                  onChange={() => handleToggleValue(value)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[14px] text-gray-700">{value}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-[14px] font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
} 