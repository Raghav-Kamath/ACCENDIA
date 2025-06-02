"use client";

import { useProject } from "@/contexts/project-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderGit2 } from "lucide-react";

export function ProjectSelector() {
  const { projectId, setProjectId } = useProject();

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <FolderGit2 className="mr-2 h-6 w-6 text-primary" />
          Project Settings
        </CardTitle>
        <CardDescription>
          Configure your project settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectId">Project ID</Label>
            <Input
              id="projectId"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Enter project ID"
              className="font-mono"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 