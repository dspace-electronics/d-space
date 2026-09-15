'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, Maximize2, X, FileText } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  title: string;
  pinoutUrl?: string;
  datasheetUrl?: string;
}

export function ProductGallery({ images, title, pinoutUrl, datasheetUrl }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | 'pinout'>('photos');

  const currentImage = images[activeIndex] || images[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="space-y-4">
      {/* Tab Selector (Photos vs Pinout Diagram) */}
      {pinoutUrl && (
        <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-xl max-w-fit">
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'photos'
                ? 'bg-white text-black shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Hardware Photography
          </button>
          <button
            onClick={() => setActiveTab('pinout')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'pinout'
                ? 'bg-white text-[#e51e2b] shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            GPIO Pinout Map
          </button>
        </div>
      )}

      {/* Main Image Display */}
      {activeTab === 'photos' ? (
        <div
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setShowFullscreen(true)}
          className="relative aspect-4/3 w-full bg-[#0e1117] border border-white/10 rounded-2xl overflow-hidden cursor-crosshair shadow-sm group"
        >
          {/* Base Image */}
          <img
            src={currentImage}
            alt={title}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=85';
            }}
            className="w-full h-full object-cover select-none"
          />

          {/* Optical Zoom Pan Layer */}
          {isZoomed && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-150"
              style={{
                backgroundImage: `url(${currentImage})`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundSize: '220%',
                backgroundRepeat: 'no-repeat',
              }}
            />
          )}

          {/* Controls Badge */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-[11px] font-medium text-neutral-300 shadow-xs pointer-events-none">
            <ZoomIn className="w-3.5 h-3.5 text-neutral-400" />
            <span>Hover to zoom · Click to enlarge</span>
          </div>
        </div>
      ) : (
        /* Pinout Diagram View */
        <div className="relative aspect-4/3 w-full bg-[#0a0c10] rounded-2xl overflow-hidden flex items-center justify-center p-4 border border-white/10">
          {pinoutUrl ? (
            <img
              src={pinoutUrl}
              alt={`${title} Pinout Diagram`}
              className="max-h-full max-w-full object-contain filter invert-[0.05]"
            />
          ) : (
            <p className="text-xs text-neutral-400">Pinout diagram unavailable</p>
          )}
        </div>
      )}

      {/* Thumbnails Row */}
      {activeTab === 'photos' && images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 bg-[#0e1117] transition-all cursor-pointer ${
                activeIndex === idx
                  ? 'border-[#e51e2b] shadow-xs'
                  : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${title} preview ${idx + 1}`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80';
                }}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {showFullscreen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center"
            >
              <button
                onClick={() => setShowFullscreen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={currentImage}
                alt={title}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=90';
                }}
                className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
