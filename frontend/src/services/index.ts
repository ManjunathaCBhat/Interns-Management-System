// src/services/index.ts
export { internService } from './internService';
export { dsuService } from './dsuService';
export { ptoService } from './ptoService';
export { taskService } from './taskService';
export { projectService } from './projectService';
export { adminService } from './adminService';
export { batchService } from './batchService';

export type { Batch, BatchCreate, BatchUpdate } from './batchService';
export type { 
  DashboardStats, 
  RecentIntern, 
  BlockedIntern, 
  PendingPTO,
  BatchPerformance 
} from './adminService';
export type { PTORequest, PTOListParams } from './ptoService';
export type { DSUListParams } from './dsuService';
export type { TaskListParams } from './taskService';
export type { InternListParams, InternListResponse } from './internService';
