import { TaskWrapperInfo, PathInfo } from '../types/api';

const API_BASE_URL = 'http://localhost:3001/api';

export class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Task Wrappers
  async getTaskWrappers(): Promise<TaskWrapperInfo[]> {
    return this.request<TaskWrapperInfo[]>('/task-wrappers');
  }

  async getTaskWrapper(id: string): Promise<TaskWrapperInfo> {
    return this.request<TaskWrapperInfo>(`/task-wrappers/${id}`);
  }

  async activateTaskWrapper(id: string): Promise<void> {
    await this.request(`/task-wrappers/${id}/activate`, {
      method: 'POST',
    });
  }

  async completeTaskWrapper(id: string): Promise<void> {
    await this.request(`/task-wrappers/${id}`, {
      method: 'PUT',
    });
  }

  // Paths
  async getPaths(): Promise<PathInfo[]> {
    return this.request<PathInfo[]>('/paths');
  }
}

export const apiClient = new ApiClient(); 