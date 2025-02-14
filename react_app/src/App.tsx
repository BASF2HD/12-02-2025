import React, { useState, useMemo, useEffect } from 'react';
import { Users, ArrowUpCircle, ArrowDownCircle, Search, X, Plus, ArrowUpDown, Filter, Settings, MoreVertical, TestTube, FileStack, Microscope, FlaskRound as Flask, Dna, Droplets, Printer, Barcode as BarcodeIcon, Paperclip, Pencil, Download, Upload, Trash2, Send, BarChart } from 'lucide-react';
import { CRUKLogo } from './components/CRUKLogo';
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
import { TableColumnManager } from './components/TableColumnManager';
import { TreeView } from './components/TreeView';
import { LocationManager } from './components/LocationManager';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AdminPanel from './components/AdminPanel';
import { DashboardGraphs } from './components/DashboardGraphs'; // Added import

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showLocationManager, setShowLocationManager] = useState(false);
  const [showPatients, setShowPatients] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { samples, loading, error, addSamples, updateSample } = useSamples();
  const [activeTab, setActiveTab] = useState<'blood' | 'tissue' | 'ffpe' | 'he' | 'buffy' | 'plasma' | 'dna' | 'rna' | 'all' | 'tree' | 'dashboard'>('blood');
  const [isNewSampleModalOpen, setIsNewSampleModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ field: keyof Sample; order: 'asc' | 'desc' }>({
    field: 'barcode',
    order: 'asc'
  });
  const [filters, setFilters] = useState<Partial<Record<keyof Sample, string>>>({});
  const [selectedSamples, setSelectedSamples] = useState<Set<string>>(new Set());
  const [showActionMenu, setShowActionMenu] = useState(false);
  const actionMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setShowActionMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [isDeriveModalOpen, setIsDeriveModalOpen] = useState(false);
  const [parentSamples, setParentSamples] = useState<Sample[]>([]);
  const [derivedSamples, setDerivedSamples] = useState<Sample[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSample, setEditingSample] = useState<Sample | null>(null);

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
      ltxId: id.slice(-7),
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

    filtered = filtered.filter(sample => {
      const searchLower = searchTerm.toLowerCase();
      return Object.entries(sample).some(([key, value]) => {
        if (value === null || value === undefined) return false;
        const stringValue = value.toString().toLowerCase();
        // Skip searching in certain fields
        if (['id', 'surplus'].includes(key)) return false;
        return stringValue.includes(searchLower);
      });
    });

    filtered = filtered.filter(sample => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const filterValues = value.split(',').filter(Boolean);
        if (filterValues.length === 0) return true;
        return filterValues.includes(sample[key as keyof Sample]?.toString());
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
    const lastSample = newSamples[newSamples.length - 1];

    setNewSamples([...newSamples, {
      id: '',
      barcode: getNextBarcode([...samples, ...newSamples].map(s => s.barcode)),
      patientId: lastSample?.patientId || '',
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
    } else if (field === 'patientId') {
      // When patientId is entered, automatically set the LTX ID
      const ltxId = value.length >= 7 ? value.slice(-7) : '';
      updatedSamples[index] = {
        ...updatedSamples[index],
        patientId: value,
        ltxId: ltxId
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

  const handleBulkAction = async (action: typeof SAMPLE_ACTIONS[number]) => {
    try {
      switch (action) {
        case 'Derive':
          handleDeriveAction();
          break;
        case 'Edit':
          handleEditAction();
          break;
        case 'Delete':
          if (window.confirm('Are you sure you want to delete the selected samples? This action cannot be undone.')) {
            try {
              const samplesToDelete = samples.filter(sample => selectedSamples.has(sample.barcode));
              if (samplesToDelete.length > 0) {
                const sampleIds = samplesToDelete.map(sample => sample.id);
                const updatedSamples = await deleteSamples(sampleIds);
                setSelectedSamples(new Set());
                setSamples(updatedSamples);
              }
            } catch (error) {
              console.error('Error deleting samples:', error);
            }
          }
          break;
        default:
          console.log(`Performing ${action} on samples:`, selectedSamples);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform action. Please try again.');
    } finally {
      setShowActionMenu(false);
    }
  };

  const handleDeriveAction = () => {
    const selectedSamplesList = filteredAndSortedSamples.filter(s => selectedSamples.has(s.barcode));
    setParentSamples(selectedSamplesList);

    const initialDerived = selectedSamplesList.map(parent => ({
      id: '',
      barcode: getNextBarcode([...samples, ...derivedSamples].map(s => s.barcode)),
      ltxId: parent.ltxId,
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
      const selectedSamplesArray = Array.from(selectedSamples);
      const parentSamplesList = samples.filter(sample => 
        selectedSamplesArray.includes(sample.barcode)
      );
      if (!parentSamplesList.length) {
        throw new Error('No parent samples found');
      }
      const result = await deriveSamples(parentSamplesList, derivedSamples);
      if (!result) {
        throw new Error('Failed to derive samples');
      }
      setIsDeriveModalOpen(false);
      setDerivedSamples([]);
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

  const handleEditAction = () => {
    if (selectedSamples.size === 1) {
      const [sampleBarcode] = selectedSamples;
      const sampleToEdit = filteredAndSortedSamples.find(sample => sample.barcode === sampleBarcode);
      if (sampleToEdit) {
        setEditingSample(sampleToEdit);
        setIsEditModalOpen(true);
      }
    } else {
      alert('Please select only one sample to edit.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSample) {
      try {
        await updateSample(editingSample);
        setIsEditModalOpen(false);
        setEditingSample(null);
      } catch (error) {
        console.error('Error updating sample:', error);
        alert('Failed to update sample');
      }
    }
  };
  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setEditingSample(null);
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
          onClick={(e) => {
            e.stopPropagation();
            const filterOptions = {
              type: ['blood', 'tissue', 'ffpe', 'he', 'buffy', 'plasma', 'dna', 'rna'],
              investigationType: INVESTIGATION_TYPES,
              site: SITES,
              timepoint: TIMEPOINTS,
              specimen: SPECIMENS,
              specNumber: SPEC_NUMBERS,
              material: MATERIALS,
              sampleLevel: SAMPLE_LEVELS,
              status: ['Collected', 'Shipped', 'Received', 'In Storage', 'In Process', 'Completed']
            };

            if (filterOptions[field]) {
              const dropdown = document.createElement('div');
              dropdown.className = 'fixed mt-1 w-48 bg-white border rounded-md shadow-lg z-[100]';
              const rect = e.currentTarget.getBoundingClientRect();
              dropdown.style.top = `${rect.bottom + window.scrollY}px`;
              dropdown.style.left = `${rect.left + window.scrollX}px`;

              const currentFilters = filters[field]?.split(',').filter(Boolean) || [];

              const container = document.createElement('div');
              container.className = 'p-1.5';

              const header = document.createElement('div');
              header.className = 'flex justify-between items-center mb-1';
              header.innerHTML = `
                <span class="text-[0.7rem] text-gray-500">Filter by ${field}</span>
                <button class="text-[0.7rem] text-blue-500 hover:text-blue-700" id="clearAll">Clear</button>
              `;

              const content = document.createElement('div');
              content.className = 'max-h-48 overflow-y-auto';

              filterOptions[field].forEach(opt => {
                const label = document.createElement('label');
                label.className = 'flex items-center py-0.5 cursor-pointer hover:bg-gray-50';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'w-3 h-3 rounded border-gray-300';
                checkbox.value = opt;
                checkbox.checked = currentFilters.includes(opt);

                checkbox.addEventListener('click', (e) => {
                  e.stopPropagation();
                });

                const span = document.createElement('span');
                span.className = 'text-[0.7rem] text-gray-600 ml-1.5 font-normal';
                span.textContent = opt;

                label.appendChild(checkbox);
                label.appendChild(span);
                content.appendChild(label);
              });

              const footer = document.createElement('div');
              footer.className = 'flex justify-end mt-1 pt-1 border-t';
              footer.innerHTML = `
                <button class="px-2 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600" id="applyFilter">Apply</button>
              `;

              container.appendChild(header);
              container.appendChild(content);
              container.appendChild(footer);
              dropdown.appendChild(container);

              const clearButton = dropdown.querySelector('#clearAll');
              const applyButton = dropdown.querySelector('#applyFilter');

              clearButton?.addEventListener('click', (e) => {
                e.stopPropagation();
                const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
                checkboxes.forEach(checkbox => {
                  checkbox.checked = false;
                });
                checkboxes.forEach((cb: HTMLInputElement) => cb.checked = false);
              });

              applyButton?.addEventListener('click', () => {
                const selectedValues = Array.from(dropdown.querySelectorAll('input[type="checkbox"]:checked'))
                  .map((cb: HTMLInputElement) => cb.value)
                  .join(',');
                setFilters(prev => ({ ...prev, [field]: selectedValues }));
                dropdown.remove();
              });

              e.currentTarget.appendChild(dropdown);
            } else {
              const value = prompt(`Filter ${children}`);
              setFilters(prev => ({ ...prev, [field]: value || '' }));
            }
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
              <CRUKLogo className="h-12" />
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative flex-1 max-w-lg mr-4">
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
              <button 
                className="flex flex-col items-center px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                onClick={() => setShowLocationManager(true)}
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
                <span className="text-xs">LABEL TEMPLATE</span>
              </button>
              <button 
                className="flex flex-col items-center px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                onClick={() => {}}
              >
                <Paperclip className="h-5 w-5 mb-1" />
                <span className="text-xs">ATTACHMENTS</span>
              </button>

              <button 
                className="flex flex-col items-center px-4 py-2 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                onClick={() => setActiveTab('dashboard')} // Added onClick handler
              >
                <BarChart className="h-5 w-5 mb-1" />
                <span className="text-xs">DASHBOARD</span>
              </button>
              <button 
                className="flex flex-col items-center px-4 py-2 text-sm bg-green-100 text-green-600 rounded-md hover:bg-green-200"
                onClick={() => {
                  setFilters(prev => ({ ...prev, dateReceived: '' }));
                }}
              >
                <ArrowDownCircle className="h-5 w-5 mb-1" />
                <span className="text-xs">RECEIVE</span>
              </button>
              <div className="flex items-center space-x-2 ml-2 border-l pl-2">
                <span className="text-sm text-gray-600">John Smith</span>
                <button 
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                  onClick={() => setShowAdminPanel(true)}
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[99%] mx-auto px-2 py-6">

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
              activeTab === 'tree' 
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } text-xs whitespace-nowrap mr-2`}
            onClick={() => {
              setShowPatients(false);
              setActiveTab('tree');
            }}
          >
            <FileStack className="h-4 w-4 mr-1" />
            <span className="font-medium">TREE VIEW</span>
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
            <span className="mr-1 text-purple-600">🫁</span>
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
            className={`flex itemscenter px-3 py-1.5 rounded-md ${
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
                      className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedPatient(patient)}
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
                </tbody>              </table>
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
                              onClick={()=> deleteNewSampleRow(index)}
                              className="text-red-600 hover:text-red800"
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
      {activeTab === 'dashboard' && <DashboardGraphs samples={samples} />}
      {showLocationManager && <LocationManager onClose={() => setShowLocationManager(false)} />}
    </div>
  );
}


export default App