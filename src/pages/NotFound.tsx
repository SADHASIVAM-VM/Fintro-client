import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants';
import { Helmet } from 'react-helmet-async';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center text-foreground bg-background">
      <Helmet>
        <title>Page Not Found (404) | Antigravity Core</title>
      </Helmet>
      
      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-muted text-muted-foreground mb-6">
        <FileQuestion className="h-10 w-10 animate-bounce" />
      </div>
      
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold mb-4 font-sans text-muted-foreground">Page Not Found</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-8 font-sans leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <div className="flex gap-4">
        <Button onClick={() => navigate(ROUTES.DASHBOARD)} variant="primary" className="font-sans">
          Go to Dashboard
        </Button>
        <Button onClick={() => navigate(-1)} variant="outline" className="font-sans">
          Go Back
        </Button>
      </div>
    </div>
  );
};
export default NotFound;
