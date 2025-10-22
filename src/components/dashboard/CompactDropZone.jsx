import { X, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import FilterModal from "./FilterModal";

export default function CompactDropZone({
  title,
  fields,
  onDrop,
  onRemove,
  acceptTypes = [],
  maxFields = 5,
  emptyMessage,
  zoneName,
  getFieldZone,
  onDropField,
  pillBgColor = "#DEE8FA",
  pillBorderColor = "border-blue-100",
  allFields = [],
  getFieldData,
  onUpdateField = () => {}
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedFieldForFilter, setSelectedFieldForFilter] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const fieldId = e.dataTransfer.getData('text/plain');
    onDrop(fieldId);
  };

  const handlePillDragStart = (e, fieldId) => {
    e.dataTransfer.setData('text/plain', fieldId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.field-pill-dropdown')) {
      setOpenDropdown(null);
      setOpenSubMenu(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const aggregationOptions = [
    { value: 'sum', label: 'Sum' },
    { value: 'average', label: 'Average' },
    { value: 'count', label: 'Count' },
    { value: 'unique_count', label: 'Unique Count' },
    { value: 'minimum', label: 'Minimum' },
    { value: 'maximum', label: 'Maximum' }
  ];

  const sortOptions = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' }
  ];

  const filterOperators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Does not equal' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does not contain' },
    { value: 'starts_with', label: 'Starts with' },
    { value: 'ends_with', label: 'Ends with' }
  ];

  const handleDropdownClick = (e, fieldId) => {
    e.stopPropagation();
    e.preventDefault();
    
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    setDropdownPosition({
      top: rect.bottom + scrollTop,
      left: rect.left + scrollLeft
    });
    
    setOpenDropdown(openDropdown === fieldId ? null : fieldId);
    setOpenSubMenu(null);
  };

  const handleSubMenuEnter = (menu) => {
    setOpenSubMenu(menu);
  };

  const handleOptionClick = (e, fieldId, type, value) => {
    e.stopPropagation();
    e.preventDefault();
    onUpdateField(fieldId, { [type]: value });
    setOpenDropdown(null);
    setOpenSubMenu(null);
  };

  const handleFilterClick = (e, fieldId) => {
    e.stopPropagation();
    e.preventDefault();
    const fieldData = getFieldData(fieldId);
    setSelectedFieldForFilter(fieldData);
    setIsFilterModalOpen(true);
    setOpenDropdown(null);
    setOpenSubMenu(null);
  };

  const handleFilterApply = (selectedValues) => {
    if (selectedFieldForFilter) {
      onUpdateField(selectedFieldForFilter.id, {
        filter: {
          type: 'in',
          values: selectedValues
        }
      });
    }
  };

  const isXAxisZone = zoneName === 'xAxis';

  return (
    <>
      <div className="w-full mb-2">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex items-center min-h-[32px] h-8 border border-gray-200 rounded px-2 py-0.5 transition-all duration-200 overflow-visible whitespace-nowrap ${
            isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
          }`}
          style={{ minWidth: 0 }}
        >
          <span className="text-xs text-gray-800 font-semibold select-none mr-2 flex-shrink-0">
            {title} <span className="mx-1">|</span>
          </span>
          {fields.length === 0 ? (
            <span className="text-xs text-gray-400 select-none">
              {emptyMessage}
            </span>
          ) : (
            <div className="flex gap-1 flex-wrap">
              {fields.map((fieldId) => {
                const fieldData = getFieldData(fieldId);
                if (!fieldData) return null;

                return (
                  <div key={fieldId} className="relative field-pill-dropdown">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shadow-sm cursor-move gap-1"
                      style={{ backgroundColor: pillBgColor }}
                      draggable
                      onDragStart={e => handlePillDragStart(e, fieldId)}
                    >
                      {fieldData.name}
                      <button
                        type="button"
                        onClick={(e) => handleDropdownClick(e, fieldId)}
                        className="p-0.5 hover:bg-black/5 rounded-full"
                      >
                        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${openDropdown === fieldId ? 'rotate-180' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onRemove(fieldId);
                        }}
                        className="p-0.5 hover:bg-black/5 rounded-full"
                      >
                        <X className="w-3 h-3 text-gray-400" />
                      </button>
                    </span>

                    {/* Dropdown Menu */}
                    {openDropdown === fieldId && (
                      <div 
                        className="fixed z-[9999] bg-white rounded-md shadow-lg border border-gray-200"
                        style={{ 
                          top: `${dropdownPosition.top}px`,
                          left: `${dropdownPosition.left}px`,
                          width: '200px'
                        }}
                      >
                        {isXAxisZone && (
                          <>
                            {/* Filter Option */}
                            <div 
                              className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                              onClick={(e) => handleFilterClick(e, fieldId)}
                            >
                              <span>Filter</span>
                            </div>
                          </>
                        )}

                        {/* Sort Option (common for both) */}
                        <div 
                          className="relative px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between cursor-pointer group"
                          onMouseEnter={() => handleSubMenuEnter('sort')}
                          onMouseLeave={() => handleSubMenuEnter(null)}
                        >
                          <span>Sort</span>
                          <ChevronRight className="w-3 h-3" />
                          
                          {/* Sort Submenu */}
                          {openSubMenu === 'sort' && (
                            <div 
                              className="absolute bg-white rounded-md shadow-lg border border-gray-200"
                              style={{ 
                                left: '100%',
                                top: '0',
                                marginLeft: '4px',
                                width: '150px'
                              }}
                            >
                              {sortOptions.map(option => (
                                <div
                                  key={option.value}
                                  className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                                  onClick={(e) => handleOptionClick(e, fieldId, 'sort', option.value)}
                                >
                                  {option.label}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        fieldData={selectedFieldForFilter}
        onApply={handleFilterApply}
        currentFilters={[]} // You can pass current filters here if you want to show pre-selected values
      />
    </>
  );
} 