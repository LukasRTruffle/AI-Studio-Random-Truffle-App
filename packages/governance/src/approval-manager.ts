/**
 * Approval Manager for Random Truffle
 *
 * Manages approval request lifecycle and state transitions
 */

import type { ApprovalRequest, ApprovalDecision, ApprovalQueueItem, GovernanceRule } from './types';

/**
 * Approval event for audit log
 */
export interface ApprovalEvent {
  requestId: string;
  eventType: 'created' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  userId?: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

/**
 * Approval Manager
 *
 * Handles:
 * - Request creation and validation
 * - State transitions (pending → approved/rejected/expired)
 * - Queue management
 * - Audit logging
 */
export class ApprovalManager {
  private approvalRequests: Map<string, ApprovalRequest> = new Map();
  private auditLog: ApprovalEvent[] = [];

  /**
   * Create a new approval request
   */
  async createRequest(
    request: Omit<ApprovalRequest, 'id' | 'createdAt' | 'status'>
  ): Promise<ApprovalRequest> {
    const approvalRequest: ApprovalRequest = {
      ...request,
      id: this.generateId(),
      status: 'pending',
      createdAt: new Date(),
    };

    // Set expiration if not provided
    if (!approvalRequest.expiresAt) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Default: 24 hours
      approvalRequest.expiresAt = expiresAt;
    }

    this.approvalRequests.set(approvalRequest.id, approvalRequest);

    // Log event
    this.logEvent({
      requestId: approvalRequest.id,
      eventType: 'created',
      userId: request.requestedBy.userId,
      timestamp: new Date(),
      details: { type: request.type },
    });

    return approvalRequest;
  }

  /**
   * Approve a request
   */
  async approve(requestId: string, decision: ApprovalDecision): Promise<ApprovalRequest> {
    const request = this.approvalRequests.get(requestId);
    if (!request) {
      throw new Error(`Approval request ${requestId} not found`);
    }

    // Validate state transition
    if (request.status !== 'pending') {
      throw new Error(`Cannot approve request in ${request.status} status`);
    }

    // Check if expired
    if (request.expiresAt && new Date() > request.expiresAt) {
      request.status = 'expired';
      throw new Error(`Approval request ${requestId} has expired`);
    }

    // Update request
    request.status = 'approved';
    request.reviewedBy = decision.reviewedBy;
    request.reviewedAt = new Date();
    request.decision = {
      approved: true,
      reason: decision.reason,
      comments: decision.comments,
    };

    this.approvalRequests.set(requestId, request);

    // Log event
    this.logEvent({
      requestId,
      eventType: 'approved',
      userId: decision.reviewedBy.userId,
      timestamp: new Date(),
      details: { reason: decision.reason },
    });

    return request;
  }

  /**
   * Reject a request
   */
  async reject(requestId: string, decision: ApprovalDecision): Promise<ApprovalRequest> {
    const request = this.approvalRequests.get(requestId);
    if (!request) {
      throw new Error(`Approval request ${requestId} not found`);
    }

    // Validate state transition
    if (request.status !== 'pending') {
      throw new Error(`Cannot reject request in ${request.status} status`);
    }

    // Update request
    request.status = 'rejected';
    request.reviewedBy = decision.reviewedBy;
    request.reviewedAt = new Date();
    request.decision = {
      approved: false,
      reason: decision.reason,
      comments: decision.comments,
    };

    this.approvalRequests.set(requestId, request);

    // Log event
    this.logEvent({
      requestId,
      eventType: 'rejected',
      userId: decision.reviewedBy.userId,
      timestamp: new Date(),
      details: { reason: decision.reason },
    });

    return request;
  }

  /**
   * Cancel a pending request
   */
  async cancel(requestId: string, userId: string): Promise<ApprovalRequest> {
    const request = this.approvalRequests.get(requestId);
    if (!request) {
      throw new Error(`Approval request ${requestId} not found`);
    }

    // Validate state transition
    if (request.status !== 'pending') {
      throw new Error(`Cannot cancel request in ${request.status} status`);
    }

    // Only requestor can cancel
    if (request.requestedBy.userId !== userId) {
      throw new Error(`Only the requestor can cancel this request`);
    }

    // Update request
    request.status = 'cancelled';

    this.approvalRequests.set(requestId, request);

    // Log event
    this.logEvent({
      requestId,
      eventType: 'cancelled',
      userId,
      timestamp: new Date(),
    });

    return request;
  }

  /**
   * Get pending approval queue
   */
  async getQueue(tenantId: string): Promise<ApprovalQueueItem[]> {
    const now = new Date();
    const queueItems: ApprovalQueueItem[] = [];

    for (const [id, request] of this.approvalRequests) {
      if (request.tenantId !== tenantId) continue;
      if (request.status !== 'pending') continue;

      // Check if expired
      if (request.expiresAt && now > request.expiresAt) {
        request.status = 'expired';
        this.approvalRequests.set(id, request);
        this.logEvent({
          requestId: id,
          eventType: 'expired',
          timestamp: now,
        });
        continue;
      }

      const waitingTimeMs = now.getTime() - request.createdAt.getTime();

      // Calculate priority based on waiting time
      let priority: 'low' | 'medium' | 'high' = 'low';
      const waitingHours = waitingTimeMs / (1000 * 60 * 60);
      if (waitingHours > 12) priority = 'high';
      else if (waitingHours > 4) priority = 'medium';

      queueItems.push({
        request,
        waitingTimeMs,
        priority,
      });
    }

    // Sort by priority (high first) then by waiting time (oldest first)
    queueItems.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.waitingTimeMs - a.waitingTimeMs;
    });

    return queueItems;
  }

  /**
   * Get request by ID
   */
  async getRequest(requestId: string): Promise<ApprovalRequest | undefined> {
    return this.approvalRequests.get(requestId);
  }

  /**
   * Get audit log for a request
   */
  getAuditLog(requestId: string): ApprovalEvent[] {
    return this.auditLog.filter((event) => event.requestId === requestId);
  }

  /**
   * Log an approval event
   */
  private logEvent(event: ApprovalEvent): void {
    this.auditLog.push(event);
    // In production: write to database, send to telemetry, etc.
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `apr_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Check if approval is required based on rules
   */
  static isApprovalRequired(
    rules: GovernanceRule[],
    requestType: ApprovalRequest['type'],
    metadata: Record<string, unknown>
  ): boolean {
    const applicableRules = rules.filter(
      (rule) => rule.enabled && rule.requestType === requestType
    );

    if (applicableRules.length === 0) {
      return false;
    }

    // If any rule matches, approval is required
    return applicableRules.some((rule) => this.evaluateRule(rule, metadata));
  }

  /**
   * Evaluate a single governance rule
   */
  private static evaluateRule(rule: GovernanceRule, metadata: Record<string, unknown>): boolean {
    if (rule.type === 'always_require_approval') {
      return true;
    }

    // All conditions must match (AND logic)
    return rule.conditions.every((condition) => {
      const fieldValue = metadata[condition.field];
      return this.evaluateCondition(fieldValue, condition.operator, condition.value);
    });
  }

  /**
   * Evaluate a single condition
   */
  private static evaluateCondition(
    fieldValue: unknown,
    operator: string,
    conditionValue: unknown
  ): boolean {
    switch (operator) {
      case 'eq':
        return fieldValue === conditionValue;
      case 'ne':
        return fieldValue !== conditionValue;
      case 'gt':
        return Number(fieldValue) > Number(conditionValue);
      case 'gte':
        return Number(fieldValue) >= Number(conditionValue);
      case 'lt':
        return Number(fieldValue) < Number(conditionValue);
      case 'lte':
        return Number(fieldValue) <= Number(conditionValue);
      case 'contains':
        return Array.isArray(fieldValue) && fieldValue.includes(conditionValue);
      case 'not_contains':
        return Array.isArray(fieldValue) && !fieldValue.includes(conditionValue);
      default:
        return false;
    }
  }
}
