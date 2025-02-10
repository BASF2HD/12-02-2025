
create table if not exists samples (
  id uuid default gen_random_uuid() primary key,
  barcode text not null,
  patient_id text not null,
  parent_barcode text,
  type text not null,
  investigation_type text not null,
  status text not null,
  site text not null,
  timepoint text not null,
  specimen text not null,
  spec_number text not null,
  material text not null,
  sample_date date not null,
  sample_time time not null,
  freezer text,
  shelf text,
  box text,
  position text,
  volume numeric,
  amount numeric,
  concentration numeric,
  mass numeric,
  surplus boolean default false,
  sample_level text not null,
  comments text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists samples_barcode_idx on samples(barcode);
create index if not exists samples_patient_id_idx on samples(patient_id);
