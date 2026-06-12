export interface Permission {
  id?: number
  name?: string
  key: string
  resource?: string
}

export interface Role {
  id?: number
  name?: string
  key: string
  permissions: Permission[]
}

export interface User {
  id: number
  role_id?: number
  name: string
  email: string
  avatar?: string | null
  phone_number?: string | null
  address_id?: number | null
  role: Role
}

export interface LoginResponse {
  access_token: string
  user: User
}

export interface AddressDevice {
  id?: number
  name: string
  status: string
  device_code?: string
}

export interface Address {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
  created_at: string
  updated_at: string
  devices?: AddressDevice[]
}

export interface Device {
  id: number
  device_code: string
  qr_code_url: string
  name: string
  status: string
  last_active: string
  address_id: number
  address?: Address
  created_at: string
  updated_at: string
}

export interface Payment {
  id: number
  transaction_id: number
  external_id: string
  invoice_id: string
  payment_method: string | null
  status: string
  invoice_url: string
  expiry_date: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: number
  device_id: number
  user_id: number
  total_galon: number
  total_price: number
  status: string
  created_at: string
  updated_at: string
  payment?: Payment
  device?: Device
  user?: User
}

export interface WaterFillLog {
  id: number
  transaction_id: number
  amount: number
  filled_at: string
  created_at: string
  updated_at: string
}

export interface TransactionHistory {
  id: number
  transaction_id: number
  status: string
  note?: string | null
  created_at: string
  updated_at: string
}

export interface TransactionDetail extends Transaction {
  water_fill_logs?: WaterFillLog[]
  transaction_histories?: TransactionHistory[]
}

export interface ProfileUpdateInput {
  name?: string
  email?: string
  password?: string
  phone_number?: string
  avatar?: File
}

export interface TransactionStats {
  date: string
  total_galon: number
  total_price: number
}

export interface ApiResponse<T> {
  message: string
  data: T
}
