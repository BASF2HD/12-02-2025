import React from 'react';
import { Settings2, RotateCcw } from 'lucide-react';
import type { ColumnConfig } from '../hooks/useTableColumns';

interface TableColumnManagerProps {
  columns: ColumnConfig[];
  onToggleVisibility: (columnId: string) => void;
  onReset: () => void;
}

export function TableColumnManager({ columns, onToggleVisibility, onReset }: TableColumnManagerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
      >
        <Settings2 className="h-3.5 w-3.5 mr-1" />
        Columns
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
          <div className="p-2 border-b flex justify-between items-center">
            <h3 className="text-xs font-medium text-gray-700">Manage Columns</h3>
            <button
              onClick={onReset}
              className="text-gray-500 hover:text-gray-700"
              title="Reset to default"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {columns.map(column => (
              <div key={column.id} className="flex items-center py-1">
                <input
                  type="checkbox"
                  id={`col-${column.id}`}
                  checked={column.visible}
                  onChange={() => onToggleVisibility(column.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor={`col-${column.id}`}
                  className="ml-2 text-xs text-gray-700 cursor-pointer select-text hover:text-gray-900"
                >
                  {column.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}