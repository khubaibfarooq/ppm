// Core
export interface User {
  id: number;
  name: string;
  email: string;
  employee_code: string;
  phone: string;
  cnic: string;
  designation: string;
  basic_salary: number;
  join_date: string;
  status: 'active' | 'inactive' | 'terminated';
  roles: Role[];
  permissions: string[];
  station: Station;
}

export interface Role {
  id: number;
  name: string;
}

export interface Station {
  id: number;
  name: string;
  address: string;
  phone: string;
  license_number: string;
  is_active: boolean;
}

// Shifts
export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

export interface ShiftLog {
  id: number;
  shift: Shift;
  date: string;
  status: 'open' | 'closed' | 'verified';
  opened_at: string;
  closed_at: string | null;
  total_liters_sold: number;
  total_revenue: number;
  total_cash: number;
  short_excess: number;
  opened_by: User;
  closed_by: User | null;
}

// Tanks
export interface Tank {
  id: number;
  name: string;
  product: Product;
  capacity_liters: number;
  current_liters: number;
  low_level_alert: number;
  fill_percentage: number;
  is_active: boolean;
}

export interface DipReading {
  id: number;
  tank: Tank;
  shift_log: ShiftLog;
  reading_type: 'opening' | 'closing';
  dip_mm: number;
  liters_from_chart: number;
  water_dip_mm: number;
  recorded_at: string;
}

// Machines
export interface Machine {
  id: number;
  name: string;
  serial_number: string;
  brand: string;
  is_active: boolean;
  nozzles: Nozzle[];
}

export interface Nozzle {
  id: number;
  machine: Machine;
  tank: Tank;
  product: Product;
  label: string;
  is_active: boolean;
}

export interface MeterReading {
  id: number;
  nozzle: Nozzle;
  shift_log: ShiftLog;
  reading_type: 'opening' | 'closing';
  reading_value: number;
  recorded_at: string;
}

// Products
export interface Product {
  id: number;
  name: string;
  code: string;
  unit: string;
  type: 'fuel' | 'lubricant' | 'other';
  current_price: number;
  current_cost: number;
  is_active: boolean;
}

// Sales
export interface ShiftSale {
  id: number;
  nozzle: Nozzle;
  product: Product;
  opening_reading: number;
  closing_reading: number;
  liters_sold: number;
  sale_price: number;
  gross_amount: number;
}

// Accounting
export interface Account {
  id: number;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  sub_type: string;
  normal_balance: 'debit' | 'credit';
  parent_id: number | null;
  children?: Account[];
  balance?: number;
  is_active: boolean;
}

export interface Journal {
  id: number;
  journal_number: string;
  type: string;
  date: string;
  narration: string;
  total_debit: number;
  total_credit: number;
  is_posted: boolean;
  entries: JournalEntry[];
  created_by: User;
}

export interface JournalEntry {
  id: number;
  account: Account;
  debit: number;
  credit: number;
  description: string;
}

// Inertia Page Props
export interface PageProps {
  auth: { user: User };
  flash: { success?: string; error?: string };
  station: Station;
  [key: string]: unknown;
}
