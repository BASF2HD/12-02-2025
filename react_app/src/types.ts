// Add to existing types.ts file
export interface Sample {
  id: string;
  barcode: string;
  ltxId: string;
  patientId: string;
  parentBarcode?: string; // Add this field to track parent sample
  type: SampleType;
  investigationType: string;
  status: string;
  site: string;
  timepoint: string;
  specimen: string;
  specNumber: string;
  material: string;
  sampleDateTime: string;
  freezer?: string;
  shelf?: string;
  box?: string;
  position?: string;
  volume?: number;
  amount?: number;
  concentration?: number;
  mass?: number;
  surplus: boolean;
  sampleLevel: string;
  comments?: string;
}

export enum SampleType {
  Blood = 'Blood',
  Tissue = 'Tissue',
  Buffy = 'Buffy',
  Plasma = 'Plasma',
  FFPE = 'FFPE',
  HAndE = 'H&E',
  DNA = 'DNA',
  RNA = 'RNA'
}

export type Permission = 
  | 'manage_users'
  | 'view_users'
  | 'manage_samples'
  | 'view_samples'
  | 'manage_permissions'
  | 'view_logs';

export type LogAction = 
  | 'user_login'
  | 'user_logout'
  | 'sample_created'
  | 'sample_updated'
  | 'sample_deleted'
  | 'permission_updated';

export interface Log {
  id: string;
  userId: string;
  action: LogAction;
  details: string;
  timestamp: string;
  userEmail?: string;
}

export interface UserWithPermissions extends User {
  permissions: Permission[];
}

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'read_only' | 'full_access';
};