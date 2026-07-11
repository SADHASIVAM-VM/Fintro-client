import React from 'react';
import { ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Helmet } from 'react-helmet-async';

export const ServerError: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center text-foreground bg-background">
      <Helmet>
        <title>Server Error (500) | Antigravity Core</title>
      </Helmet>
      
      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-muted text-muted-foreground mb-6">
        <ServerCrash className="h-10 w-10 text-destructive animate-pulse" />
      </div>
      
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">500</h1>
      <h2 className="text-xl font-bold mb-4 font-sans text-muted-foreground">Server Error</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-8 font-sans leading-relaxed">
        The server encountered an internal error or misconfiguration and was unable to complete your request.
      </p>
      
      <div className="flex gap-4">
        <Button onClick={() => window.location.replace('/')} variant="primary" className="font-sans">
          Reload App
        </Button>
      </div>
    </div>
  );
};
export default ServerError;
