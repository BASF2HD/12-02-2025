
import React, { useState } from 'react';
import { X, Upload, FolderTree, FileText, Trash2 } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export function FileAttachmentManager({ onClose }: Props) {
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const [storageLocations, setStorageLocations] = useState([
    { id: 'loc1', path: '/network/share1/documents' },
    { id: 'loc2', path: '/network/share2/files' },
  ]);
  const [customPath, setCustomPath] = useState('');

  const addCustomLocation = () => {
    if (customPath.trim()) {
      setStorageLocations([
        ...storageLocations,
        { id: `loc${Date.now()}`, path: customPath.trim() }
      ]);
      setCustomPath('');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedStorage) {
      alert('Please select both a file and storage location');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('storagePath', selectedStorage);

      // TODO: Implement actual file upload logic here
      console.log('Uploading file:', selectedFile.name, 'to:', selectedStorage);
      
      alert('File uploaded successfully');
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[800px] max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-medium">File Attachments</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Storage Location</label>
              <div className="space-y-2">
                <select
                  value={selectedStorage}
                  onChange={(e) => setSelectedStorage(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select storage location</option>
                  {storageLocations.map((loc) => (
                    <option key={loc.id} value={loc.path}>
                      {loc.path}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter custom network path"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    onClick={addCustomLocation}
                    type="button"
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  >
                    Add Path
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Upload PDF</label>
              <div className="mt-1 flex items-center space-x-4">
                <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50">
                  <Upload className="h-4 w-4 mr-2" />
                  <span>Select PDF</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                {selectedFile && (
                  <>
                    <span className="text-sm text-gray-500">{selectedFile.name}</span>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {selectedFile && (
              <div className="mt-4">
                <button
                  onClick={handleUpload}
                  disabled={!selectedStorage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Upload File
                </button>
              </div>
            )}

            {showPdfPreview && selectedFile && (
              <div className="mt-4 border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Preview</h3>
                <iframe
                  src={URL.createObjectURL(selectedFile)}
                  className="w-full h-[500px]"
                  title="PDF Preview"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
