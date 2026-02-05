// // src/services/internService.ts
// // import apiClient from '@/lib/api';
// // import { Intern } from '@/types/intern';

// // export interface InternListParams {
// //   status?: string;
// //   internType?: string;
// //   batch?: string;
// //   skip?: number;
// //   limit?: number;
// // }

// // export interface InternListResponse {
// //   items: Intern[];
// //   total: number;
// //   skip: number;
// //   limit: number;
// // }

// // export const internService = {
// //   // Updated getAll with pagination support
// //   async getAll(params?: InternListParams): Promise<InternListResponse | Intern[]> {
// //     const searchParams = new URLSearchParams();
    
// //     if (params?.status) searchParams.append('status', params.status);
// //     if (params?.internType) searchParams.append('internType', params.internType);
// //     if (params?.batch) searchParams.append('batch', params.batch);
// //     if (params?.skip !== undefined) searchParams.append('skip', params.skip.toString());
// //     if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());
    
// //     const response = await apiClient.get(`/interns/?${searchParams}`);
// //     return response.data;
// //   },

// //   async getById(id: string): Promise<Intern> {
// //     const response = await apiClient.get(`/interns/${id}`);
// //     return response.data;
// //   },

// //   async create(data: Partial<Intern>): Promise<Intern> {
// //     const response = await apiClient.post('/interns/', data);
// //     return response.data;
// //   },

// //   async update(id: string, data: Partial<Intern>): Promise<Intern> {
// //     const response = await apiClient.patch(`/interns/${id}`, data);
// //     return response.data;
// //   },

// //   async delete(id: string): Promise<void> {
// //     await apiClient.delete(`/interns/${id}`);
// //   }
// // };
// // src/services/internService.ts
// import apiClient from '@/lib/api';
// import { Intern } from '@/types/intern';

// export interface InternListParams {
//   status?: string;
//   internType?: string;
//   batch?: string;
//   skip?: number;
//   limit?: number;
// }

// export interface InternListResponse {
//   items: Intern[];
//   total: number;
//   skip: number;
//   limit: number;
// }

// export const internService = {
//   // ✅ ALWAYS return paginated response
//   async getAll(params?: InternListParams): Promise<InternListResponse> {
//     const searchParams = new URLSearchParams();

//     if (params?.status) searchParams.append('status', params.status);
//     if (params?.internType) searchParams.append('internType', params.internType);
//     if (params?.batch) searchParams.append('batch', params.batch);
//     if (params?.skip !== undefined) searchParams.append('skip', params.skip.toString());
//     if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());

//     const response = await apiClient.get(`/interns/?${searchParams}`);
//     return response.data;  // Always returns InternListResponse
//   },

//   async getById(id: string): Promise<Intern> {
//     const response = await apiClient.get(`/interns/${id}`);
//     return response.data;
//   },

//   async create(data: Partial<Intern>): Promise<Intern> {
//     const response = await apiClient.post('/interns/', data);
//     return response.data;
//   },

//   async update(id: string, data: Partial<Intern>): Promise<Intern> {
//     const response = await apiClient.patch(`/interns/${id}`, data);
//     return response.data;
//   },

//   async delete(id: string): Promise<void> {
//     await apiClient.delete(`/interns/${id}`);
//   }
// };



// src/services/internService.ts

import apiClient from '@/lib/api';
import { Intern } from '@/types/intern';

/* -------------------- Types -------------------- */

export interface InternListParams {
  status?: string;
  internType?: string;
  batch?: string;
  skip?: number;
  limit?: number;
}

export interface InternListResponse {
  items: Intern[];
  total: number;
  skip: number;
  limit: number;
}

/* -------------------- Service -------------------- */

export const internService = {
  /**
   * Get all interns (paginated)
   * Backend returns:
   * {
   *   items: Intern[],
   *   total: number,
   *   skip: number,
   *   limit: number
   * }
   */
  async getAll(params?: InternListParams): Promise<InternListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.status) searchParams.append('status', params.status);
    if (params?.internType) searchParams.append('internType', params.internType);
    if (params?.batch) searchParams.append('batch', params.batch);
    if (params?.skip !== undefined) searchParams.append('skip', String(params.skip));
    if (params?.limit !== undefined) searchParams.append('limit', String(params.limit));

    const response = await apiClient.get(`/interns/?${searchParams.toString()}`);

    return response.data;
  },

  /**
   * Get intern by ID
   */
  async getById(id: string): Promise<Intern> {
    const response = await apiClient.get(`/interns/${id}`);
    return response.data;
  },

  /**
   * Create intern
   */
  async create(data: Partial<Intern>): Promise<Intern> {
    const response = await apiClient.post('/interns/', data);
    return response.data;
  },

  /**
   * Update intern
   */
  async update(id: string, data: Partial<Intern>): Promise<Intern> {
    const response = await apiClient.patch(`/interns/${id}`, data);
    return response.data;
  },

  /**
   * Delete intern
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/interns/${id}`);
  }
};
