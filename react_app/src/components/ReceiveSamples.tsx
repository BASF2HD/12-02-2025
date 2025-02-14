
import React, { useState, useEffect } from 'react';
import { X, Save, Search } from 'lucide-react';
import type { Sample } from '../types';
import { formatDate } from '../constants';

interface Props {
  onClose: () => void;
  samples: Sample[];
  onUpdateSamples: (samples: Sample[]) => void;
}

export function ReceiveSamples({ onClose, samples, onUpdateSamples }: Props) {
  const [selectedSamples, setSelectedSamples] = useState<Set<string>>(new Set());
  const [barcodeFilter, setBarcodeFilter] = useState<string>('');
  const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([]);
  const [receiveDate, setReceiveDate] = useState<string>('');
  
  const unreceivedSamples = samples.filter(sample => !sample.dateReceived);
  const filteredSamples = scannedBarcodes.length > 0 
    ? unreceivedSamples.filter(sample => scannedBarcodes.includes(sample.barcode))
    : unreceivedSamples;

  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newBarcode = (e.target as HTMLInputElement).value.trim();
      const matchingSample = unreceivedSamples.find(s => s.barcode === newBarcode);
      
      if (matchingSample && !scannedBarcodes.includes(newBarcode)) {
        setScannedBarcodes(prev => [...prev, newBarcode]);
        setSelectedSamples(prev => {
          const next = new Set(prev);
          next.add(newBarcode);
          return next;
        });
        setBarcodeFilter('');
      }
    }
  };

  const handleReceiveSamples = () => {
    if (!receiveDate) {
      alert('Please enter a receive date');
      return;
    }

    const updatedSamples = samples.map(sample => {
      if (selectedSamples.has(sample.barcode)) {
        return {
          ...sample,
          dateReceived: receiveDate,
          status: 'Received'
        };
      }
      return sample;
    });
    onUpdateSamples(updatedSamples);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[98%] h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-medium">Receive Samples</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={barcodeFilter}
                onChange={(e) => setBarcodeFilter(e.target.value)}
                onKeyDown={handleBarcodeInput}
                placeholder="Scan barcode..."
                className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {scannedBarcodes.map(barcode => (
                <span 
                  key={barcode}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm flex items-center gap-1"
                >
                  {barcode}
                  <button 
                    onClick={() => setScannedBarcodes(prev => prev.filter(b => b !== barcode))}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedSamples.size === filteredSamples.length && filteredSamples.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSamples(new Set(filteredSamples.map(s => s.barcode)));
                          } else {
                            setSelectedSamples(new Set());
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Barcode</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Patient ID</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Type</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Specimen</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Site</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Sample Date</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Sent Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSamples.map((sample) => (
                    <tr key={sample.barcode} className="hover:bg-gray-50">
                      <td className="px-2 py-1">
                        <input
                          type="checkbox"
                          checked={selectedSamples.has(sample.barcode)}
                          onChange={() => {
                            setSelectedSamples(prev => {
                              const next = new Set(prev);
                              if (next.has(sample.barcode)) {
                                next.delete(sample.barcode);
                              } else {
                                next.add(sample.barcode);
                              }
                              return next;
                            });
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-2 py-1 text-xs">{sample.barcode}</td>
                      <td className="px-2 py-1 text-xs">{sample.patientId}</td>
                      <td className="px-2 py-1 text-xs">{sample.type}</td>
                      <td className="px-2 py-1 text-xs">{sample.specimen}</td>
                      <td className="px-2 py-1 text-xs">{sample.site}</td>
                      <td className="px-2 py-1 text-xs">{sample.status}</td>
                      <td className="px-2 py-1 text-xs">{formatDate(sample.sampleDate)}</td>
                      <td className="px-2 py-1 text-xs">{formatDate(sample.dateSent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex justify-end items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Receive Date:</label>
              <input
                type="date"
                value={receiveDate}
                onChange={(e) => setReceiveDate(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
                required
              />
            </div>
            <button
              onClick={handleReceiveSamples}
              disabled={selectedSamples.size === 0 || !receiveDate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Receive Selected Samples
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
