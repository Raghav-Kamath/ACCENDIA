import axios from 'axios';
import { AxiosError } from 'axios';

// Use the correct port that matches the Flask server
const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('📤 Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('📤 Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error: AxiosError) => {
    console.error('📥 Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export interface UploadResponse {
  content: string;
  tasks: string[];
}

export interface QueryResponse {
  payload: any[];
}

export interface TaskStatus {
  state: string;
  task_id: string;
  task_result?: string;
  task_status?: string;
  result?: any;
  current?: number;
  status?: string;
}

export async function uploadFile(file: File, projectId: string) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('📤 Uploading file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      projectId,
    });

    const response = await api.post(`/api/upload/gpt/${projectId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: [(data) => data], // Prevent axios from transforming FormData
    });

    console.log('📥 Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
}

export async function queryDocuments(projectId: string, model: string, query: string) {
  try {
    console.log('📤 Querying documents:', {
      projectId,
      model,
      query,
    });

    const response = await api.post(`/api/${model}/${projectId}/query`, {
      prompt: query,
      chat_history: [["Human", "Assistant"]]
    });

    console.log('📥 Query response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
}

export async function getTaskStatus(taskId: string) {
  try {
    console.log('📤 Checking task status:', taskId);

    const response = await api.get(`/api/tasks/${taskId}`);

    console.log('📥 Task status:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Task status error:', error);
    throw error;
  }
} 