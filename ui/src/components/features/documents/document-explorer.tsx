"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Trash2, Loader2, AlertCircle, CheckCircle2, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Task {
  id: string;
  name: string;
  status: string;
  uploadedAt: Date;
}

interface DocumentExplorerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export function DocumentExplorer({ tasks, setTasks }: DocumentExplorerProps) {
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'STARTED':
        return <Badge variant="outline"><Loader2 className="mr-1 h-3 w-3 animate-spin" />Processing</Badge>;
      case 'SUCCESS':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
          <CheckCircle2 className="mr-1 h-3 w-3" />Complete
        </Badge>;
      case 'FAILURE':
        return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    toast({
      title: "Task Removed",
      description: "The task has been removed from the list.",
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <FileText className="mr-2 h-6 w-6 text-primary" />
          Processing Tasks
        </CardTitle>
        <CardDescription>View and manage your document processing tasks.</CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="mx-auto h-12 w-12 mb-2" />
            <p>No tasks in progress.</p>
            <p className="text-sm">Upload a document to start processing.</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] lg:h-[calc(100vh-450px)] pr-3 -mr-3">
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between p-3 rounded-md border hover:shadow-md transition-shadow bg-card hover:bg-accent/10">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-grow overflow-hidden">
                      <p className="text-sm font-medium truncate text-foreground" title={task.name}>
                        {task.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Started {formatDistanceToNow(task.uploadedAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {getStatusBadge(task.status)}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Remove Task">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Task</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this task from the list? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
