import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function TitleEditModal({ isOpen, onClose, title, onSave }) {
  const [editedTitle, setEditedTitle] = useState(title || "");
  const [fontSize, setFontSize] = useState("16");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState("left");

  useEffect(() => {
    if (isOpen) {
      setEditedTitle(title || "");
    }
  }, [isOpen, title]);

  const handleSave = () => {
    onSave(editedTitle);
    onClose();
  };

  const handleReset = () => {
    setEditedTitle("");
    setFontSize("16");
    setFontFamily("Arial");
    setIsBold(false);
    setIsItalic(false);
    setIsUnderline(false);
    setTextAlign("left");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit Title</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formatting Toolbar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
            </select>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm w-16"
            >
              <option value="12">12</option>
              <option value="14">14</option>
              <option value="16">16</option>
              <option value="18">18</option>
              <option value="20">20</option>
              <option value="24">24</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsBold(!isBold)}
              className={`px-2 py-1 border rounded text-sm font-bold ${
                isBold ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300'
              }`}
            >
              B
            </button>
            <button
              onClick={() => setIsItalic(!isItalic)}
              className={`px-2 py-1 border rounded text-sm italic ${
                isItalic ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300'
              }`}
            >
              I
            </button>
            <button
              onClick={() => setIsUnderline(!isUnderline)}
              className={`px-2 py-1 border rounded text-sm underline ${
                isUnderline ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300'
              }`}
            >
              U
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            <button
              onClick={() => setTextAlign('left')}
              className={`px-2 py-1 border rounded text-sm ${
                textAlign === 'left' ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300'
              }`}
            >
              ⬅
            </button>
            <button
              onClick={() => setTextAlign('center')}
              className={`px-2 py-1 border rounded text-sm ${
                textAlign === 'center' ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300'
              }`}
            >
              ↔
            </button>
            <button
              onClick={() => setTextAlign('right')}
              className={`px-2 py-1 border rounded text-sm ${
                textAlign === 'right' ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300'
              }`}
            >
              ➡
            </button>
          </div>
        </div>

        {/* Text Input */}
        <div className="p-4">
          <textarea
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Enter title..."
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              fontFamily: fontFamily,
              fontSize: `${fontSize}px`,
              fontWeight: isBold ? 'bold' : 'normal',
              fontStyle: isItalic ? 'italic' : 'normal',
              textDecoration: isUnderline ? 'underline' : 'none',
              textAlign: textAlign
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Reset
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 