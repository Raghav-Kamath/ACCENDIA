import { useState, useEffect } from 'react';
import { useDocumentQuery } from '@/hooks/useDocumentQuery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface DocumentQueryProps {
  projectId: string;
  model: string;
}

export const DocumentQuery = ({ projectId, model }: DocumentQueryProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [response, setResponse] = useState<string>('');
  const [uploadTasks, setUploadTasks] = useState<string[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { uploadFiles, query, isLoading, taskStatuses } = useDocumentQuery({
    projectId,
    model,
  });

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (uploadTasks.length > 0 && !isPolling) {
      console.log('🔄 Starting task polling for tasks:', uploadTasks);
      setIsPolling(true);
      pollInterval = setInterval(async () => {
        const allCompleted = taskStatuses.every(
          status => status.state !== 'PENDING' && status.state !== 'STARTED'
        );
        
        if (allCompleted) {
          console.log('✅ All tasks completed:', taskStatuses);
          setIsPolling(false);
          setUploadTasks([]);
        }
      }, 2000);
    }

    return () => {
      if (pollInterval) {
        console.log('🛑 Stopping task polling');
        clearInterval(pollInterval);
      }
    };
  }, [uploadTasks, taskStatuses, isPolling]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      console.log('📁 Files selected:', selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
      setFiles(selectedFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select a file to upload');
      return;
    }

    try {
      console.log('📤 Starting file upload...');
      setError(null);
      
      // Log the file details before upload
      files.forEach(file => {
        console.log('File details:', {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified
        });
      });

      const result = await uploadFiles(files);
      console.log('📥 Upload result:', result);
      
      if (result.tasks && result.tasks.length > 0) {
        setUploadTasks(result.tasks);
        setFiles([]);
      } else {
        setError('No tasks returned from upload');
      }
    } catch (err) {
      console.error('❌ Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleQuery = async () => {
    if (!prompt.trim()) {
      setError('Please enter a query');
      return;
    }

    try {
      console.log('🔍 Starting query...');
      setError(null);
      const result = await query(prompt, chatHistory);
      console.log('📥 Query result:', result);
      setResponse(JSON.stringify(result.payload, null, 2));
      setChatHistory([...chatHistory, { role: 'user', content: prompt }]);
      setPrompt('');
    } catch (err) {
      console.error('❌ Query failed:', err);
      setError(err instanceof Error ? err.message : 'Query failed');
    }
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="space-y-4 p-4">
      {renderError()}

      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Upload Documents</h2>
        <div className="space-y-4">
          <Input
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".pdf"
            className="w-full"
          />
          <div className="text-sm text-muted-foreground">
            {files.length > 0 && (
              <div>
                Selected files:
                {files.map((file, index) => (
                  <div key={index} className="mt-1">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Query Documents</h2>
        <div className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your query..."
            className="w-full"
          />
          <Button
            onClick={handleQuery}
            disabled={!prompt || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Querying...
              </>
            ) : (
              'Query'
            )}
          </Button>
        </div>
      </Card>

      {response && (
        <Card className="p-4">
          <h2 className="text-xl font-bold mb-4">Response</h2>
          <pre className="whitespace-pre-wrap">{response}</pre>
        </Card>
      )}

      {taskStatuses.length > 0 && (
        <Card className="p-4">
          <h2 className="text-xl font-bold mb-4">Processing Status</h2>
          <div className="space-y-2">
            {taskStatuses.map((status, index) => (
              <div key={index} className="text-sm">
                <div className="flex items-center gap-2">
                  {status.state === 'PENDING' || status.state === 'STARTED' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  <span>Task {index + 1}: {status.state}</span>
                </div>
                {status.result && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {JSON.stringify(status.result)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}; 