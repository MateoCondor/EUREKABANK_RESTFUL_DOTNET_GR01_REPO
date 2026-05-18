import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for the Eurekabank REST API server (.NET / ASP.NET Core)
// HTTP: http://localhost:5170   HTTPS: https://localhost:7268
const API_BASE_URL = 'http://192.168.137.13:5170';

// ──────────────────────────────────────────────
// Token helpers
// ──────────────────────────────────────────────
const TOKEN_KEY = 'eureka_jwt_token';
const USER_KEY = 'eureka_user';

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

export async function setUser(user: { username: string; role: string }): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<{ username: string; role: string } | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

// ──────────────────────────────────────────────
// Generic fetch wrapper
// ──────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMessage = `Error ${res.status}`;
    try {
      const errorBody = await res.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
    } catch {
      // body is not JSON
    }
    throw new Error(errorMessage);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

// ──────────────────────────────────────────────
// Auth API
// ──────────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  await setToken(response.token);
  await setUser({ username: response.username, role: response.role });
  return response;
}

export async function logout(): Promise<void> {
  await removeToken();
}

// ──────────────────────────────────────────────
// Clients API
// ──────────────────────────────────────────────
export interface ClientResponse {
  id: number;
  name: string;
  dni: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  userId: number;
  username: string;
}

export interface ClientRequest {
  name: string;
  dni: string;
  email: string;
  phone: string;
  status?: 'ACTIVE' | 'INACTIVE';
  username: string;
  password: string;
}

export const clientsApi = {
  getAll: () => request<ClientResponse[]>('/clients'),
  getById: (id: number) => request<ClientResponse>(`/clients/${id}`),
  getByDni: (dni: string) => request<ClientResponse>(`/clients/dni/${dni}`),
  create: (data: ClientRequest) =>
    request<ClientResponse>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<ClientRequest>) =>
    request<ClientResponse>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ message: string }>(`/clients/${id}`, { method: 'DELETE' }),
};

// ──────────────────────────────────────────────
// Accounts API
// ──────────────────────────────────────────────
export type AccountStatus = 'ACTIVE' | 'BLOCKED' | 'CLOSED';
export type AccountType = 'SAVINGS' | 'CURRENT';

export interface AccountResponse {
  id: number;
  accountNumber: string;
  balance: number;
  status: AccountStatus;
  type: AccountType;
  clientId: number;
}

export interface AccountRequest {
  clientId: number;
  type: AccountType;
  status?: AccountStatus;
}

export const accountsApi = {
  getAll: () => request<AccountResponse[]>('/accounts'),
  getById: (id: number) => request<AccountResponse>(`/accounts/${id}`),
  getByClient: (clientId: number) =>
    request<AccountResponse[]>(`/accounts/client/${clientId}`),
  create: (data: AccountRequest) =>
    request<AccountResponse>('/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStatus: (id: number, status: AccountStatus) =>
    request<AccountResponse>(`/accounts/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  getBalance: (id: number) =>
    request<{ balance: number }>(`/accounts/${id}/balance`),
};

// ──────────────────────────────────────────────
// Transactions API
// ──────────────────────────────────────────────
export type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER';
export type TransferType = 'CREDIT' | 'DEBIT';

export interface TransactionResponse {
  id: number;
  type: TransactionType;
  transferType: TransferType | null;
  amount: number;
  fee: number | null;
  date: string;
  sourceAccountId: number;
  targetAccountId: number | null;
  description: string;
}

export interface DepositRequest {
  accountId: number;
  amount: number;
  description: string;
}

export interface WithdrawRequest {
  accountId: number;
  amount: number;
  description: string;
}

export interface TransferRequest {
  sourceAccountId: number;
  targetAccountId: number;
  amount: number;
  description: string;
  transferType: TransferType;
}

export const transactionsApi = {
  deposit: (data: DepositRequest) =>
    request<TransactionResponse>('/transactions/deposit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  withdraw: (data: WithdrawRequest) =>
    request<TransactionResponse>('/transactions/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  transfer: (data: TransferRequest) =>
    request<TransactionResponse>('/transactions/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getByAccount: (accountId: number) =>
    request<TransactionResponse[]>(`/transactions/account/${accountId}`),
};

// ──────────────────────────────────────────────
// Parameters API
// ──────────────────────────────────────────────
export interface ParameterResponse {
  id: number;
  key: string;
  value: string;
  description: string;
}

export const parametersApi = {
  getAll: () => request<ParameterResponse[]>('/parameters'),
  getByKey: (key: string) => request<ParameterResponse>(`/parameters/${key}`),
  create: (data: Omit<ParameterResponse, 'id'>) =>
    request<ParameterResponse>('/parameters', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<ParameterResponse>) =>
    request<ParameterResponse>(`/parameters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
