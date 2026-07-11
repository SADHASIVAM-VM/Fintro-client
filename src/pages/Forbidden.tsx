import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants';
import { Helmet } from 'react-helmet-async';

export const Forbidden: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center text-foreground bg-background">
      <Helmet>
        <title>Access Forbidden (403) | Antigravity Core</title>
      </Helmet>
      
      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-destructive/10 text-destructive mb-6">
        <ShieldAlert className="h-10 w-10" />
      </div>
      
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">403</h1>
      <h2 className="text-xl font-bold mb-4 font-sans text-muted-foreground">Access Forbidden</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-8 font-sans leading-relaxed">
        You do not have permission to view this resource. Check your credentials or contact system administrators.
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
export default Forbidden;
