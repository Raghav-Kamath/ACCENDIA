"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ProjectContextType {
  projectId: string;
  setProjectId: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectId, setProjectId] = useState<string>('project1'); // Default project ID

  // Load project ID from localStorage on mount
  useEffect(() => {
    const savedProjectId = localStorage.getItem('projectId');
    if (savedProjectId) {
      setProjectId(savedProjectId);
    }
  }, []);

  // Save project ID to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('projectId', projectId);
  }, [projectId]);

  return (
    <ProjectContext.Provider value={{ projectId, setProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
} 