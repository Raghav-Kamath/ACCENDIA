import { useState } from 'react';
import { uploadFile, queryDocuments, getTaskStatus, TaskStatus } from '@/lib/api';

interface UseDocumentQueryProps {
  projectId: string;
  model: string;
}

export const useDocumentQuery = ({ projectId, model }: UseDocumentQueryProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([]);

  const uploadFiles = async (files: File[]) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await uploadFile(files, model, projectId);
      
      // Poll for task statuses
      const statusPromises = response.tasks.map(async (taskId) => {
        let status: TaskStatus;
        do {
          status = await getTaskStatus(taskId);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Poll every second
        } while (status.state === 'PENDING');
        return status;
      });

      const statuses = await Promise.all(statusPromises);
      setTaskStatuses(statuses);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const query = async (prompt: string, chatHistory: any[] = []) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await queryDocuments(projectId, model, prompt, chatHistory);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadFiles,
    query,
    isLoading,
    error,
    taskStatuses,
  };
}; 