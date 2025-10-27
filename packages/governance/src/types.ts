/**
 * Governance Types for Random Truffle
 *
 * Human-in-the-Loop (HITL) approval workflows and governance rules
 */

import type { ActivationRequest } from '@random-truffle/activation';

/**
 * Approval status
 */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';

/**
 * Approval request type
 */
export type ApprovalRequestType =
  | 'activation' // Audience activation
  | 'platform_config' // Platform configuration change
  | 'agent_prompt' // Agent prompt modification
  | 'mcp_connector' // MCP connector addition
  | 'infrastructure_change' // Terraform apply in production
  | 'cost_threshold'; // Cost threshold change

/**
 * Governance rule type
 */
export type GovernanceRuleType =
  | 'always_require_approval' // All changes require approval
  | 'threshold_based' // Approval required above threshold
  | 'role_based' // Approval based on user role
  | 'compliance_based'; // Approval for compliance flags

/**
 * Approval request
 */
export interface ApprovalRequest {
  id: string; // UUID
  type: ApprovalRequestType;
  status: ApprovalStatus;
  title: string;
  description: string;
  requestedBy: {
    userId: string;
    userName: string;
    userEmail: string;
    userRole: 'user' | 'admin' | 'superadmin';
  };
  tenantId: string;
  metadata: Record<string, unknown>; // Type-specific metadata
  createdAt: Date;
  expiresAt?: Date; // Auto-expire after X hours
  reviewedBy?: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  reviewedAt?: Date;
  decision?: {
    approved: boolean;
    reason?: string;
    comments?: string;
  };
}

/**
 * Activation approval request
 */
export interface ActivationApprovalRequest extends ApprovalRequest {
  type: 'activation';
  metadata: {
    activationRequest: ActivationRequest;
    audienceSize: number;
    channelCount: number;
    estimatedCost?: number;
    complianceFlags?: string[];
  };
}

/**
 * Governance rule
 */
export interface GovernanceRule {
  id: string;
  tenantId: string;
  type: GovernanceRuleType;
  requestType: ApprovalRequestType;
  enabled: boolean;
  conditions: RuleCondition[];
  approvers: string[]; // User IDs who can approve
  expirationHours?: number; // Auto-expire requests after X hours
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Rule condition
 */
export interface RuleCondition {
  field: string; // e.g., 'audienceSize', 'userRole', 'complianceFlags'
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'not_contains';
  value: unknown;
}

/**
 * Approval queue item
 */
export interface ApprovalQueueItem {
  request: ApprovalRequest;
  waitingTimeMs: number;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string[]; // User IDs
}

/**
 * Approval decision
 */
export interface ApprovalDecision {
  requestId: string;
  approved: boolean;
  reason?: string;
  comments?: string;
  reviewedBy: {
    userId: string;
    userName: string;
    userEmail: string;
  };
}

/**
 * Governance statistics
 */
export interface GovernanceStats {
  tenantId: string;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  expiredRequests: number;
  avgApprovalTimeMs: number;
  approvalRate: number; // % approved
  requestsByType: {
    type: ApprovalRequestType;
    count: number;
  }[];
  approvalsByReviewer: {
    userId: string;
    userName: string;
    totalApproved: number;
    totalRejected: number;
  }[];
}

/**
 * Governance configuration
 */
export interface GovernanceConfig {
  tenantId: string;
  enabled: boolean; // Global toggle for governance
  defaultExpirationHours: number; // Default: 24 hours
  notificationChannels: {
    email?: boolean;
    slack?: boolean;
    webhook?: string;
  };
  rules: GovernanceRule[];
  updatedAt: Date;
}
