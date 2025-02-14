
import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { Sample } from '../types';

interface TreeNode {
  patient: string;
  samples: {
    original: Sample[];
    derivatives: {
      [key: string]: {
        sample: Sample;
        aliquots: Sample[];
      };
    };
  };
}

interface TreeViewProps {
  samples: Sample[];
}

export const TreeView: React.FC<TreeViewProps> = ({ samples }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const buildTree = (samples: Sample[]): TreeNode[] => {
    const patientMap: { [key: string]: TreeNode } = {};

    samples.forEach(sample => {
      if (!patientMap[sample.patientId]) {
        patientMap[sample.patientId] = {
          patient: sample.patientId,
          samples: {
            original: [],
            derivatives: {}
          }
        };
      }

      if (sample.sampleLevel === 'Original sample') {
        patientMap[sample.patientId].samples.original.push(sample);
      } else if (sample.sampleLevel === 'Derivative' && sample.parentBarcode) {
        patientMap[sample.patientId].samples.derivatives[sample.barcode] = {
          sample,
          aliquots: []
        };
      } else if (sample.sampleLevel === 'Aliquot' && sample.parentBarcode) {
        const parentDerivative = patientMap[sample.patientId].samples.derivatives[sample.parentBarcode];
        if (parentDerivative) {
          parentDerivative.aliquots.push(sample);
        }
      }
    });

    return Object.values(patientMap);
  };

  const SampleTable = ({ samples }: { samples: Sample[] }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-[11px] table-fixed">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-24 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Barcode</th>
            <th className="w-24 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">LTX ID</th>
            <th className="w-48 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Patient ID</th>
            <th className="w-28 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Type</th>
            <th className="w-36 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Investigation Type</th>
            <th className="w-28 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Timepoint</th>
            <th className="w-28 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Sample Level</th>
            <th className="w-32 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Specimen</th>
            <th className="w-20 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Spec#</th>
            <th className="w-24 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Material</th>
            <th className="w-28 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Sample Date</th>
            <th className="w-24 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Site</th>
            <th className="w-32 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Location</th>
            <th className="w-20 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Volume</th>
            <th className="w-20 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Amount</th>
            <th className="w-28 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Concentration</th>
            <th className="w-20 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Mass</th>
            <th className="w-20 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Surplus</th>
            <th className="w-24 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Status</th>
            <th className="w-24 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Date Sent</th>
            <th className="w-28 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Date Received</th>
            <th className="w-48 px-1 py-0.5 text-left font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Comments</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {samples.map((sample) => (
            <tr key={sample.barcode} className="hover:bg-gray-50">
              <td className="px-1 py-0.5 text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{sample.barcode}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.ltxId}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.patientId}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.type}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.investigationType}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.timepoint}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.sampleLevel}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.specimen}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.specNumber}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.material}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.sampleDate} {sample.sampleTime}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.site}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.freezer && `${sample.freezer}/${sample.shelf}/${sample.box}/${sample.position}`}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.volume}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.amount}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.concentration}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.mass}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.surplus}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.status}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.dateSent}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.dateReceived}</td>
              <td className="px-1 py-0.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{sample.comments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const tree = buildTree(samples);

  const getSampleIcon = (type: string, level: string) => {
    if (type === 'tissue') return '🔬';
    if (type === 'blood') return '🩸';
    if (type === 'plasma') return '💉';
    if (type === 'buffy coat') return '🧪';
    return '📦';
  };

  return (
    <div className="p-4">
      {tree.map((node) => (
        <div key={node.patient} className="mb-2">
          <div 
            className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
            onClick={() => toggleNode(node.patient)}
          >
            {expandedNodes.has(node.patient) ? (
              <ChevronDown className="h-3 w-3 text-gray-500" />
            ) : (
              <ChevronRight className="h-3 w-3 text-gray-500" />
            )}
            <span className="text-xs font-medium ml-1">
              {node.patient} - {node.samples.original[0]?.ltxId || 'No ID'}
            </span>
          </div>

          {expandedNodes.has(node.patient) && (
            <div className="ml-6">
              {node.samples.original.map(sample => (
                <div key={sample.barcode} className="my-1">
                  <div className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded ml-4"
                       onClick={() => toggleNode(sample.barcode)}>
                    {expandedNodes.has(sample.barcode) ? (
                      <ChevronDown className="h-3 w-3 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-gray-500" />
                    )}
                    <span className="text-xs ml-1">
                      {getSampleIcon(sample.type, sample.sampleLevel)} {sample.barcode} - {sample.specimen} ({sample.specNumber})
                    </span>
                  </div>

                  {expandedNodes.has(sample.barcode) && (
                    <div className="ml-6">
                      <SampleTable samples={[sample]} />
                      {Object.values(node.samples.derivatives)
                        .filter(derivative => derivative.sample.parentBarcode === sample.barcode)
                        .map(derivative => (
                          <div key={derivative.sample.barcode} className="my-2">
                            <div className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded ml-8"
                                 onClick={() => toggleNode(derivative.sample.barcode)}>
                              {expandedNodes.has(derivative.sample.barcode) ? (
                                <ChevronDown className="h-3 w-3 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-3 w-3 text-gray-500" />
                              )}
                              <span className="text-xs ml-1">
                                {getSampleIcon(derivative.sample.type, derivative.sample.sampleLevel)} {derivative.sample.barcode} - {derivative.sample.type} ({derivative.sample.specNumber})
                              </span>
                            </div>

                            {expandedNodes.has(derivative.sample.barcode) && (
                              <div className="ml-6">
                                <SampleTable samples={[derivative.sample]} />
                                {derivative.aliquots.length > 0 && (
                                  <>
                                    <div className="text-xs text-gray-500 mt-2 mb-1">Aliquots:</div>
                                    <SampleTable samples={derivative.aliquots} />
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
