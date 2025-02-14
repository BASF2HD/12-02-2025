import { useState, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SortableHeader } from './components/SortableHeader';
import { TreeView } from './components/TreeView';
import { Microscope, Flask, Droplets, Dna, Plus, MoreVertical, X } from 'lucide-react';
import { formatDate } from './utils';
import AdminPanel from './AdminPanel';
import { SampleType, SAMPLE_ACTIONS, INVESTIGATION_TYPES, SITES, TIMEPOINTS, SPEC_NUMBERS, MATERIALS, SAMPLE_LEVELS } from './constants';
import SampleIcon from './SampleIcon';
import { BarcodeIcon } from './BarcodeIcon';
import { FileStack, Printer, Pencil, TestTube, Download, Upload, Trash2, Send } from 'lucide-react';

const getSpecimensByType = (type: SampleType) => {
  switch (type) {
    case 'blood':
      return ['Blood'];
    case 'tissue':
      return ['Tissue'];
    case 'ffpe':
      return ['FFPE'];
    case 'he':
      return ['H&E Slide'];
    case 'buffy':
      return ['Buffy'];
    case 'plasma':
      return ['Plasma'];
    case 'dna':
      return ['DNA'];
    case 'rna':
      return ['RNA'];
    default:
      return [];
  }
};

const getNextBarcode = (existingBarcodes: string[]): string => {
  const barcodes = existingBarcodes.map(barcode => parseInt(barcode, 10));
  const maxBarcode = Math.max(...barcodes);
  const nextBarcode = (maxBarcode + 1).toString().padStart(6, '0');
  return nextBarcode;
};

function App() {
  const [samples, setSamples] = useState([]);
  const [uniquePatients, setUniquePatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState({});
  const [showPatients, setShowPatients] = useState(false);
  const [activeTab, setActiveTab] = useState('tree');
  const [filteredAndSortedSamples, setFilteredAndSortedSamples] = useState([]);
  const [selectedSamples, setSelectedSamples] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ field: 'barcode', direction: 'asc' });
  const [isNewSampleModalOpen, setIsNewSampleModalOpen] = useState(false);
  const [newSamples, setNewSamples] = useState([{
    barcode: '',
    patientId: '',
    type: 'blood',
    investigationType: '',
    site: '',
    timepoint: '',
    specimen: '',
    specNumber: '',
    material: '',
    sampleLevel: '',
    sampleDate: '',
    sampleTime: '',
    comments: '',
    status: 'Collected',
    freezer: '',
    shelf: '',
    box: '',
    position: '',
    amount: '',
    volume: '',
    concentration: '',
    mass: '',
    surplus: false
  }]);
  const [isDeriveModalOpen, setIsDeriveModalOpen] = useState(false);
  const [derivedSamples, setDerivedSamples] = useState([{
    parentBarcode: '',
    barcode: '',
    patientId: '',
    type: 'blood',
    investigationType: '',
    site: '',
    timepoint: '',
    specimen: '',
    specNumber: '',
    material: '',
    sampleLevel: '',
    sampleDate: '',
    sampleTime: '',
    comments: ''
  }]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSample, setEditingSample] = useState<any>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const actionMenuRef = useRef(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleSampleSelection = (barcode: string) => {
    const newSelectedSamples = new Set(selectedSamples);
    if (newSelectedSamples.has(barcode)) {
      newSelectedSamples.delete(barcode);
    } else {
      newSelectedSamples.add(barcode);
    }
    setSelectedSamples(newSelectedSamples);
  };

  const handleBulkAction = (action: string) => {
    // Perform bulk action here
    console.log('Performing bulk action:', action, selectedSamples);
    setShowActionMenu(false);
  };

  const updateNewSample = (index: number, field: string, value: any) => {
    const updatedSamples = [...newSamples];
    updatedSamples[index] = { ...updatedSamples[index], [field]: value };
    setNewSamples(updatedSamples);
  };

  const addNewSampleRow = () => {
    setNewSamples([...newSamples, {
      barcode: '',
      patientId: '',
      type: 'blood',
      investigationType: '',
      site: '',
      timepoint: '',
      specimen: '',
      specNumber: '',
      material: '',
      sampleLevel: '',
      sampleDate: '',
      sampleTime: '',
      comments: '',
      status: 'Collected',
      freezer: '',
      shelf: '',
      box: '',
      position: '',
      amount: '',
      volume: '',
      concentration: '',
      mass: '',
      surplus: false
    }]);
  };

  const deleteNewSampleRow = (index: number) => {
    const updatedSamples = [...newSamples];
    updatedSamples.splice(index, 1);
    setNewSamples(updatedSamples);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Submitting new samples:', newSamples);
    setIsNewSampleModalOpen(false);
  };

  const updateDerivedSample = (index: number, field: string, value: any) => {
    const updatedSamples = [...derivedSamples];
    updatedSamples[index] = { ...updatedSamples[index], [field]: value };
    setDerivedSamples(updatedSamples);
  };

  const handleDeriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Submitting derived samples:', derivedSamples);
    setIsDeriveModalOpen(false);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setEditingSample(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Submitting edited sample:', editingSample);
    setIsEditModalOpen(false);
  };

  useEffect(() => {
    // Fetch samples data here
    const fetchSamples = async () => {
      const response = await fetch('/api/samples');
      const data = await response.json();
      setSamples(data);
    };
    fetchSamples();
  }, []);

  useEffect(() => {
    if (samples.length > 0) {
      const uniquePatientsSet = new Set(samples.map(sample => sample.patientId));
      const uniquePatientsArray = [...uniquePatientsSet];
      setUniquePatients(uniquePatientsArray);
    }
  }, [samples]);


  useEffect(() => {
    let filteredSamples = samples;
    if (selectedPatientId) {
      filteredSamples = samples.filter(sample => sample.patientId === selectedPatientId);
    }
    if (sortConfig.field) {
      filteredSamples.sort((a, b) => {
        const aValue = a[sortConfig.field];
        const bValue = b[sortConfig.field];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    setFilteredAndSortedSamples(filteredSamples);
  }, [samples, selectedPatientId, sortConfig]);

  return (
    <div className="flex h-screen w-screen">
      <main className="flex-grow p-6 bg-gray-100">
        <div className="flex items-center mb-6">
          <div className="flex space-x-3">
            <>
              <button
                className={`flex items-center px-3 py-1.5 rounded-md ${
                  activeTab === 'he' && !showPatients
                    ? 'bg-pink-100 text-pink-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } text-xs whitespace-nowrap`}
                onClick={() => {
                  setShowPatients(false);
                  setActiveTab('he');
                }}
              >
                <Microscope className="h-4 w-4 mr-1 text-pink-600" />
                <span className="font-medium">H&E ({samples.filter(s => s.specimen === 'H&E Slide').length})</span>
              </button>
              <button
                className={`flex items-center px-3 py-1.5 rounded-md ${
                  activeTab === 'buffy' && !showPatients
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } text-xs whitespace-nowrap`}
                onClick={() => {
                  setShowPatients(false);
                  setActiveTab('buffy');
                }}
              >
                <Flask className="h-4 w-4 mr-1 text-yellow-600" />
                <span className="font-medium">BUFFY ({samples.filter(s => s.specimen === 'Buffy').length})</span>
              </button>
              <button
                className={`flex items-center px-3 py-1.5 rounded-md ${
                  activeTab === 'plasma' && !showPatients
                    ? 'bg-cyan-100 text-cyan-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } text-xs whitespace-nowrap`}
                onClick={() => {
                  setShowPatients(false);
                  setActiveTab('plasma');
                }}
              >
                <Droplets className="h-4 w-4 mr-1 text-cyan-600" />
                <span className="font-medium">PLASMA ({samples.filter(s => s.specimen === 'Plasma').length})</span>
              </button>
              <button
                className={`flex items-center px-3 py-1.5 rounded-md ${
                  activeTab === 'dna' && !showPatients
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } text-xs whitespace-nowrap`}
                onClick={() => {
                  setShowPatients(false);
                  setActiveTab('dna');
                }}
              >
                <Dna className="h-4 w-4 mr-1 text-green-600" />
                <span className="font-medium">DNA ({samples.filter(s => s.specimen === 'DNA').length})</span>
              </button>
              <button
                className={`flex items-center px-3 py-1.5 rounded-md ${
                  activeTab === 'rna' && !showPatients
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } text-xs whitespace-nowrap`}
                onClick={() => {
                  setShowPatients(false);
                  setActiveTab('rna');
                }}
              >
                <Dna className="h-4 w-4 mr-1 text-indigo-600" />
                <span className="font-medium">RNA ({samples.filter(s => s.specimen === 'RNA').length})</span>
              </button>
            </>
          </div>
          <div className="flex-grow flex justify-end space-x-3">
            {(selectedPatientId || showPatients) && (
              <button
                className="flex items-center px-3 py-1.5 text-xs bg-green-100 text-green-600 rounded-md hover:bg-green-200 whitespace-nowrap"
                onClick={() => {
                  setNewSamples([{
                    ...newSamples[0],
                    patientId: selectedPatient?.id || ''
                  }]);
                  setIsNewSampleModalOpen(true);
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span>Add Sample</span>
              </button>
            )}
            <button
              onClick={() => setShowActionMenu(!showActionMenu)}
              className="flex items-center px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 whitespace-nowrap"
              disabled={selectedSamples.size === 0}
            >
              <span className="mr-2">Actions</span>
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
            {showActionMenu && (
              <div ref={actionMenuRef} className="absolute mt-8 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 popup-menu">
                <div className="py-1">
                  {SAMPLE_ACTIONS.map((action) => {
                    const iconMapping = {
                      'Derive': <Droplets className="h-4 w-4" />,
                      'Print Label': <Printer className="h-4 w-4" />,
                      'Print Barcode': <BarcodeIcon className="h-4 w-4" />,
                      'View History': <FileStack className="h-4 w-4" />,
                      'Add Note': <Pencil className="h-4 w-4" />,
                      'Process Sample': <Flask className="h-4 w-4" />,
                      'Run Analysis': <TestTube className="h-4 w-4" />,
                      'Extract DNA': <Dna className="h-4 w-4" />,
                      'Download': <Download className="h-4 w-4" />,
                      'Upload': <Upload className="h-4 w-4" />,
                      'Delete': <Trash2 className="h-4 w-4" />,
                      'Send': <Send className="h-4 w-4" />,
                      'Edit': <Pencil className="h-4 w-4" />
                    };
                    const icon = iconMapping[action] || null; // Handle missing icons gracefully

                    return (
                      <button
                        key={action}
                        onClick={() => handleBulkAction(action)}
                        className="block w-full text-left px-2 py-1 text-sm flex items-center gap-2 hover:bg-gray-100"
                      >
                        {icon}
                        <span>{action}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {showPatients ? (
          <div className="bg-white rounded-lg shadow overflow-hidden max-h-[calc(100vh-12rem)] overflow-y-auto">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <SortableHeader
                      field="id"
                      index={0}
                      moveColumn={(dragIndex, hoverIndex) => {}}
                      onSort={() => {
                        if (sortConfig.field === 'id') {
                          setSortConfig(prev => ({ field: 'id', direction: prev.direction === 'asc' ? 'desc' : 'asc' }));
                        } else {
                          setSortConfig({ field: 'id', direction: 'asc' });
                        }
                      }}
                      onFilter={() => {}}
                    >
                      Patient ID
                    </SortableHeader>
                    <SortableHeader
                      field="ltxId"
                      index={1}
                      moveColumn={(dragIndex, hoverIndex) => {}}
                      onSort={() => {
                        if (sortConfig.field === 'ltxId') {
                          setSortConfig(prev => ({ field: 'ltxId', direction: prev.direction === 'asc' ? 'desc' : 'asc' }));
                        } else {
                          setSortConfig({ field: 'ltxId', direction: 'asc' });
                        }
                      }}
                      onFilter={() => {}}
                    >
                      LTX ID
                    </SortableHeader>
                    <SortableHeader
                      field="site"
                      index={2}
                      moveColumn={(dragIndex, hoverIndex) => {}}
                      onSort={() => {
                        if (sortConfig.field === 'site') {
                          setSortConfig(prev => ({ field: 'site', direction: prev.direction === 'asc' ? 'desc' : 'asc' }));
                        } else {
                          setSortConfig({ field: 'site', direction: 'asc' });
                        }
                      }}
                      onFilter={() => {}}
                    >
                      Site
                    </SortableHeader>
                    <SortableHeader
                      field="cohort"
                      index={3}
                      moveColumn={(dragIndex, hoverIndex) => {}}
                      onSort={() => {
                        if (sortConfig.field === 'cohort') {
                          setSortConfig(prev => ({ field: 'cohort', direction: prev.direction === 'asc' ? 'desc' : 'asc' }));
                        } else {
                          setSortConfig({ field: 'cohort', direction: 'asc' });
                        }
                      }}
                      onFilter={() => {}}
                    >
                      Cohort
                    </SortableHeader>
                    <SortableHeader
                      field="study"
                      index={4}
                      moveColumn={(dragIndex, hoverIndex) => {}}
                      onSort={() => {
                        if (sortConfig.field === 'study') {
                          setSortConfig(prev => ({ field: 'study', direction: prev.direction === 'asc' ? 'desc' : 'asc' }));
                        } else {
                          setSortConfig({ field: 'study', direction: 'asc' });
                        }
                      }}
                      onFilter={() => {}}
                    >
                      Study
                    </SortableHeader>
                    <SortableHeader
                      field="eligibility"
                      index={5}
                      moveColumn={(dragIndex, hoverIndex) => {}}
                      onSort={() => {
                        if (sortConfig.field === 'eligibility') {
                          setSortConfig(prev => ({ field: 'eligibility', direction: prev.direction === 'asc' ? 'desc' : 'asc' }));
                        } else {
                          setSortConfig({ field: 'eligibility', direction: 'asc' });
                        }
                      }}
                      onFilter={() => {}}
                    >
                      Eligibility
                    </SortableHeader>
                    <SortableHeader
                      field="registrationDate"
                      index={6}
                      moveColumn={(dragIndex, hoverIndex) => {}}
                      onSort={() => {
                        if (sortConfig.field === 'registrationDate') {
                          setSortConfig(prev => ({ field: 'registrationDate', direction: prev.direction === 'asc' ? 'desc' : 'asc' }));
                        } else {
                          setSortConfig({ field: 'registrationDate', direction: 'asc' });
                        }
                      }}
                      onFilter={() => {}}
                    >
                      Registration Date
                    </SortableHeader>
                    <th scope="col" className="px-2 py-1 text-left textxs font-medium text-gray-700 uppercase tracking-wider truncate bg-gray-100">Samples</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...uniquePatients].sort((a, b) => {
                    const aValue = a[sortConfig.field];
                    const bValue = b[sortConfig.field];

                    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                  }).map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <td
                        className="px-2 py-1 whitespace-nowrap text-xs font-medium text-blue-600 cursor-pointer hover:underline"
                        onClick={() => {
                          setSelectedPatientId(patient.id);
                          setShowPatients(false);
                        }}
                      >
                        {patient.id}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">{patient.ltxId}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">{patient.site}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">{patient.cohort}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">{patient.study}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                        {patient.eligibility.charAt(0).toUpperCase() + patient.eligibility.slice(1)}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                        {formatDate(patient.registrationDate)}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs">
                        <div className="flex space-x-2">
                          {patient.samples && (
                            <>
                              {patient.samples.filter(s => s.type === 'blood').length > 0 && (
                                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                                  Blood: {patient.samples.filter(s => s.type === 'blood').length}
                                </span>
                              )}
                              {patient.samples.filter(s => s.type === 'tissue').length > 0 && (
                                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                                  Tissue: {patient.samples.filter(s => s.type === 'tissue').length}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'tree' ? (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <TreeView samples={samples} />
          </div>
        ) : (
          <>
            {selectedPatientId && (
              <div className="flex justify-start mb-6">
                <button
                  onClick={() => setSelectedPatientId(null)}
                  className="flex items-center px-3 py-1.5 text-xs bg-orange-100 text-orange-600 rounded-md hover:bg-orange-200"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Clear Patient Filter
                </button>
              </div>
            )}

            <DndProvider backend={HTML5Backend}>
              <div className="bg-white shadow-sm rounded-lg overflow-hidden max-h-[calc(100vh-12rem)] overflow-y-auto">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th scope="col" className="px-2 py-1">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedSamples.size === filteredAndSortedSamples.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSamples(new Set(filteredAndSortedSamples.map(s => s.barcode)));
                              } else {
                                setSelectedSamples(new Set());
                              }
                            }}
                          />
                        </th>
                        <th scope="col" className="px-2 py-1"></th>
                        <SortableHeader field="barcode">Barcode</SortableHeader>
                        <SortableHeader field="ltxId">LTX ID</SortableHeader>
                        <SortableHeader field="patientId">Patient ID</SortableHeader>
                        <SortableHeader field="type">Type</SortableHeader>
                        <SortableHeader field="investigationType">Investigation Type</SortableHeader>
                        <SortableHeader field="timepoint">Timepoint</SortableHeader>
                        <SortableHeader field="specimen">Specimen</SortableHeader>
                        <SortableHeader field="specNumber">Spec#</SortableHeader>
                        <SortableHeader field="material">Material</SortableHeader>
                        <SortableHeader field="status">Status</SortableHeader>
                        <SortableHeader field="freezer">Freezer</SortableHeader>
                        <SortableHeader field="shelf">Shelf</SortableHeader>
                        <SortableHeader field="box">Box</SortableHeader>
                        <SortableHeader field="position">Position</SortableHeader>
                        <SortableHeader field="sampleDate">Sample Date & Time</SortableHeader>
                        <SortableHeader field="dateSent">Date Sent</SortableHeader>
                        <SortableHeader field="dateReceived">Date Received</SortableHeader>
                        <SortableHeader field="site">Site</SortableHeader>
                        <SortableHeader field="sampleLevel">Sample Level</SortableHeader>
                        <SortableHeader field="volume">Volume (ml)</SortableHeader>
                        <SortableHeader field="amount">Amount (mg)</SortableHeader>
                        <SortableHeader field="concentration">Conc. (ng/µL)</SortableHeader>
                        <SortableHeader field="mass">Mass (ng)</SortableHeader>
                        <SortableHeader field="surplus">Surplus</SortableHeader>
                        <SortableHeader field="comments">Comments</SortableHeader>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAndSortedSamples.map((sample) => (
                        <tr key={sample.barcode} className="hover:bg-gray-50">
                          <td className="px-2 py-1">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedSamples.has(sample.barcode)}
                              onChange={() => handleSampleSelection(sample.barcode)}
                            />
                          </td>
                          <td className="px-2 py-1">
                            <SampleIcon specimen={sample.specimen} />
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">{sample.barcode}</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">{sample.ltxId}</td>
                          <td
                            className="px-2 py-1 whitespace-nowrap text-xs font-medium text-blue-600 cursor-pointer hover:underline"
                            onClick={() => setSelectedPatientId(sample.patientId)}
                          >
                            {sample.patientId}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500 capitalize">{sample.type}</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{sample.investigationType}</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{sample.timepoint}</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{sample.specimen}</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{sample.specNumber}</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{sample.material}</td>
                          <td className="px-2 py-1 whitespace-nowrap">
                            <span className={`status-text`}>
                              {sample.status}
                            </span>
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{sample.freezer}</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{sample.shelf}</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{sample.box}</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{sample.position}</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">
                            {formatDate(sample.sampleDate)} {sample.sampleTime}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{sample.dateSent}</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{sample.dateReceived}</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{sample.site}</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{sample.sampleLevel}</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">
                            {sample.volume ? `${sample.volume} ml` : ''}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">
                            {sample.amount ? `${sample.amount} mg` : ''}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">
                            {sample.concentration ? `${sample.concentration} ng/µL` : ''}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">
                            {sample.mass ? `${sample.mass} ng` : ''}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-center">
                            {sample.surplus ? 'Yes' : 'No'}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{sample.comments}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </DndProvider>
          </>
        )}
      </main>
      {isNewSampleModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[98%] max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-3 py-2 border-b">
              <h2 className="text-lg font-medium">New Sample</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={addNewSampleRow}
                  className="flex items-center px-3 py-1 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Add Row</span>
                </button>
                <button onClick={() => setIsNewSampleModalOpen(false)}>
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-3 overflow-y-auto">
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white sticky top-0 z-10">
                      <tr>
                        <th className="min-w-[40px] px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">#</th>
                        <th className="w-24 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Barcode</th>
                        <th className="w-48 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Patient ID</th>
                        <th className="w-28 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Type</th>
                        <th className="w-36 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Investigation Type</th>
                        <th className="w-28 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Site</th>
                        <th className="w-36 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Timepoint</th>
                        <th className="w-32 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Specimen</th>
                        <th className="w-20 px-2 py-1 text-left textxs font-medium text-gray-700 truncate bg-gray-100">Spec#</th>
                        <th className="w-24 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Material</th>
                        <th className="w-28 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Sample Level</th>
                        <th className="w-48 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Sample Date & Time</th>
                        <th className="w-32 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Comments</th>
                        <th className="px-2 py-1"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {newSamples.map((sample, index) => (
                        <tr key={index}>
                          <td className="min-w-[40px] px-2 py-1 text-xs text-gray-500">{index + 1}</td>
                          <td className="w-24 px-2 py-1">
                            <input
                              type="text"
                              value={sample.barcode}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').padStart(6, '0');
                                updateNewSample(index, 'barcode', value);
                              }}
                              className="w-full text-xs border-gray-300 rounded-md"
                              required
                              pattern="\d{6}"
                              maxLength={6}
                            />
                          </td>
                          <td className="w-48 px-2 py-1">
                            <input
                              type="text"
                              value={sample.patientId}
                              onChange={(e) => {
                                let value = e.target.value.toUpperCase();
                                if (value.startsWith('U_LTX')) {
                                  const digits = value.substring(5);
                                  const validDigits = digits.replace(/[^0-9]/g, '');
                                  value = `U_LTX${validDigits}`;
                                }
                                updateNewSample(index, 'patientId', value);
                              }}
                              className="w-full text-xs border-gray-300 rounded-md"
                              required
                            />
                          </td>
                          <td className="w-28 px-2 py-1">
                            <select
                              value={sample.type}
                              onChange={(e) => updateNewSample(index, 'type', e.target.value as SampleType)}
                              className="w-full text-xs border-gray-300 rounded-md"
                            >
                              <option value="blood">Blood</option>
                              <option value="tissue">Tissue</option>
                              <option value="ffpe">FFPE</option>
                              <option value="he">H&E</option>
                              <option value="buffy">Buffy</option>
                              <option value="plasma">Plasma</option>
                              <option value="dna">DNA</option>
                              <option value="rna">RNA</option>
                            </select>
                          </td>
                          <td className="w-36 px-2 py-1">
                            <select
                              value={sample.investigationType}
                              onChange={(e) => updateNewSample(index, 'investigationType', e.target.value)}
                              className="w-full text-xs border-gray-300 rounded-md"
                            >
                              {INVESTIGATION_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </td>
                          <td className="w-28 px-2 py-1">
                            <select
                              value={sample.site}
                              onChange={(e) => updateNewSample(index, 'site', e.target.value)}
                              className="w-full text-xs border-gray-300 rounded-md"
                            >
                              {SITES.map(site => (
                                <option key={site} value={site}>{site}</option>
                              ))}
                            </select>
                          </td>
                          <td className="w-36 px-2 py-1">
                            <select
                              value={sample.timepoint}
                              onChange={(e) => updateNewSample(index, 'timepoint', e.target.value)}
                              className="w-full text-xs border-gray-300 rounded-md"
                            >
                              {TIMEPOINTS.map(timepoint => (
                                <option key={timepoint} value={timepoint}>{timepoint}</option>
                              ))}
                            </select>
                          </td>
                          <td className="w-32 px-2 py-1 whitespace-nowrap">
                            <select
                              value={sample.specimen}
                              onChange={(e) => updateNewSample(index, 'specimen', e.target.value)}
                              className="w-full text-xs border-gray-300 rounded-md"
                              required
                            >
                              <option value="">Select specimen</option>
                              {getSpecimensByType(sample.type).map(specimen => (
                                <option key={specimen} value={specimen}>{specimen}</option>
                              ))}
                            </select>
                          </td>
                          <td className="w-32 px-2 py-1">
                            <select
                              value={sample.specimen}
                              onChange={(e) => updateNewSample(index, 'specimen', e.target.value)}
                              className="w-full text-xs border-gray-300 rounded-md"
                              required
                            >
                              <option value="">Select specimen</option>
                              {getSpecimensByType(sample.type).map(specimen => (
                                <option key={specimen} value={specimen}>{specimen}</option>
                              ))}
                            </select>
                          </td>
                          <td className="w-20 px-2 py-1">
                            <select
                              value={sample.specNumber}
                              onChange={(e) => updateNewSample(index, 'specNumber', e.target.value)}
                              className="w-full text-xs border-gray-300 rounded-md"
                            >
                              {SPEC_NUMBERS.map(number => (
                                <option key={number} value={number}>{number}</option>
                              ))}
                            </select>
                          </td>
                          <td className="w-24 px-2 py-1">
                            <select
                              value={sample.material}
                              onChange={(e) => updateNewSample(index, 'material', e.target.value)}
                              className="w-full text-xs border-gray-300 rounded-md"
                            >
                              {MATERIALS.map(material => (
                                <option key={material} value={material}>{material}</option>
                              ))}
                            </select>
                          </td>
                          <td className="w-28 px-2 py-1">
                            <select
                              value={sample.sampleLevel}
                              onChange={(e) => updateNewSample(index, 'sampleLevel', e.target.value)}
                              className="w-full text-xs border-gray-300 rounded-md"
                            >
                              {SAMPLE_LEVELS.map(level => (
                                <option key={level} value={level}>{level}</option>
                              ))}
                            </select>
                          </td>
                          <td className="w-48 px-2 py-1">
                            <div className="flex space-x-2">
                              <input
                                type="date"
                                value={sample.sampleDate}
                                onChange={(e) => updateNewSample(index, 'sampleDate', e.target.value)}
                                className="w-32 text-xs border-gray-300 rounded-md"
                                required
                              />
                              <input
                                type="time"
                                value={sample.sampleTime}
                                onChange={(e) => updateNewSample(index, 'sampleTime', e.target.value)}
                                className="w-24 text-xs border-gray-300 rounded-md"
                                required
                              />
                            </div>
                          </td>
                          <td className="w-32 px-2 py-1">
                            <input
                              type="text"
                              value={sample.comments}
                              onChange={(e) => updateNewSample(index, 'comments', e.target.value)}
                              className="w-full text-xs border-gray-300 rounded-md"
                            />
                          </td>
                          <td className="w-8 px-2 py-1 text-right">
                            <button
                              type="button"
                              onClick={() => deleteNewSampleRow(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNewSampleModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDeriveModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[98%] max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-3 py-2 border-b">
              <h2 className="text-lg font-medium">Derive Samples</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    const newDerivedSample = {
                      ...derivedSamples[0],
                      barcode: getNextBarcode([...samples, ...derivedSamples].map(s => s.barcode))
                    };
                    setDerivedSamples([...derivedSamples, newDerivedSample]);
                  }}
                  className="flex items-center px-3 py-1 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Add Row</span>
                </button>
                <button onClick={() => setIsDeriveModalOpen(false)}>
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                </button>
              </div>
            </div>
            <form onSubmit={handleDeriveSubmit} className="p-3 overflow-y-auto">
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white sticky top-0 z-10">
                      <tr>
                        <th className="min-w-[40px] px-2 py-1 text-left text-xs font-medium text-gray700 truncate bg-gray-100">#</th>
                        <th className="w-24 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Parent Barcode</th>
                        <th className="w-24 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Barcode</th>
                        <th className="w-48 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Patient ID</th>
                        <th className="w-28 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Type</th>
                        <th className="w-36 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Investigation Type</th>
                        <th className="w-28 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Site</th>
                        <th className="w-36 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Timepoint</th>
                        <th className="w-32 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Specimen</th>
                        <th className="w-20 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Spec#</th>
                        <th className="w-24 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Material</th>
                        <th className="w-28 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Sample Level</th>
                        <th className="w-48 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Sample Date & Time</th>
                        <th className="w-32 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {derivedSamples.map((sample, index) => (
                        <tr key={index}>
                          <td className="min-w-[40px] px-2 py-1 text-xs text-gray-500">{index + 1}</td>
                          <td className="w-24 px-2 py-1 text-xs text-gray-500">{sample.parentBarcode}</td>
                          <td className="w-24 px-2 py-1">
                            <input
                              type="text"
                              value={sample.barcode}
                              onChange={(e) => updateDerivedSample(index, 'barcode', e.target.value)}
                              className="w-full text-xs border-gray-300 rounded-md"
                              required
                            />
                          </td>
                          <td className="w-48 px-2 py-1">
                            <input
                              type="text"
                              value={sample.patientId}
                              disabled
                              className="w-full text-xs border-gray-300 rounded-md bg-gray-50"
                              required
                            />
                          </td>
                          <td className="w-28 px-2 py-1">
                            <select
                              value={sample.type}
                              onChange={(e) => updateDerivedSample(index, 'type', e.target.value)}
                              className="w-full text-xs border-gray-300 rounded-md"
                            >
                              <option value="blood">Blood</option>
                              <option value="tissue">Tissue</option>
                              <option value="ffpe">FFPE</option>
                              <option value="he">H&E</option>
                              <option value="buffy">Buffy</option>
                              <option value="plasma">Plasma</option>
                              <option value="dna">DNA</option>
                              <option value="rna">RNA</option>
                            </select>
                          </td>
                          <td className="w-36 px-2 py-1">
                            <select
                              value={sample.investigationType}
                              onChange={(e) => updateDerivedSample(index, 'investigationType', e.target.value)}
                              className="w-full text-xs border-gray-300 rounded-md"
                            >
                              {INVESTIGATION_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </td>
                          <td className="w-28 px-2 py-1 text-xs text-gray-500">{sample.site}</td>
                          <td className="w-36 px-2 py-1 text-xs text-gray-500">{sample.timepoint}</td>
                          <td className="w-32 px-2 py-1 text-xs text-gray-500">{sample.specimen}</td>
                          <td className="w-20 px-2 py-1">
                            <select
                              value={sample.specNumber}
                              disabled
                              className="w-full text-xs border-gray-300 rounded-md bg-gray-50"
                            >
                              {SPEC_NUMBERS.map(number => (
                                <option key={number} value={number}>{number}</option>
                              ))}
                            </select>
                          </td>
                          <td className="w-24 px-2 py-1">
                            <select
                              value={sample.material}
                              onChange={(e) => updateDerivedSample(index, 'material', e.target.value)}
                              className="w-full text-xs border-gray-300 rounded-md"
                            >
                              {MATERIALS.map(material => (
                                <option key={material} value={material}>{material}</option>
                              ))}
                            </select>
                          </td>
                          <td className="w-28 px-2 py-1 text-xs text-gray-500">{sample.sampleLevel}</td>
                          <td className="w-48 px-2 py-1">
                            <div className="flex space-x-2">
                              <input
                                type="date"
                                value={sample.sampleDate}
                                onChange={(e) => updateDerivedSample(index, 'sampleDate', e.target.value)}
                                className="w-32 text-xs border-gray-300 rounded-md"
                                required
                              />
                              <input
                                type="time"
                                value={sample.sampleTime}
                                onChange={(e) => updateDerivedSample(index, 'sampleTime', e.target.value)}
                                className="w-24 text-xs border-gray-300 rounded-md"
                                required
                              />
                            </div>
                          </td>
                          <td className="w-32 px-2 py-1">
                            <input
                              type="text"
                              value={sample.comments}
                              onChange={(e) => updateDerivedSample(index, 'comments', e.target.value)}
                              className="w-full text-xs border-gray-300 rounded-md"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsDeriveModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[98%] max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-3 py-2 border-b">
              <h2 className="text-lg font-medium">Edit Sample</h2>
              <button onClick={handleEditClose}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-3 overflow-y-auto">
              {editingSample && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Barcode</label>
                    <input
                      type="text"
                      value={editingSample.barcode}
                      onChange={(e) => setEditingSample({ ...editingSample, barcode: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={editingSample.type}
                      onChange={(e) => setEditingSample({ ...editingSample, type: e.target.value as SampleType })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                    >
                      <option value="blood">Blood</option>
                      <option value="tissue">Tissue</option>
                      <option value="ffpe">FFPE</option>
                      <option value="he">H&E</option>
                      <option value="buffy">Buffy</option>
                      <option value="plasma">Plasma</option>
                      <option value="dna">DNA</option>
                      <option value="rna">RNA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Investigation Type</label>
                    <select
                      value={editingSample.investigationType}
                      onChange={(e) => setEditingSample({ ...editingSample, investigationType: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                    >
                      {INVESTIGATION_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={editingSample.status}
                      onChange={(e) => setEditingSample({ ...editingSample, status: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                    >
                      <option value="Collected">Collected</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Received">Received</option>
                      <option value="In Storage">In Storage</option>
                      <option value="In Process">In Process</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Freezer</label>
                    <input
                      type="text"
                      value={editingSample.freezer || ''}
                      onChange={(e) => setEditingSample({ ...editingSample, freezer: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Shelf</label>
                    <input
                      type="text"
                      value={editingSample.shelf || ''}
                      onChange={(e) => setEditingSample({ ...editingSample, shelf: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Box</label>
                    <input
                      type="text"
                      value={editingSample.box || ''}
                      onChange={(e) => setEditingSample({ ...editingSample, box: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <input
                      type="text"
                      value={editingSample.position || ''}
                      onChange={(e) => setEditingSample({ ...editingSample, position: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Comments</label>
                    <input
                      type="text"
                      value={editingSample.comments || ''}
                      onChange={(e) => setEditingSample({ ...editingSample, comments: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                    />
                  </div>
                </div>
              )}
              <div className="mt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleEditClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAdminPanel && (
        <AdminPanel
          onClose={() => setShowAdminPanel(false)}
          currentUser={{ id: '1', email: 'john.smith@example.com', fullName: 'John Smith', role: 'admin' }}
        />
      )}
    </div>
  );
}


export default App