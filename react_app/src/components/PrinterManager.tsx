
import React, { useState, useEffect } from 'react';
import { Printer, Plus, X, Save, Trash2 } from 'lucide-react';

interface PrinterDevice {
  id: string;
  name: string;
  ipAddress: string;
  resolution: number;
  isUSB: boolean;
  isActive: boolean;
}

export function PrinterManager({ onClose }: { onClose: () => void }) {
  const [printers, setPrinters] = useState<PrinterDevice[]>([]);
  const [newPrinter, setNewPrinter] = useState<PrinterDevice>({
    id: '',
    name: '',
    ipAddress: '',
    resolution: 300,
    isUSB: false,
    isActive: true
  });

  const detectUSBPrinters = async () => {
    try {
      // Request USB device access
      const device = await navigator.usb.requestDevice({
        filters: [{ classCode: 7 }] // Printer class code
      });
      setNewPrinter(prev => ({
        ...prev,
        name: device.productName || 'USB Printer',
        isUSB: true
      }));
    } catch (error) {
      console.error('USB printer detection failed:', error);
    }
  };

  const handleSave = () => {
    if (newPrinter.id) {
      setPrinters(prev => 
        prev.map(p => p.id === newPrinter.id ? newPrinter : p)
      );
    } else {
      setPrinters(prev => [...prev, { ...newPrinter, id: Date.now().toString() }]);
    }
    setNewPrinter({
      id: '',
      name: '',
      ipAddress: '',
      resolution: 300,
      isUSB: false,
      isActive: true
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-medium">Printer Management</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newPrinter.name}
                  onChange={e => setNewPrinter(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IP Address</label>
                <input
                  type="text"
                  value={newPrinter.ipAddress}
                  onChange={e => setNewPrinter(prev => ({ ...prev, ipAddress: e.target.value }))}
                  disabled={newPrinter.isUSB}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Resolution (DPI)</label>
                <input
                  type="number"
                  value={newPrinter.resolution}
                  onChange={e => setNewPrinter(prev => ({ ...prev, resolution: parseInt(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-4 mt-6">
                <button
                  onClick={detectUSBPrinters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Detect USB Printer
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save Printer
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Configured Printers</h3>
            <div className="space-y-2">
              {printers.map(printer => (
                <div key={printer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <h4 className="font-medium">{printer.name}</h4>
                    <p className="text-sm text-gray-500">
                      {printer.isUSB ? 'USB Connection' : `IP: ${printer.ipAddress}`} - {printer.resolution} DPI
                    </p>
                  </div>
                  <button
                    onClick={() => setPrinters(prev => prev.filter(p => p.id !== printer.id))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
