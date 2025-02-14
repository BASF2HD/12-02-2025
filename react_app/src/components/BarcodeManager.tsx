
import React, { useState } from 'react';
import { X, Plus, Save, Printer } from 'lucide-react';

interface LabelTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  labelsPerRow: number;
  isLandscape: boolean;
  hasWriteArea: boolean;
  writeAreaWidth: number;
  writeAreaAnchor: 'Top' | 'Bottom';
  printerId: string;
}

interface Props {
  onClose: () => void;
}

export function BarcodeManager({ onClose }: Props) {
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<LabelTemplate>({
    id: '',
    name: '',
    width: 25,
    height: 69,
    labelsPerRow: 1,
    isLandscape: false,
    hasWriteArea: true,
    writeAreaWidth: 33,
    writeAreaAnchor: 'Top',
    printerId: ''
  });

interface LabelElement {
  type: 'text' | 'barcode' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
}

export function BarcodeManager({ onClose }: { onClose: () => void }) {
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<LabelTemplate>({
    id: '',
    name: '',
    width: 25,
    height: 69,
    labelsPerRow: 1,
    isLandscape: false,
    hasWriteArea: true,
    writeAreaWidth: 33,
    writeAreaAnchor: 'Top',
    printerId: ''
  });
  const [elements, setElements] = useState<LabelElement[]>([]);

  const handleSaveTemplate = () => {
    if (!currentTemplate.name.trim()) {
      alert('Please enter a template name');
      return;
    }
    
    if (currentTemplate.id) {
      setTemplates(prev => 
        prev.map(t => t.id === currentTemplate.id ? currentTemplate : t)
      );
    } else {
      setTemplates(prev => [...prev, { ...currentTemplate, id: Date.now().toString() }]);
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      if (currentTemplate.id === templateId) {
        setCurrentTemplate({
          id: '',
          name: '',
          width: 25,
          height: 69,
          labelsPerRow: 1,
          isLandscape: false,
          hasWriteArea: true,
          writeAreaWidth: 33,
          writeAreaAnchor: 'Top',
          printerId: ''
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[1200px] max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-medium">Barcode Label Template</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Label Configuration</h3>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  value={currentTemplate.name}
                  onChange={e => setCurrentTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                  className="w-full text-sm border-gray-300 rounded-md mb-4"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700">Width (mm)</label>
                  <input
                    type="number"
                    value={currentTemplate.width}
                    onChange={e => setCurrentTemplate(prev => ({ ...prev, width: Number(e.target.value) }))}
                    className="mt-1 w-full text-sm border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Height (mm)</label>
                  <input
                    type="number"
                    value={currentTemplate.height}
                    onChange={e => setCurrentTemplate(prev => ({ ...prev, height: Number(e.target.value) }))}
                    className="mt-1 w-full text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700">Labels per row</label>
                <input
                  type="number"
                  value={currentTemplate.labelsPerRow}
                  onChange={e => setCurrentTemplate(prev => ({ ...prev, labelsPerRow: Number(e.target.value) }))}
                  className="mt-1 w-full text-sm border-gray-300 rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentTemplate.isLandscape}
                    onChange={e => setCurrentTemplate(prev => ({ ...prev, isLandscape: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Landscape orientation</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentTemplate.hasWriteArea}
                    onChange={e => setCurrentTemplate(prev => ({ ...prev, hasWriteArea: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Restricted write area</span>
                </label>
              </div>

              {currentTemplate.hasWriteArea && (
                <>
                  <div>
                    <label className="block text-sm text-gray-700">Write area width (mm)</label>
                    <input
                      type="number"
                      value={currentTemplate.writeAreaWidth}
                      onChange={e => setCurrentTemplate(prev => ({ ...prev, writeAreaWidth: Number(e.target.value) }))}
                      className="mt-1 w-full text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700">Write area anchor</label>
                    <select
                      value={currentTemplate.writeAreaAnchor}
                      onChange={e => setCurrentTemplate(prev => ({ ...prev, writeAreaAnchor: e.target.value as 'Top' | 'Bottom' }))}
                      className="mt-1 w-full text-sm border-gray-300 rounded-md"
                    >
                      <option value="Top">Top</option>
                      <option value="Bottom">Bottom</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm text-gray-700">Assigned Printer</label>
                <select
                  value={currentTemplate.printerId}
                  onChange={e => setCurrentTemplate(prev => ({ ...prev, printerId: e.target.value }))}
                  className="mt-1 w-full text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select printer</option>
                  <option value="printer1">Brady BBP11/BBP12</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveTemplate}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-4">Label Preview</h3>
              <div 
                className="border-2 border-gray-300 rounded-md"
                style={{
                  width: `${currentTemplate.width * 4}px`,
                  height: `${currentTemplate.height * 4}px`,
                  transform: currentTemplate.isLandscape ? 'rotate(90deg)' : 'none'
                }}
              >
                {currentTemplate.hasWriteArea && (
                  <div 
                    className="bg-gray-100 border border-dashed border-gray-400"
                    style={{
                      width: `${currentTemplate.writeAreaWidth * 4}px`,
                      height: '100%',
                      position: 'absolute',
                      [currentTemplate.writeAreaAnchor.toLowerCase()]: 0
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-medium mb-4">Saved Templates</h3>
            <div className="grid grid-cols-3 gap-4">
              {templates.map(template => (
                <div 
                  key={template.id}
                  className="p-4 border rounded-md hover:bg-gray-50 cursor-pointer"
                  onClick={() => setCurrentTemplate(template)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{template.name || 'Untitled Template'}</h4>
                      <p className="text-sm text-gray-500">
                        {template.width}mm × {template.height}mm
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Printer className="h-4 w-4 text-gray-400" />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
