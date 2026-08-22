import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Play } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MediaCarouselProps {
  urls: string[];
  altPrefix: string;
}

export function MediaCarousel({ urls, altPrefix }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Reset when urls change
  useEffect(() => {
    setCurrentIndex(0);
    setIsLightboxOpen(false);
  }, [urls]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % urls.length);
  }, [urls.length]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? urls.length - 1 : prev - 1));
  }, [urls.length]);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, closeLightbox, handleNext, handlePrev]);

  if (!urls || urls.length === 0) return null;

  const showControls = urls.length > 1;
  const currentUrl = urls[currentIndex];
  
  // Basic check for video extension
  const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

  const renderMedia = (url: string, inLightbox: boolean) => {
    if (isVideo(url)) {
      return (
        <video 
          key={url}
          src={url}
          controls={inLightbox} // Only native controls if in lightbox or user prefers
          autoPlay={inLightbox}
          muted={!inLightbox}
          loop={!inLightbox}
          playsInline
          className={cn("w-full h-full object-contain", !inLightbox && "object-cover")}
        />
      );
    }
    return (
      <img 
        key={url}
        src={url} 
        alt={`${altPrefix} - Vista ${currentIndex + 1}`} 
        className={cn("w-full h-full object-contain", !inLightbox && "object-cover")}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  };

  return (
    <>
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-6 border border-gray-100 bg-gray-50 shrink-0 shadow-sm group">
        
        {/* Media Container (Click to expand) */}
        <div 
          className="w-full h-full cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Ampliar imagen"
        >
          {renderMedia(currentUrl, false)}
          
          {/* Video Play Icon Indicator for Preview */}
          {isVideo(currentUrl) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
                <Play className="w-6 h-6 ml-1" />
              </div>
            </div>
          )}
        </div>
        
        {/* Expand Button (Top Right) */}
        <button 
          onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/75 z-10"
          aria-label="Abrir vista ampliada"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Counter Badge (Top Left) */}
        {showControls && (
          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/50 text-white text-xs font-semibold backdrop-blur-sm z-10">
            {currentIndex + 1} / {urls.length}
          </div>
        )}
        
        {showControls && (
          <>
            {/* Overlay Gradient for better control visibility */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            {/* Navigation Controls */}
            <button 
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-md text-gray-800 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105 active:scale-95 z-10"
              aria-label="Vista anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button 
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-md text-gray-800 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105 active:scale-95 z-10"
              aria-label="Siguiente vista"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* Dots Indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {urls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    idx === currentIndex 
                      ? "bg-white scale-110 shadow-[0_0_2px_rgba(0,0,0,0.5)]" 
                      : "bg-white/50 hover:bg-white/75"
                  )}
                  aria-label={`Ir a la vista ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center backdrop-blur-sm"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          {/* Close Button */}
          <button 
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors z-50"
            aria-label="Cerrar vista ampliada"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter Badge */}
          {showControls && (
            <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-semibold z-50">
              {currentIndex + 1} / {urls.length}
            </div>
          )}

          {/* Media Content */}
          <div 
            className="relative w-full max-w-6xl h-full max-h-screen p-4 md:p-12 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking media
          >
            {renderMedia(currentUrl, true)}
          </div>

          {/* Lightbox Navigation */}
          {showControls && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors z-50"
                aria-label="Vista anterior"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors z-50"
                aria-label="Siguiente vista"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
