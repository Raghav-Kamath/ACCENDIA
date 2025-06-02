"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, HelpCircle } from 'lucide-react';
import { queryDocuments } from '@/lib/api';
import { useProject } from '@/contexts/project-context';

interface Task {
  id: string;
  name: string;
  status: string;
  uploadedAt: Date;
}

interface QAPanelProps {
  tasks: Task[];
}

export function QAPanel({ tasks }: QAPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const { toast } = useToast();
  const { projectId } = useProject();

  const handleQuery = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Empty Query',
        description: 'Please enter a question to ask.',
        variant: 'destructive',
      });
      return;
    }

    // Check if there are any successfully processed documents
    const processedTasks = tasks.filter(task => task.status === 'SUCCESS');
    if (processedTasks.length === 0) {
      toast({
        title: 'No Processed Documents',
        description: 'Please wait for at least one document to finish processing.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResponse('');

    try {
      const result = await queryDocuments(projectId, 'gpt', prompt);
      console.log('Query result:', result);
      
      // Format the response to separate answer and sources
      const formattedResponse = formatResponse(result.payload);
      console.log('Formatted response:', formattedResponse);
      setResponse(formattedResponse);
    } catch (error) {
      console.error('Error querying documents:', error);
      toast({
        title: 'Query Failed',
        description: error instanceof Error ? error.message : 'Failed to process your query.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatResponse = (payload: any): string => {
    if (!payload) return '';
    
    // Handle array of responses
    if (Array.isArray(payload)) {
      return payload.map((item, index) => {
        if (typeof item === 'string') {
          return `Document ${index + 1}:\n${item}`;
        }
        return `Document ${index + 1}:\n${formatResponse(item)}`;
      }).join('\n\n');
    }

    // If the response is already in the correct format, return it
    if (typeof payload === 'string' && payload.includes('\nSOURCES:')) {
      return payload;
    }

    // If the response is an object with answer and sources
    if (typeof payload === 'object') {
      const answer = payload.answer || payload.response || '';
      const sources = payload.sources || [];
      
      if (sources.length > 0) {
        return `${answer}\n\nSOURCES:\n${sources.map((source: string) => `- ${source}`).join('\n')}`;
      }
      
      return answer;
    }

    // If the response is a simple string
    return payload.toString();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <HelpCircle className="mr-2 h-6 w-6 text-primary" />
          Ask Questions
        </CardTitle>
        <CardDescription>
          Query your processed documents using natural language.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="min-h-[100px]"
            disabled={isLoading}
          />
          <Button
            onClick={handleQuery}
            disabled={isLoading || !prompt.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Ask Question
              </>
            )}
          </Button>
        </div>

        {response && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Response</h3>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="whitespace-pre-wrap text-sm">
                {response.split('\n\n').map((section, sectionIndex) => {
                  const [content, sources] = section.split('\nSOURCES:');
                  return (
                    <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-6 pt-6 border-t' : ''}>
                      <p className="mb-4">{content}</p>
                      {sources && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="font-semibold mb-2">SOURCES:</p>
                          {sources.split('\n').map((source, i) => (
                            <p key={i} className="text-muted-foreground">{source}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {tasks.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Available documents: {tasks.filter(t => t.status === 'SUCCESS').length}</p>
            <p>Processing: {tasks.filter(t => t.status === 'PENDING' || t.status === 'STARTED').length}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
