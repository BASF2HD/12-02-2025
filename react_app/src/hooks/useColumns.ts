
import { useTableColumns, type ColumnConfig } from './useTableColumns';
import type { Sample } from '../types';

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'checkbox', label: '', visible: true, order: 0 },
  { id: 'barcode', label: 'Barcode', visible: true, order: 1 },
  { id: 'ltxId', label: 'LTX ID', visible: true, order: 2 },
  { id: 'patientId', label: 'Patient ID', visible: true, order: 3 },
  { id: 'type', label: 'Type', visible: true, order: 4 },
  { id: 'investigationType', label: 'Investigation Type', visible: true, order: 5 },
  { id: 'timepoint', label: 'Timepoint', visible: true, order: 6 },
  { id: 'sampleLevel', label: 'Sample Level', visible: true, order: 7 },
  { id: 'specimen', label: 'Specimen', visible: true, order: 8 },
  { id: 'specNumber', label: 'Spec#', visible: true, order: 9 },
  { id: 'material', label: 'Material', visible: true, order: 10 },
  { id: 'sampleDate', label: 'Sample Date', visible: true, order: 11 },
  { id: 'site', label: 'Site', visible: true, order: 12 },
  { id: 'freezer', label: 'Freezer', visible: true, order: 13 },
  { id: 'shelf', label: 'Shelf', visible: true, order: 14 },
  { id: 'box', label: 'Box', visible: true, order: 15 },
  { id: 'position', label: 'Position', visible: true, order: 16 },
  { id: 'volume', label: 'Volume (ml)', visible: true, order: 17 },
  { id: 'amount', label: 'Amount (mg)', visible: true, order: 18 },
  { id: 'concentration', label: 'Conc. (ng/µL)', visible: true, order: 19 },
  { id: 'mass', label: 'Mass (ng)', visible: true, order: 20 },
  { id: 'surplus', label: 'Surplus', visible: true, order: 21 },
  { id: 'status', label: 'Status', visible: true, order: 22 },
  { id: 'dateSent', label: 'Date Sent', visible: true, order: 23 },
  { id: 'dateReceived', label: 'Date Received', visible: true, order: 24 },
  { id: 'comments', label: 'Comments', visible: true, order: 25 }
];

export function useColumns() {
  return useTableColumns(DEFAULT_COLUMNS);
}
