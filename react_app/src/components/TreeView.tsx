
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

    // Group by patient
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
                                {derivative.aliquots.map(aliquot => (
                                  <div key={aliquot.barcode} className="flex items-center p-2">
                                    <div className="w-4" />
                                    <span className="text-xs ml-2">
                                      Aliquot: {aliquot.barcode} ({aliquot.specimen})
                                    </span>
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
          )}
        </div>
      ))}
    </div>
  );
};
