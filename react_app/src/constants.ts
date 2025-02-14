import { 
  InvestigationType, 
  Site, 
  Timepoint, 
  Specimen, 
  SpecNumber, 
  Material, 
  SampleLevel,
  Freezer,
  Shelf,
  Box,
  Position,
  SampleType
} from './types';

export const INVESTIGATION_TYPES: InvestigationType[] = [
  'Sequencing',
  'PDX',
  'Single Cell Analysis',
  'Organoids',
  'Cell of Origin',
  'Tissue Culture',
  'Immunology',
  'cfDNA/Sequencing',
  'Immune Analysis'
];

export const SITES: Site[] = [
  'UCLH',
  'Manchester',
  'Birmingham',
  'Aberdeen',
  'Leicester',
  'North Midd',
  'Rayal Free',
  'Whittington',
  'Cardiff',
  'Princess Alexandra',
  "St. Peter's",
  'Royal Brompton',
  'Southampton',
  'Sheffield',
  'Liverpool',
  'Barts',
  'Glasgow'
];

export const TIMEPOINTS: Timepoint[] = [
  'Before surgery',
  'Surgery',
  'First Recurrence',
  'Biopsy At  Recurrence',
  'Biopsy At Progression',
  'Metastasectomy At Recurrence',
  'Completion Of All Treatment',
  'FU After Surgery/Adjuvant Chemo',
  'First Progression After Recurrence',
  'Second Progression After Recurrence',
  'First CT On Treatment For Second Progression',
  'Third Progression After Recurrence',
  'Fourth Progression After Recurrence',
  'Fifth Progression After Recurrence'
];

export const SPECIMENS: Specimen[] = [
  // Blood specimens
  'Immunology LH',
  'Organoids LH',
  'cfDNA Streck',
  'Germline EDTA',
  'CTC_Peripheral Streck',
  'Methylation Streck',
  'Metabolomics LH',
  'TCR/BCR Tempus',

  // Tissue specimens
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
];

export const SPEC_NUMBERS: SpecNumber[] = [
  '',
  'N01',
  'N02',
  'N03',
  'T1R01',
  'T1R02',
  'T1R03',
  'T2R01',
  'T2R02',
  'T2R03',
  'LN01',
  'LN02',
  'LN03'
];

export const MATERIALS: Material[] = [
  'Frozen',
  'Fresh',
  'FFPE',
  'Ambient',
  'Wet Ice'
];

export const SAMPLE_LEVELS: SampleLevel[] = [
  'Original sample',
  'Derivative',
  'Aliquot'
];

export const SAMPLE_ACTIONS = [
  'Edit',
  'Derive',
  'Print Label',
  'Print Barcode',
  'View History',
  'Add Note',
  'Process Sample',
  'Run Analysis',
  'Extract DNA',
  'Download',
  'Upload',
  'Delete',
  'Send'
] as const;

export const FREEZERS: Freezer[] = [
  'Freezer 64',
  'Freezer 96',
  'Freezer 82',
  'Freezer 79'

export const ELIGIBILITY_OPTIONS = [
  'Eligible',
  'Not Eligible',
  'Pending Review',
  'Under Assessment',
  'Conditionally Eligible'
];

];

export const SHELVES: Shelf[] = [
  'Shelf A',
  'Shelf B',
  'Shelf C'
];

export const BOXES: Box[] = [
  '001',
  '002',
  '003',
  '004',
  '005',
  '006',
  '007'
];

export const POSITIONS: Position[] = [
  '1,1',
  '1,2',
  '1,3',
  '1,4',
  '1,5',
  '1,6',
  '1,7',
  '1,8',
  '1,9'
];

export const SAMPLE_TYPES: SampleType[] = [
  'Blood',
  'Tissue',
  'Buffy',
  'Plasma',
  'FFPE',
  'H&E',
  'DNA',
  'RNA'
];

export const getNextBarcode = (existingBarcodes: string[]): string => {
  const numbers = existingBarcodes.map(code => parseInt(code, 10));
  const maxNumber = Math.max(0, ...numbers);
  const nextNumber = maxNumber + 1;
  return nextNumber.toString().padStart(6, '0');
};

export const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatTime = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const PATIENT_ID_PATTERN = /^U_LTX[0-9]{4}$/;