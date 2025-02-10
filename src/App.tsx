import React, { useState, useMemo, useEffect } from 'react';
import { Users, ArrowUpCircle, ArrowDownCircle, Search, X, Plus, ArrowUpDown, Filter, Settings, MoreVertical, TestTube, FileStack, Microscope, FlaskRound as Flask, Dna, Droplets, Printer, Barcode as BarcodeIcon, Paperclip } from 'lucide-react';
import { FreezerIcon } from './components/FreezerIcon';
import { LoginPage } from './components/LoginPage';
import { SampleIcon } from './components/SampleIcon';
import { useSamples } from './hooks/useSamples';
import { 
  INVESTIGATION_TYPES, 
  SITES, 
  TIMEPOINTS, 
  SPECIMENS, 
  SPEC_NUMBERS, 
  MATERIALS,
  SAMPLE_LEVELS,
  SAMPLE_ACTIONS,
  getNextBarcode,
  formatDate,
  formatTime
} from './constants';
import type { Sample, Patient, SampleType } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPatients, setShowPatients] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { samples, loading, error, addSamples } = useSamples();
  const [activeTab, setActiveTab] = useState<'blood' | 'tissue' | 'ffpe' | 'he' | 'buffy' | 'plasma' | 'dna' | 'rna' | 'all'>('blood');
  const [isNewSampleModalOpen, setIsNewSampleModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ field: keyof Sample; order: 'asc' | 'desc' }>({
    field: 'barcode',
    order: 'asc'
  });
  const [filters, setFilters] = useState<Partial<Record<keyof Sample, string>>>({});
  const [selectedSamples, setSelectedSamples] = useState<Set<string>>(new Set());
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isDeriveModalOpen, setIsDeriveModalOpen] = useState(false);
  const [parentSamples, setParentSamples] = useState<Sample[]>([]);
  const [derivedSamples, setDerivedSamples] = useState<Sample[]>([]);

  const getSpecimensByType = (type: SampleType): Specimen[] => {
    switch (type) {
      case 'blood':
        return SPECIMENS.filter(specimen => [
          'Immunology LH',
          'Organoids LH',
          'cfDNA Streck',
          'Germline EDTA',
          'CTC_Peripheral Streck',
          'Methylation Streck',
          'Metabolomics LH',
          'TCR/BCR Tempus'
        ].includes(specimen));
      case 'tissue':
        return SPECIMENS.filter(specimen => [
          'Frozen Normal Lung',
          'Frozen Tumour Lung',
          'Frozen Tumour Lymph node',
          'Frozen Normal Lymph node',
          'Imm Fresh Tumour',
          'Imm Fresh Tumour Lymph node',
          'Imm Fresh Normal',
          'Imm Fresh Normal Lymph node',
          'Organoids Tumour',
          'Organoids Normal',
          'Cell of Origin',
          'Slice',
          'Frozen Biopsy'
        ].includes(specimen));
      case 'ffpe':
        return SPECIMENS.filter(specimen => specimen === 'FFPE Block');
      case 'he':
        return SPECIMENS.filter(specimen => specimen === 'H&E Slide');
      case 'buffy':
        return SPECIMENS.filter(specimen => specimen === 'Buffy');
      case 'plasma':
        return SPECIMENS.filter(specimen => specimen === 'Plasma');
      case 'dna':
        return SPECIMENS.filter(specimen => specimen === 'DNA');
      case 'rna':
        return SPECIMENS.filter(specimen => specimen === 'RNA');
      default:
        return SPECIMENS;
    }
  };
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);


  const [newSamples, setNewSamples] = useState<Sample[]>([{
    id: '',
    barcode: getNextBarcode(samples.map(s => s.barcode)),
    patientId: '',
    type: 'blood',
    investigationType: 'Sequencing',
    status: 'Collected',
    site: 'UCLH',
    timepoint: 'Surgery',
    specimen: 'Plasma',
    specNumber: 'N01',
    material: 'Fresh',
    sampleDate: new Date().toISOString().split('T')[0],
    sampleTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
    freezer: '',
    shelf: '',
    box: '',
    position: '',
    volume: undefined,
    amount: undefined,
    concentration: undefined,
    mass: undefined,
    surplus: false,
    sampleLevel: 'Original sample',
    comments: ''
  }]);

  const uniquePatients = useMemo(() => {
    const patientIds = [...new Set(samples.map(sample => sample.patientId))];
    return patientIds.map(id => ({
      id,
      site: 'UCLH',
      cohort: 'A',
      study: 'TRACERx',
      eligibility: 'eligible' as const,
      registrationDate: '2024-01-01',
      samples: samples.filter(s => s.patientId === id)
    }));
  }, [samples]);

  const handleLogin = (email: string, password: string) => {
    // TODO: Implement actual authentication
    setIsAuthenticated(true);
  };

  const handleSort = (field: keyof Sample) => {
    setSortConfig({
      field,
      order: sortConfig.field === field && sortConfig.order === 'asc' ? 'desc' : 'asc'
    });
  };

  const filteredAndSortedSamples = useMemo(() => {
    let filtered = samples;

    // Filter by selected patient
    if (selectedPatientId) {
      filtered = filtered.filter(sample => sample.patientId === selectedPatientId);
    }

    // Fix type filtering
    if (activeTab !== 'all') {
      filtered = filtered.filter(sample => {
        switch (activeTab) {
          case 'ffpe':
            return sample.specimen === 'FFPE Block';
          case 'he':
            return sample.specimen === 'H&E Slide';
          case 'buffy':
            return sample.specimen === 'Buffy';
          case 'plasma':
            return sample.specimen === 'Plasma';
          case 'dna':
            return sample.specimen === 'DNA';
          case 'rna':
            return sample.specimen === 'RNA';
          default:
            return sample.type === activeTab;
        }
      });
    }

    filtered = filtered.filter(sample => 
      Object.values(sample).some(value => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    filtered = filtered.filter(sample => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return sample[key as keyof Sample]?.toString().toLowerCase().includes(value.toLowerCase());
      });
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (sortConfig.order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [samples, activeTab, searchTerm, sortConfig, filters, selectedPatientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check if all required fields are filled
      const missingFields = newSamples.reduce((acc, sample, index) => {
        const requiredFields = {
          barcode: 'Barcode',
          patientId: 'Patient ID',
          type: 'Type',
          investigationType: 'Investigation Type',
          site: 'Site',
          timepoint: 'Timepoint',
          specimen: 'Specimen',
          specNumber: 'Spec Number',
          material: 'Material',
          sampleDate: 'Sample Date',
          sampleTime: 'Sample Time',
          sampleLevel: 'Sample Level'
        };

        const missing = Object.entries(requiredFields)
          .filter(([key]) => !sample[key as keyof Sample])
          .map(([_, label]) => label);

        if (missing.length > 0) {
          acc.push(`Row ${index + 1}: ${missing.join(', ')}`);
        }
        return acc;
      }, [] as string[]);

      if (missingFields.length > 0) {
        alert(`Please fill in all required fields:\n\n${missingFields.join('\n')}`);
        return;
      }

      await addSamples(newSamples);
      setIsNewSampleModalOpen(false);
      setNewSamples([{
        id: '',
        barcode: getNextBarcode([...samples].map(s => s.barcode)),
        patientId: '',
        type: 'blood',
        investigationType: 'Sequencing',
        status: 'Collected',
        site: 'UCLH',
        timepoint: 'Surgery',
        specimen: 'Plasma',
        specNumber: 'N01',
        material: 'Fresh',
        sampleDate: new Date().toISOString().split('T')[0],
        sampleTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
        freezer: '',
        shelf: '',
        box: '',
        position: '',
        sampleLevel: 'Original sample',
        comments: ''
      }]);
    } catch (error) {
      alert('Failed to add samples. Please try again.');
      console.error('Error:', error);
      return;
    }
  };

  const addNewSampleRow = () => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

    setNewSamples([...newSamples, {
      id: '',
      barcode: getNextBarcode([...samples, ...newSamples].map(s => s.barcode)),
      patientId: '',
      type: 'blood',
      investigationType: 'Sequencing',
      status: 'Collected',
      site: 'UCLH',
      timepoint: 'Surgery',
      specimen: 'Plasma',
      specNumber: 'N01',
      material: 'Fresh',
      sampleDate: now.toISOString().split('T')[0],
      sampleTime: currentTime,
      freezer: '',
      shelf: '',
      box: '',
      position: '',
      sampleLevel: 'Original sample',
      comments: ''
    }]);
  };

  const deleteNewSampleRow = (index: number) => {
    setNewSamples(newSamples.filter((_, i) => i !== index));
  };

  const updateNewSample = (index: number, field: keyof Sample, value: string) => {
    const updatedSamples = [...newSamples];
    if (field === 'sampleDate') {
      // When date is selected, automatically set the current time
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
      updatedSamples[index] = {
        ...updatedSamples[index],
        sampleDate: value,
        sampleTime: currentTime
      };
    } else {
      updatedSamples[index] = { 
        ...updatedSamples[index], 
        [field]: field === 'barcode' ? value : field === 'surplus' ? Boolean(value) : value,
        barcode: field === 'barcode' ? value : updatedSamples[index].barcode
      };
    }
    setNewSamples(updatedSamples);
  };

  const handleSampleSelection = (barcode: string) => {
    setSelectedSamples(prev => {
      const next = new Set(prev);
      if (next.has(barcode)) {
        next.delete(barcode);
      } else {
        next.add(barcode);
      }
      return next;
    });
  };

  const handleBulkAction = (action: typeof SAMPLE_ACTIONS[number]) => {
    switch (action) {
      case 'Derive':
        handleDeriveAction();
        break;
      default:
        console.log(`Performing ${action} on samples:`, selectedSamples);
    }
    setShowActionMenu(false);
  };

  const handleDeriveAction = () => {
    const selectedSamplesList = filteredAndSortedSamples.filter(s => selectedSamples.has(s.barcode));
    setParentSamples(selectedSamplesList);

    const initialDerived = selectedSamplesList.map(parent => ({
      id: '',
      barcode: getNextBarcode([...samples, ...derivedSamples].map(s => s.barcode)),
      patientId: parent.patientId,
      parentBarcode: parent.barcode,
      type: parent.type,
      investigationType: parent.investigationType,
      status: 'Collected',
      site: parent.site,
      timepoint: parent.timepoint,
      specimen: parent.specimen,
      specNumber: parent.specNumber,
      material: parent.material,
      sampleDate: new Date().toISOString().split('T')[0],
      sampleTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
      freezer: '',
      shelf: '',
      box: '',
      position: '',
      volume: undefined,
      amount: undefined,
      concentration: undefined,
      mass: undefined,
      surplus: false,
      sampleLevel: parent.sampleLevel === 'Original sample' ? 'Derivative' : 'Aliquot',
      comments: `Derived from ${parent.barcode}`
    }));

    setDerivedSamples(initialDerived);
    setIsDeriveModalOpen(true);
  };

  const handleDeriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await deriveSamples(parentSamples, derivedSamples);
      setIsDeriveModalOpen(false);
      setDerivedSamples([]);
      setParentSamples([]);
      setSelectedSamples(new Set());
    } catch (error) {
      console.error('Error deriving samples:', error);
      alert('Failed to derive samples. Please try again.');
    }
  };

  const updateDerivedSample = (index: number, field: keyof Sample, value: string) => {
    const updatedSamples = [...derivedSamples];
    if (field === 'sampleDate') {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
      updatedSamples[index] = {
        ...updatedSamples[index],
        sampleDate: value,
        sampleTime: currentTime
      };
    } else {
      updatedSamples[index] = {
        ...updatedSamples[index],
        [field]: field === 'barcode' ? value : field === 'surplus' ? Boolean(value) : value
      };
    }
    setDerivedSamples(updatedSamples);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const SortableHeader = ({ field, children }: { field: keyof Sample; children: React.ReactNode }) => (
    <th 
      scope="col" 
      className="px-2 py-1 text-left text-xs font-medium text-gray-700 uppercase tracking-wider group truncate bg-gray-100"
    >
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handleSort(field)}
          className="flex items-center hover:text-gray-700"
        >
          <span>{children}</span>
          <ArrowUpDown className="h-3 w-3 ml-1" />
        </button>
        <button
          onClick={() => {
            const value = prompt(`Filter ${children}`);
            setFilters(prev => ({ ...prev, [field]: value || '' }));
          }}
          className="opacity-0 group-hover:opacity-100 hover:text-blue-600"
        >
          <Filter className="h-3 w-3" />
        </button>
      </div>
    </th>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-[99%] mx-auto px-2">
          <div className="flex items-center justify-between h-16">
            <div className="flex flex-col items-center flex-shrink-0">
              <img 
                src="/attached_assets/CRUK_TracerX_Logo.png" 
                alt="TRACERx Logo" 
                className="h-12"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button 
                className="flex flex-col items-center px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                onClick={() => {}}
              >
                <FreezerIcon className="h-5 w-5 mb-1" />
                <span className="text-xs">LOCATIONS</span>
              </button>
              <button 
                className="flex flex-col items-center px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                onClick={() => {}}
              >
                <Printer className="h-5 w-5 mb-1" />
                <span className="text-xs">PRINTERS</span>
              </button>
              <button 
                className="flex flex-col items-center px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                onClick={() => {}}
              >
                <BarcodeIcon className="h-5 w-5 mb-1" />
                <span className="text-xs">1D BARCODE</span>
              </button>
              <button 
                className="flex flex-col items-center px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                onClick={() => {}}
              >
                <Paperclip className="h-5 w-5 mb-1" />
                <span className="text-xs">ATTACHMENTS</span>
              </button>
              <div className="flex items-center space-x-2 ml-2 border-l pl-2">
                <span className="text-sm text-gray-600">John Smith</span>
                <button 
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                  onClick={() => {}}
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[99%] mx-auto px-2 py-6">
        {selectedPatientId && (
          <div className="mb-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-700">
                Viewing samples for patient: {selectedPatientId}
              </span>
              <span className="text-sm text-blue-600">
                ({filteredAndSortedSamples.length} samples)
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-1 mb-4 flex-nowrap overflow-x-auto min-w-max">
          <button
            className={`flex items-center px-4 py-2 rounded-md ${
              showPatients 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } text-xs whitespace-nowrap`}
            onClick={() => setShowPatients(!showPatients)}
          >
            <Users className="h-4 w-4 mr-1" />
            <span className="font-medium">PATIENTS</span>
          </button>
          <button
            className={`flex items-center px-3 py-1.5 rounded-md ${
              activeTab === 'all' && !showPatients
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } text-xs whitespace-nowrap`}
            onClick={() => {
              setShowPatients(false);
              setActiveTab('all');
            }}
          >
            <TestTube className="h-4 w-4 mr-1" />
            <span className="font-medium">ALL SAMPLES ({samples.length})</span>
          </button>
          <button
            className={`flex items-center px-3 py-1.5 rounded-md ${
              activeTab === 'blood' && !showPatients
                ? 'bg-red-100 text-red-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } text-xs whitespace-nowrap`}
            onClick={() => {
              setShowPatients(false);
              setActiveTab('blood');
            }}
          >
            <Flask className="h-4 w-4 mr-1 text-blue-600" />
            <span className="font-medium">BLOOD ({samples.filter(s => s.type === 'blood').length})</span>
          </button>
          <button
            className={`flex items-center px-3 py-1.5 rounded-md ${
              activeTab === 'tissue' && !showPatients
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } text-xs whitespace-nowrap`}
            onClick={() => {
              setShowPatients(false);
              setActiveTab('tissue');
            }}
          >
            <TestTube className="h-4 w-4 mr-1 text-purple-600" />
            <span className="font-medium">TISSUE ({samples.filter(s => s.type === 'tissue').length})</span>
          </button>
          <button
            className={`flex items-center px-3 py-1.5 rounded-md ${
              activeTab === 'ffpe' && !showPatients
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } text-xs whitespace-nowrap`}
            onClick={() => {
              setShowPatients(false);
              setActiveTab('ffpe');
            }}
          >
            <FileStack className="h-4 w-4 mr-1 text-orange-600" />
            <span className="font-medium">FFPE BLOCK ({samples.filter(s => s.specimen === 'FFPE Block').length})</span>
          </button>
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
        </div>

        {showPatients ? (
          <div className="bg-white rounded-lg shadow overflow-hidden max-h-[calc(100vh-12rem)] overflow-y-auto">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-700 uppercase tracking-wider truncate bg-gray-100">ID</th>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-700 uppercase tracking-wider truncate bg-gray-100">Site</th>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-700 uppercase tracking-wider truncate bg-gray-100">Cohort</th>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-700 uppercase tracking-wider truncate bg-gray-100">Study</th>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-700 uppercase tracking-wider truncate bg-gray-100">
                      <select
                        className="form-select text-xs border-gray-300 rounded-md"
                        onChange={(e) => {
                          // Handle eligibility filter
                          const value = e.target.value as Eligibility;
                          setFilters(prev => ({ ...prev, eligibility: value }));
                        }}
                      >
                        <option value="">Eligibility</option>
                        <option value="eligible">Eligible</option>
                        <option value="ineligible">Ineligible</option>
                        <option value="withdrawn">Withdrawn</option>
                      </select>
                    </th>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-700 uppercase tracking-wider truncate bg-gray-100">Registration Date</th>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-700 uppercase tracking-wider truncate bg-gray-100">Samples</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uniquePatients.map((patient) => (
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
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">{patient.site}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">{patient.cohort}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">{patient.study}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs">
                        <span className={`px-1.5 inline-flex text-xs leading-4 font-semibold rounded-full
                          ${patient.eligibility === 'eligible' ? 'bg-green-100 text-green-800' :
                            patient.eligibility === 'ineligible' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                          {patient.eligibility}
                        </span>
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
        ) : (
          <>
            <div className="flex justify-between items-center mb-6 space-x-3">
              <div className="relative flex-1 max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Global search..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  className="flex items-center px-3 py-1.5 text-xs bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 whitespace-nowrap"
                  onClick={() => {}}
                >
                  <ArrowUpCircle className="h-3.5 w-3.5 mr-1" />
                  <span>New Shipment</span>
                </button>
                <button 
                  className="flex items-center px-3 py-1.5 text-xs bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 whitespace-nowrap"
                  onClick={() => {}}
                >
                  <ArrowDownCircle className="h-3.5 w-3.5 mr-1" />
                  <span>Receive Shipment</span>
                </button>
                {selectedPatientId && (
                  <button
                    onClick={() => setSelectedPatientId(null)}
                    className="flex items-center px-3 py-1.5 text-xs bg-orange-100 text-orange-600 rounded-md hover:bg-orange-200"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Clear Patient Filter
                  </button>
                )}
                <button 
                  className="flex items-center px-3 py-1.5 text-xs bg-green-100 text-green-600 rounded-md hover:bg-green-200 whitespace-nowrap"
                  onClick={() => setIsNewSampleModalOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  <span>Add Sample</span>
                </button>
                <button
                  onClick={() => setShowActionMenu(!showActionMenu)}
                  className="flex items-center px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 whitespace-nowrap"
                  disabled={selectedSamples.size === 0}
                >
                  <span className="mr-2">Actions</span>
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
                {showActionMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {SAMPLE_ACTIONS.map((action) => (
                        <button
                          key={action}
                          onClick={() => handleBulkAction(action)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                      <SortableHeader field="patientId">Patient</SortableHeader>
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
                      <SortableHeader field="sampleDate">Sample Date</SortableHeader>
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
                          <span className="px-1.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-green-100 text-green-800">
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
                          <input
                            type="checkbox"
                            checked={sample.surplus}
                            disabled
                            className="rounded border-gray-300 text-blue-600"
                          />
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{sample.comments}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
                        <th className="w-32 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Patient ID</th>
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
                          <td className="w-32 px-2 py-1">
                            <input
                              type="text"
                              value={sample.patientId}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^A-Za-z0-9_]/g, '').slice(0, 9);
                                updateNewSample(index, 'patientId', value);
                                // Update LTX ID with last 7 characters if length is 9
                                if (value.length === 9) {
                                  updateNewSample(index, 'ltxId', value.slice(-7));
                                }
                              }}
                              className="w-full text-xs border-gray-300 rounded-md"
                              required
                              maxLength={9}
                              pattern="[A-Z]_LTX\d{4}"
                              title="Patient ID must be in format: Letter_LTX0000 (e.g. U_LTX0003)"
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
              <button onClick={() => setIsDeriveModalOpen(false)}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleDeriveSubmit} className="p-3 overflow-y-auto">
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white sticky top-0 z-10">
                      <tr>
                        <th className="min-w-[40px] px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">#</th>
                        <th className="w-24 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Parent Barcode</th>
                        <th className="w-24 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Barcode</th>
                        <th className="w-32 px-2 py-1 text-left text-xs font-medium text-gray-700 truncate bg-gray-100">Patient ID</th>
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
                          <td className="w-32 px-2 py-1">
                            <input
                              type="text"
                              value={sample.patientId}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^A-Za-z0-9_]/g, '').slice(0, 9);
                                updateDerivedSample(index, 'patientId', value);
                                if (value.length === 9) {
                                  updateDerivedSample(index, 'ltxId', value.slice(-7));
                                }
                              }}
                              className="w-full text-xs border-gray-300 rounded-md"
                              required
                              maxLength={9}
                              pattern="[A-Z]_LTX\d{4}"
                              title="Patient ID must be in format: Letter_LTX0000 (e.g. U_LTX0003)"
                            />
                          </td>
                          <td className="w-28 px-2 py-1 text-xs text-gray-500">{sample.type}</td>
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
                          <td className="w-32 px-2 py-1">
                            <select
                              value={sample.specimen}
                              onChange={(e) => updateDerivedSample(index, 'specimen', e.target.value)}
                              className="w-full text-xs border-gray-300 rounded-md"
                            >
                              {getSpecimensByType(sample.type).map(specimen => (
                                <option key={specimen} value={specimen}>{specimen}</option>
                              ))}
                            </select>
                          </td>
                          <td className="w-20 px-2 py-1">
                            <select
                              value={sample.specNumber}
                              onChange={(e) => updateDerivedSample(index, 'specNumber', e.target.value)}
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
    </div>
  );
}


export default App