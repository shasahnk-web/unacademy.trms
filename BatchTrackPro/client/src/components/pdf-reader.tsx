import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Maximize,
  Minimize,
  RotateCw,
  Search
} from 'lucide-react';

interface PDFReaderProps {
  src: string;
  title?: string;
}

export default function PDFReader({ src, title }: PDFReaderProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // For demo purposes, we'll use an iframe approach
  // In production, you'd want to use PDF.js or similar library for better control
  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Unable to load PDF. Please check the PDF URL or try again later.');
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPage = (page: number) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
  };

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = title || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = async () => {
    const container = document.querySelector('.pdf-container');
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  if (error) {
    return (
      <Card className="w-full h-96 flex items-center justify-center bg-muted">
        <div className="text-center p-6">
          <div className="text-muted-foreground mb-2">PDF Error</div>
          <div className="text-sm text-muted-foreground">{error}</div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={downloadPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="pdf-container w-full bg-background border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center space-x-2">
          {/* Page navigation */}
          <Button
            size="sm"
            variant="outline"
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-2 text-sm">
            <Input
              type="number"
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
              className="w-16 h-8 text-center"
              min={1}
              max={totalPages}
            />
            <span>of {totalPages}</span>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 w-32"
            />
          </div>

          {/* Zoom controls */}
          <Button size="sm" variant="outline" onClick={zoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <span className="text-sm min-w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <Button size="sm" variant="outline" onClick={zoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>

          {/* Rotate */}
          <Button size="sm" variant="outline" onClick={rotate}>
            <RotateCw className="w-4 h-4" />
          </Button>

          {/* Download */}
          <Button size="sm" variant="outline" onClick={downloadPDF}>
            <Download className="w-4 h-4" />
          </Button>

          {/* Fullscreen */}
          <Button size="sm" variant="outline" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="relative bg-gray-100 dark:bg-gray-900">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Loading PDF...</span>
            </div>
          </div>
        )}

        <div 
          className="flex justify-center p-4 min-h-96"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center',
            transition: 'transform 0.2s ease-in-out'
          }}
        >
          <iframe
            src={`${src}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full max-w-4xl h-96 border-0 bg-white shadow-lg"
            onLoad={handleLoad}
            onError={handleError}
            title={title || 'PDF Document'}
          />
        </div>
      </div>

      {/* Footer with title */}
      {title && (
        <div className="p-3 border-t bg-muted/30">
          <h3 className="font-medium text-sm truncate">{title}</h3>
        </div>
      )}
    </div>
  );
}