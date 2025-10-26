// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

export interface CreateUserDto {
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  role?: UserRole;
}

// Tenant types
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTenantDto {
  name: string;
  domain: string;
}

// Audience types
export interface Audience {
  id: string;
  name: string;
  description: string;
  tenantId: string;
  createdBy: string;
  sql: string;
  status: AudienceStatus;
  size?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum AudienceStatus {
  DRAFT = 'draft',
  BUILDING = 'building',
  READY = 'ready',
  ERROR = 'error',
}

export interface CreateAudienceDto {
  name: string;
  description: string;
  sql: string;
}

export interface UpdateAudienceDto {
  name?: string;
  description?: string;
  sql?: string;
  status?: AudienceStatus;
}

// Activation types
export interface Activation {
  id: string;
  audienceId: string;
  channel: ActivationChannel;
  platformAccountId: string;
  status: ActivationStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ActivationChannel {
  GOOGLE_ADS = 'google_ads',
  META = 'meta',
  TIKTOK = 'tiktok',
}

export enum ActivationStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ERROR = 'error',
}

export interface CreateActivationDto {
  audienceId: string;
  channel: ActivationChannel;
  platformAccountId: string;
}

// Platform Account types
export interface PlatformAccount {
  id: string;
  tenantId: string;
  channel: ActivationChannel;
  accountId: string;
  accountName: string;
  credentials: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlatformAccountDto {
  channel: ActivationChannel;
  accountId: string;
  accountName: string;
  credentials: Record<string, unknown>;
}

// Agent types
export interface AgentInvocation {
  id: string;
  agentName: string;
  userId: string;
  tenantId: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: AgentStatus;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export enum AgentStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// Authentication types
export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  expiresAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Analytics types
export interface AnalyticsDashboard {
  id: string;
  name: string;
  tenantId: string;
  createdBy: string;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MetricData {
  metric: string;
  value: number;
  timestamp: Date;
  dimensions?: Record<string, string>;
}

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string;
export type Timestamp = Date;
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };
