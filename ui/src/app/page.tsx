// This page will be effectively handled by the middleware.
// If authenticated, middleware redirects to /dashboard.
// If not authenticated, middleware redirects to /login.
// We can add a loading state here or a simple message if needed,
// but typically users won't see this page for long.

'use client';

import { DocumentQuery } from '@/components/DocumentQuery';

export default function Home() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Document Query System</h1>
      <DocumentQuery projectId="default" model="gemini" />
    </main>
  );
}
