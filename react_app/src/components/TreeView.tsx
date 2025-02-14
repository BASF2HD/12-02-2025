
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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Barcode</th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Type</th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Specimen</th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Spec#</th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Material</th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Status</th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Location</th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Sample Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {samples.map((sample) => (
            <tr key={sample.barcode} className="hover:bg-gray-50">
              <td className="px-2 py-1 text-xs text-gray-900">{sample.barcode}</td>
              <td className="px-2 py-1 text-xs text-gray-500">{sample.type}</td>
              <td className="px-2 py-1 text-xs text-gray-500">{sample.specimen}</td>
              <td className="px-2 py-1 text-xs text-gray-500">{sample.specNumber}</td>
              <td className="px-2 py-1 text-xs text-gray-500">{sample.material}</td>
              <td className="px-2 py-1 text-xs text-gray-500">{sample.status}</td>
              <td className="px-2 py-1 text-xs text-gray-500">
                {sample.freezer && `${sample.freezer}/${sample.shelf}/${sample.box}/${sample.position}`}
              </td>
              <td className="px-2 py-1 text-xs text-gray-500">
                {sample.sampleDate} {sample.sampleTime}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const tree = buildTree(samples);

  return (
    <div className="p-4">
      {tree.map((node) => (
        <div key={node.patient} className="mb-4">
          <div 
            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
            onClick={() => toggleNode(node.patient)}
          >
            {expandedNodes.has(node.patient) ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
            <span className="text-sm font-medium ml-2">{node.patient}</span>
          </div>

          {expandedNodes.has(node.patient) && (
            <div className="ml-6">
              {node.samples.original.map(sample => (
                <div key={sample.barcode} className="my-2">
                  <div className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                       onClick={() => toggleNode(sample.barcode)}>
                    {expandedNodes.has(sample.barcode) ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-xs ml-2">
                      Original Sample: {sample.barcode} ({sample.specimen})
                    </span>
                  </div>

                  {expandedNodes.has(sample.barcode) && (
                    <div className="ml-6">
                      <SampleTable samples={[sample]} />
                      {Object.values(node.samples.derivatives)
                        .filter(derivative => derivative.sample.parentBarcode === sample.barcode)
                        .map(derivative => (
                          <div key={derivative.sample.barcode} className="my-2">
                            <div className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                                 onClick={() => toggleNode(derivative.sample.barcode)}>
                              {expandedNodes.has(derivative.sample.barcode) ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                              )}
                              <span className="text-xs ml-2">
                                Derivative: {derivative.sample.barcode} ({derivative.sample.specimen})
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
