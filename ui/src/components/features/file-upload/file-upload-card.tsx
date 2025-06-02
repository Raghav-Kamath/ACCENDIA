"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileUp, Loader2, Upload } from 'lucide-react';
import { uploadFile } from '@/lib/api';
import { useProject } from '@/contexts/project-context';

interface FileUploadCardProps {
  onUploadSuccess: (taskId: string) => void;
}

export function FileUploadCard({ onUploadSuccess }: FileUploadCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { projectId } = useProject();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a PDF file.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadFile(file, projectId);
      if (result.tasks && result.tasks.length > 0) {
        onUploadSuccess(result.tasks[0]);
        toast({
          title: 'Upload Successful',
          description: 'Your file is being processed.',
        });
      } else {
        throw new Error('No task ID received');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload file.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <FileUp className="mr-2 h-6 w-6 text-primary" />
          Upload Document
        </CardTitle>
        <CardDescription>
          Upload a PDF document to analyze its content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent/10 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 mb-2 text-primary animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 mb-2 text-primary" />
                )}
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PDF files only</p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>
          {isUploading && (
            <div className="text-center text-sm text-muted-foreground">
              Uploading and processing your document...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

