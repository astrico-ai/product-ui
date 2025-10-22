import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function CalculatedFieldModal({ isOpen, onClose, onSubmit, availableFields, dataset }) {
  const [fieldName, setFieldName] = useState("");
  const [formula, setFormula] = useState("");
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const formulaRef = useRef(null);

  const allFieldNames = [...dataset.dimensions, ...dataset.metrics].map(f => f.name);

  const handleFormulaChange = (e) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    
    setFormula(value);
    setCursorPosition(position);
    
    // Find the current word being typed
    const beforeCursor = value.substring(0, position);
    const afterCursor = value.substring(position);
    
    // Find the start of the current word (after space, operator, or parenthesis)
    const wordStart = Math.max(
      beforeCursor.lastIndexOf(' '),
      beforeCursor.lastIndexOf('+'),
      beforeCursor.lastIndexOf('-'),
      beforeCursor.lastIndexOf('*'),
      beforeCursor.lastIndexOf('/'),
      beforeCursor.lastIndexOf('('),
      beforeCursor.lastIndexOf(')')
    ) + 1;
    
    const currentWord = beforeCursor.substring(wordStart);
    
    if (currentWord.length > 0) {
      // Filter field names that match the current word
      const matchingFields = allFieldNames.filter(name =>
        name.toLowerCase().includes(currentWord.toLowerCase())
      );
      
      if (matchingFields.length > 0) {
        setSuggestions(matchingFields);
        setShowSuggestions(true);
        setSelectedSuggestion(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        insertSuggestion(suggestions[selectedSuggestion]);
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const insertSuggestion = (fieldName) => {
    const beforeCursor = formula.substring(0, cursorPosition);
    const afterCursor = formula.substring(cursorPosition);
    
    // Find the start of the current word
    const wordStart = Math.max(
      beforeCursor.lastIndexOf(' '),
      beforeCursor.lastIndexOf('+'),
      beforeCursor.lastIndexOf('-'),
      beforeCursor.lastIndexOf('*'),
      beforeCursor.lastIndexOf('/'),
      beforeCursor.lastIndexOf('('),
      beforeCursor.lastIndexOf(')')
    ) + 1;
    
    const beforeWord = beforeCursor.substring(0, wordStart);
    const newFormula = beforeWord + fieldName + afterCursor;
    const newCursorPosition = beforeWord.length + fieldName.length;
    
    setFormula(newFormula);
    setShowSuggestions(false);
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      if (formulaRef.current) {
        formulaRef.current.focus();
        formulaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    
    if (!fieldName.trim()) {
      newErrors.fieldName = "Field name is required";
    }
    
    if (!formula.trim()) {
      newErrors.formula = "Formula is required";
    } else {
      // Basic validation - check if referenced fields exist
      const fieldNames = [...dataset.dimensions, ...dataset.metrics].map(f => f.name);
      const formulaWords = formula.split(/[\s+\-*/()]+/).filter(word => word.trim());
      
      const invalidFields = formulaWords.filter(word => 
        isNaN(word) && // Not a number
        !['SUM', 'AVG', 'COUNT', 'MAX', 'MIN'].includes(word.toUpperCase()) && // Not a function
        !fieldNames.includes(word) // Not a valid field name
      );
      
      if (invalidFields.length > 0) {
        newErrors.formula = `Unknown fields: ${invalidFields.join(', ')}`;
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit the calculated field
    onSubmit({ name: fieldName, formula });
    
    // Reset form
    setFieldName("");
    setFormula("");
    setErrors({});
  };

  const handleClose = () => {
    setFieldName("");
    setFormula("");
    setErrors({});
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestion(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Calculated Field</DialogTitle>
          <DialogDescription>
            Create a new calculated field using a formula with existing fields.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Field Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field Name
            </label>
            <input
              type="text"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="e.g., CTR, Conversion Rate"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.fieldName ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.fieldName && (
              <p className="mt-1 text-xs text-red-600">{errors.fieldName}</p>
            )}
          </div>

          {/* Formula */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formula
            </label>
            <textarea
              ref={formulaRef}
              value={formula}
              onChange={handleFormulaChange}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Clicks / Impressions * 100"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.formula ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => insertSuggestion(suggestion)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${
                      index === selectedSuggestion ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-xs">
                      {dataset.dimensions.find(f => f.name === suggestion) ? '🏷️' : '#️⃣'}
                    </span>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            {errors.formula && (
              <p className="mt-1 text-xs text-red-600">{errors.formula}</p>
            )}
          </div>

          {/* Formula Examples */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formula Examples
            </label>
            <div className="space-y-1 text-xs text-gray-600">
              <div>• <code className="bg-gray-100 px-1 rounded">Clicks / Impressions * 100</code> - Click-through rate</div>
              <div>• <code className="bg-gray-100 px-1 rounded">Deal Value / Lead Count</code> - Average deal size</div>
              <div>• <code className="bg-gray-100 px-1 rounded">Cost / Clicks</code> - Cost per click</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3551F3] hover:bg-[#2B41D9] text-white rounded-lg transition-colors"
            >
              Create Field
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 