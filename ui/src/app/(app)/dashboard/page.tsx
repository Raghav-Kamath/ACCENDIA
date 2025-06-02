"use client";

import { FileUploadCard } from "@/components/features/file-upload/file-upload-card";
import { QAPanel } from "@/components/features/qa/qa-panel";
import { DocumentExplorer } from "@/components/features/documents/document-explorer";
import { ProjectSelector } from "@/components/features/project/project-selector";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getTaskStatus } from "@/lib/api";

interface Task {
  id: string;
  name: string;
  status: string;
  uploadedAt: Date;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();

  const handleFileUploadSuccess = async (taskId: string) => {
    try {
      // Get initial task status
      const taskStatus = await getTaskStatus(taskId);
      
      // Add task to list
      const newTask: Task = {
        id: taskId,
        name: `Task ${taskId.slice(0, 8)}...`,
        status: taskStatus.state,
        uploadedAt: new Date(),
      };
      
      setTasks(prevTasks => [...prevTasks, newTask]);
      
      // Start polling for task status updates
      const pollInterval = setInterval(async () => {
        const updatedStatus = await getTaskStatus(taskId);
        
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, status: updatedStatus.state }
              : task
          )
        );
        
        if (updatedStatus.state !== 'PENDING' && updatedStatus.state !== 'STARTED') {
          clearInterval(pollInterval);
          
          if (updatedStatus.state === 'SUCCESS') {
            toast({
              title: 'Processing Complete',
              description: 'The document has been successfully processed.',
              variant: 'default',
              className: 'bg-green-500 text-white'
            });
          } else if (updatedStatus.state === 'FAILURE') {
            toast({
              title: 'Processing Failed',
              description: updatedStatus.status || 'An error occurred during processing.',
              variant: 'destructive'
            });
          }
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error handling task:', error);
      toast({
        title: 'Error',
        description: 'Failed to track task status.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1 space-y-6 lg:space-y-8">
          <ProjectSelector />
          <FileUploadCard onUploadSuccess={handleFileUploadSuccess} />
          <DocumentExplorer tasks={tasks} setTasks={setTasks} />
        </div>
        <div className="lg:col-span-2">
          <QAPanel tasks={tasks} />
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="mt-4 space-y-4">
          <Separator />
          <h2 className="text-xl font-headline text-foreground">Recent Tasks</h2>
          <div className="grid gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold mb-2 font-headline text-primary">
                  {task.name}
                </h3>
                <p><strong>Status:</strong> {task.status}</p>
                <p><strong>Uploaded:</strong> {task.uploadedAt.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
