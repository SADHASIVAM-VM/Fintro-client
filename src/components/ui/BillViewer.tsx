import React, { useState, useEffect } from 'react';
import { Dialog } from './Dialog';
import { ZoomIn, ZoomOut, RotateCw, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from './Button';

export interface BillViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | undefined;
  title?: string;
}

export const BillViewer: React.FC<BillViewerProps> = ({
  isOpen,
  onClose,
  fileUrl,
  title = "View Document",
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Reset zoom and rotation when modal opens or fileUrl changes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
    }
  }, [isOpen, fileUrl]);

  const hasFile = fileUrl && fileUrl !== 'null' && fileUrl !== '';
  // Detect file type
  const cleanUrl = hasFile ? fileUrl.toLowerCase().split('?')[0] : '';
  const isPdf = cleanUrl.endsWith('.pdf');

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between w-full pr-8">
          <span className="font-sans font-semibold text-foreground text-base">{title}</span>
          {hasFile && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-normal font-sans ml-4"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open in New Tab
            </a>
          )}
        </div>
      }
      className="max-w-4xl w-full"
    >
      <div className="flex flex-col gap-4">
        {!hasFile ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] p-6 text-center border-2 border-dashed rounded-xl bg-muted/5 font-sans">
            <span className="text-sm font-medium text-muted-foreground">Receipt not available.</span>
          </div>
        ) : isPdf ? (
          /* PDF Viewer */
          <div className="w-full h-[65vh] rounded-lg border overflow-hidden bg-muted/5">
            <iframe
              src={fileUrl}
              className="w-full h-full border-none"
              title="Bill PDF Viewer"
            />
          </div>
        ) : (
          /* Image Viewer */
          <div className="flex flex-col gap-3">
            {/* Control Bar */}
            <div className="flex items-center justify-center gap-2 p-2 border rounded-lg bg-muted/20">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                title="Zoom Out"
                className="h-8 w-8"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs font-mono min-w-[45px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={scale >= 4}
                title="Zoom In"
                className="h-8 w-8"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <div className="w-px h-4 bg-muted-foreground/30 mx-1" />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRotate}
                title="Rotate Clockwise"
                className="h-8 w-8"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                title="Reset View"
                className="h-8 w-8"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Image Canvas Container */}
            <div className="overflow-auto border rounded-xl bg-slate-900/5 dark:bg-slate-950/20 flex items-center justify-center min-h-[50vh] max-h-[60vh] p-6 relative">
              <div
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-out',
                }}
                className="flex items-center justify-center"
              >
                <img
                  src={fileUrl}
                  alt="Receipt Document"
                  className="max-w-full max-h-[50vh] object-contain shadow-lg rounded-md pointer-events-none select-none bg-white"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60';
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
