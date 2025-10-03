import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Volume2, VolumeX, Info, Navigation, Menu } from 'lucide-react';
import { toast } from 'sonner';
import MuseumInfoSidebar from '@/components/MuseumInfoSidebar';
import '../../../css/photo-sphere-viewer.css';

// Add marker styles
const markerStyles = `
  .info-image-marker {
    border: 3px solid #3b82f6 !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
    transition: transform 0.3s ease !important;
  }
  
  .nav-image-marker {
    border: 3px solid #10b981 !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4) !important;
    transition: transform 0.3s ease !important;
  }
  
  .info-image-marker:hover,
  .nav-image-marker:hover {
    transform: scale(1.1) !important;
  }
`;

export default function PanoramaViewer() {
  const { museum, allRuangan } = usePage().props as any;
  
  // Find main room from all rooms
  const mainRuangan = allRuangan?.find((r: any) => r.is_main) || allRuangan?.[0];
  
  // State for current active ruangan
  const [activeRuangan, setActiveRuangan] = useState(mainRuangan);
  const [activeMarkers, setActiveMarkers] = useState(mainRuangan?.markers || []);
  
  // Debug props
  console.log('=== PANORAMA VIEWER PROPS ===');
  console.log('Museum:', museum);
  console.log('All ruangan:', allRuangan);
  console.log('Main ruangan:', mainRuangan);
  console.log('Active ruangan:', activeRuangan);
  
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<any>(null);
  const [panoramaLoaded, setPanoramaLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showVisitorGuide, setShowVisitorGuide] = useState(true); // Show guide on first load
  const [showSidebar, setShowSidebar] = useState(false); // Sidebar state
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check localStorage for visitor guide preference
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('museum-visitor-guide-seen');
    if (hasSeenGuide === 'true') {
      setShowVisitorGuide(false);
    }
  }, []);

  // Handle visitor guide close
  const handleCloseVisitorGuide = () => {
    localStorage.setItem('museum-visitor-guide-seen', 'true');
    setShowVisitorGuide(false);
  };

  // Advanced greenscreen removal using Canvas API
  const createGreenscreenCanvas = (videoElement: HTMLVideoElement, width: number = 60, height: number = 60) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = height;
    canvas.style.cssText = `
      width: ${width}px;
      height: ${height}px;
      cursor: pointer;
      background: transparent;
    `;
    
    const processFrame = () => {
      if (videoElement.readyState >= 2) {
        ctx!.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Chroma key greenscreen removal
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Check if pixel is green (chroma key)
          const isGreen = g > 100 && g > r * 1.4 && g > b * 1.4;
          
          if (isGreen) {
            // Make pixel transparent
            data[i + 3] = 0;
          }
        }
        
        ctx!.putImageData(imageData, 0, 0);
      }
      
      requestAnimationFrame(processFrame);
    };
    
    videoElement.addEventListener('loadeddata', () => {
      processFrame();
    });
    
    return canvas;
  };

  // Room switching function
  const switchToRoom = useCallback((targetRuanganId: number) => {
    console.log('=== SWITCHING TO ROOM ===', targetRuanganId);
    
    const targetRuangan = allRuangan.find((r: any) => r.id === targetRuanganId);
    
    if (!targetRuangan) {
      console.error('Target ruangan not found:', targetRuanganId);
      toast.error('Ruangan tidak ditemukan');
      return;
    }
    
    if (targetRuangan.id === activeRuangan?.id) {
      console.log('Already in target room, skipping');
      return;
    }
    
    console.log('Switching from:', activeRuangan?.nama_ruangan, 'to:', targetRuangan.nama_ruangan);
    
    // Set transitioning state to prevent multiple rapid switches
    setIsTransitioning(true);
    setPanoramaLoaded(false);
    
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      // Update state
      setActiveRuangan(targetRuangan);
      setActiveMarkers(targetRuangan.markers || []);
      
      // Update URL
      const newUrl = `/museum/${museum.id}#ruangan-${targetRuangan.id}`;
      window.history.pushState({ ruanganId: targetRuangan.id }, '', newUrl);
      
      // Close dialogs
      setShowInfoDialog(false);
      setSelectedMarker(null);
      
      toast.success(`Berpindah ke ${targetRuangan.nama_ruangan}`);
    }, 100);
  }, [allRuangan, museum.id, activeRuangan]);

  // Create video marker element with greenscreen removal
  const createVideoMarkerElement = useCallback((marker: any, type: 'info' | 'navigation') => {
    console.log('Creating video marker element for:', marker.judul, 'Type:', type);
    console.log('Video URL:', marker.media_url);
    console.log('Video dimensions:', marker.media_width, 'x', marker.media_height);
    
    const width = marker.media_width || 60;
    const height = marker.media_height || 60;
    const borderColor = type === 'info' ? '#3b82f6' : '#10b981';
    
    const container = document.createElement('div');
    container.className = `${type}-video-marker`;
    container.style.cssText = `
      width: ${width}px;
      height: ${height}px;
      position: relative;
      cursor: pointer;
      transition: transform 0.3s ease;
      overflow: hidden;
    `;
    
    // Ensure video URL is valid
    if (!marker.media_url) {
      console.error('No video URL for marker:', marker.judul);
      // Return fallback HTML marker
      container.innerHTML = `
        <div style="
          width: 100%; 
          height: 100%; 
          background: ${borderColor};
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <circle cx="12" cy="12" r="2"/>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
          </svg>
        </div>
      `;
      return container;
    }
    
    const video = document.createElement('video');
    video.src = marker.media_url;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.style.display = 'none'; // Hide original video
    
    console.log('Video element created:', video);
    
    // Ensure video plays
    video.addEventListener('canplay', () => {
      console.log('Video can play, starting playback');
      video.play().catch(e => {
        console.error('Error playing video:', e);
      });
    });
    
    video.addEventListener('error', (e) => {
      console.error('Video error:', e);
    });
    
    // Create canvas with greenscreen removal and custom size
    const canvas = createGreenscreenCanvas(video, width, height);
    console.log('Canvas created:', canvas);
    
    // Add direct click handler as fallback
    container.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('Direct container click for marker:', marker);
      
      if (type === 'info') {
        console.log('Direct info click');
        // Will be handled by Photo Sphere Viewer event
      } else if (type === 'navigation') {
        console.log('Direct navigation click, target:', marker.navigation_target);
        // Fallback direct navigation
        const targetRuangan = allRuangan.find((r: any) => r.id == marker.navigation_target);
        if (targetRuangan) {
          const targetUrl = `/museum/${museum.id}#ruangan-${targetRuangan.id}`;
          console.log('Direct navigation to:', targetUrl);
          toast.success(`Berpindah ke ${targetRuangan.nama_ruangan}`);
          // Use state switching instead of router.visit
          switchToRoom(targetRuangan.id);
        }
      }
    });

    container.appendChild(canvas);
    container.appendChild(video); // Keep video in DOM for processing
    
    return container;
  }, [allRuangan, museum.id, switchToRoom]);

  // Inject marker styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = markerStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  // Generate markers for Photo Sphere Viewer
  const generateMarkers = useCallback(() => {
    if (!activeMarkers || activeMarkers.length === 0) return [];

    console.log('Generating markers:', activeMarkers);
    console.log('Markers with video:', activeMarkers.filter((m: any) => m.media_type === 'video'));

    return activeMarkers.map((marker: any) => {
      console.log('Processing marker:', marker.judul, 'Type:', marker.type, 'Media:', marker.media_type);
      
      const baseConfig = {
        id: marker.id.toString(),
        position: { 
          yaw: parseFloat(marker.position_yaw || '0'), 
          pitch: parseFloat(marker.position_pitch || '0') 
        },
        tooltip: {
          content: marker.judul,
          position: 'top center'
        },
        data: {
          ...marker,
          clickAction: marker.type === 'info' ? 'showInfo' : 'navigate'
        }
      };

      console.log('Base config for marker:', baseConfig);

      // Simplified marker creation - just use HTML for now to test clicks
      if (marker.type === 'navigation') {
        console.log('Creating navigation marker for:', marker.judul, 'Target:', marker.navigation_target);
        
        // Create navigation marker element
        const navElement = document.createElement('div');
        navElement.className = 'w-12 h-12 mx-auto relative';
        navElement.style.cssText = `
          cursor: pointer;
        `;
        
        navElement.innerHTML = `
          <div style="width: 100%; height: 100%; background: #10b981; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: center;">
            <svg style="width: 16px; height: 16px; pointer-events: none;" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M9 6l6 6-6 6"/>
            </svg>
          </div>
        `;
        
        // Add click event directly to element
        navElement.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Navigation marker clicked directly!', marker.navigation_target);
          const targetId = parseInt(marker.navigation_target);
          if (targetId) {
            switchToRoom(targetId);
          }
        });
        
        return {
          ...baseConfig,
          element: navElement
        };
      } else {
        // For info markers with media
        if (marker.media_type === 'video' && marker.media_url) {
          console.log('Processing video marker:', marker.judul, 'URL:', marker.media_url);
          // Create video marker element
          const videoElement = createVideoMarkerElement(marker, 'info');
          console.log('Video element created for Photo Sphere:', videoElement);
          return {
            ...baseConfig,
            element: videoElement
          };
        } else {
          console.log('Processing regular info marker:', marker.judul);
          
          // Create info marker element
          const infoElement = document.createElement('div');
          infoElement.className = 'w-12 h-12 mx-auto relative';
          infoElement.style.cssText = `
            cursor: pointer;
          `;
          
          infoElement.innerHTML = `
            <div style="width: 100%; height: 100%; background: #3b82f6; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); display: flex; align-items: center; justify-content: center;">
              <svg style="width: 16px; height: 16px; pointer-events: none;" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4m0-4h.01"/>
              </svg>
            </div>
          `;
          
          // Add click event directly to element
          infoElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Info marker clicked directly!', marker.judul);
            setSelectedMarker(marker);
            setShowInfoDialog(true);
          });
          
          // Regular info marker
          return {
            ...baseConfig,
            element: infoElement
          };
        }
      }
    }).filter((marker: any) => marker !== null);
  }, [activeMarkers, createVideoMarkerElement, switchToRoom]);

  // Handle browser back/forward navigation and initial hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/#ruangan-(\d+)/);
      
      if (match) {
        const ruanganIdFromHash = parseInt(match[1]);
        if (ruanganIdFromHash && ruanganIdFromHash !== activeRuangan?.id) {
          const targetRuangan = allRuangan.find((r: any) => r.id === ruanganIdFromHash);
          if (targetRuangan) {
            setActiveRuangan(targetRuangan);
            setActiveMarkers(targetRuangan.markers || []);
            console.log('Navigation via hash change to:', targetRuangan.nama_ruangan);
          }
        }
      }
    };
    
    // Handle initial hash on page load
    handleHashChange();
    
    // Handle popstate (back/forward buttons)
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.ruanganId) {
        const targetRuangan = allRuangan.find((r: any) => r.id === event.state.ruanganId);
        if (targetRuangan) {
          setActiveRuangan(targetRuangan);
          setActiveMarkers(targetRuangan.markers || []);
          console.log('Navigation via browser back/forward to:', targetRuangan.nama_ruangan);
        }
      } else {
        // If no state, go back to main room
        const mainRuangan = allRuangan?.find((r: any) => r.is_main) || allRuangan?.[0];
        if (mainRuangan) {
          setActiveRuangan(mainRuangan);
          setActiveMarkers(mainRuangan.markers || []);
        }
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [allRuangan, activeRuangan]);

  // Prevent horizontal overflow on mount
  useEffect(() => {
    // Set overflow hidden on body and html
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.maxWidth = '100vw';
    document.documentElement.style.maxWidth = '100vw';
    
    return () => {
      // Restore original styles on unmount
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.maxWidth = '';
      document.documentElement.style.maxWidth = '';
    };
  }, []);

  // Setup global marker click handler as fallback
  useEffect(() => {
    (window as any).handleMarkerClick = (targetId: number) => {
      console.log('Global marker click handler called with:', targetId);
      switchToRoom(targetId);
    };
    
    return () => {
      delete (window as any).handleMarkerClick;
    };
  }, [switchToRoom]);

  // Initialize Photo Sphere Viewer
  useEffect(() => {
    if (!activeRuangan?.panorama_url) {
      console.log('No panorama URL for:', activeRuangan?.nama_ruangan);
      return;
    }

    console.log('Viewer effect triggered for:', activeRuangan.nama_ruangan);
    
    // Reset loading state
    setPanoramaLoaded(false);
    setIsTransitioning(false);

    const initViewer = async () => {
      try {
        // Wait for container to be available
        let attempts = 0;
        while (!viewerRef.current && attempts < 10) {
          console.log('Waiting for container, attempt:', attempts + 1);
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!viewerRef.current) {
          console.error('Container element not found after waiting');
          return;
        }

        console.log('Container found, initializing viewer for:', activeRuangan.nama_ruangan);

        // Destroy existing viewer first
        if (viewer) {
          console.log('Destroying existing viewer...');
          try {
            viewer.destroy();
          } catch (e) {
            console.log('Error destroying viewer:', e);
          }
          setViewer(null);
          // Add small delay after destroying
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Clear container and ensure it's ready
        if (viewerRef.current) {
          viewerRef.current.innerHTML = '';
          // Add small delay to ensure DOM is updated
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Check container again before creating viewer
        if (!viewerRef.current) {
          console.error('Container disappeared during initialization');
          return;
        }

        const { Viewer } = await import('@photo-sphere-viewer/core');
        const { MarkersPlugin } = await import('@photo-sphere-viewer/markers-plugin');

        const generatedMarkers = generateMarkers();
        console.log('Generated markers for viewer:', generatedMarkers);

        const newViewer = new Viewer({
          container: viewerRef.current,
          panorama: activeRuangan.panorama_url,
          plugins: [
            [MarkersPlugin, {
              markers: generatedMarkers
            }]
          ],
          navbar: [
            'zoom',
            'fullscreen'
          ],
          defaultZoomLvl: 0,
          fisheye: false,
          mousewheel: true,
          mousemove: true,
          keyboard: true,
          size: {
            width: '100%',
            height: '100%'
          }
        });

        // Set loaded immediately when viewer is created
        setPanoramaLoaded(true);

        newViewer.addEventListener('ready', () => {
          console.log('Panorama ready for:', activeRuangan.nama_ruangan);
          
          // Setup marker click handler
          const markersPlugin = newViewer.getPlugin('MarkersPlugin');
          if (markersPlugin) {
            markersPlugin.addEventListener('select-marker', (e: any) => {
              const marker = e.marker;
              const markerData = marker.data || marker.config?.data;
              
              if (markerData?.clickAction === 'navigate') {
                const targetId = parseInt(markerData.navigation_target);
                if (targetId) {
                  switchToRoom(targetId);
                }
              } else if (markerData?.clickAction === 'showInfo') {
                setSelectedMarker(markerData);
                setShowInfoDialog(true);
              }
            });
          }
        });

        setViewer(newViewer);

      } catch (error) {
        console.error('Error initializing panorama viewer:', error);
        setPanoramaLoaded(false);
        setIsTransitioning(false);
        toast.error('Gagal memuat panorama');
      }
    };

    // Add small delay before initialization to ensure DOM is stable
    const timeoutId = setTimeout(() => {
      initViewer();
    }, 50);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (viewer) {
        console.log('Cleaning up viewer...');
        try {
          viewer.destroy();
        } catch (e) {
          console.log('Error during cleanup:', e);
        }
      }
    };
  }, [activeRuangan, activeMarkers, generateMarkers, switchToRoom]);

  
  // Audio narration functions
  const playAudioNarration = (audioUrl: string) => {
    stopAudioNarration(); // Stop any current audio
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.addEventListener('loadstart', () => setIsPlayingAudio(true));
    audio.addEventListener('ended', () => setIsPlayingAudio(false));
    audio.addEventListener('error', () => {
      setIsPlayingAudio(false);
      toast.error('Gagal memutar audio narasi');
    });
    
    audio.play().catch(() => {
      setIsPlayingAudio(false);
      toast.error('Gagal memutar audio narasi');
    });
  };

  const stopAudioNarration = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  const toggleAudioNarration = () => {
    if (selectedMarker?.audio_url) {
      if (isPlayingAudio) {
        stopAudioNarration();
      } else {
        playAudioNarration(selectedMarker.audio_url);
      }
    }
  };

  return (
    <>
      <Head title={`${activeRuangan.nama_ruangan} - ${museum.title}`} />
      
      {/* Global styles to prevent horizontal overflow */}
      <style>{`
        html, body {
          overflow-x: hidden !important;
          max-width: 100vw !important;
        }
        
        /* Photo Sphere Viewer specific fixes */
        .psv-container {
          overflow: hidden !important;
        }
        
        .psv-canvas-container {
          overflow: hidden !important;
        }
        
        /* Prevent any child elements from causing horizontal scroll */
        * {
          box-sizing: border-box;
        }
      `}</style>
      
      <div className="h-screen w-screen bg-black relative overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-[70] bg-gradient-to-b from-black/70 to-transparent p-4 overflow-hidden">
          <div className="flex items-center justify-between w-full max-w-full">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.visit('/view')}
                className="text-white hover:bg-white/10 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <div className="text-white min-w-0 flex-1">
                <h1 className="text-lg font-semibold truncate">{activeRuangan.nama_ruangan}</h1>
                <p className="text-sm text-white/80 truncate">{museum.title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Left Trigger Button */}
        <div className={`fixed left-4 top-1/2 transform -translate-y-1/2 z-[70] transition-all duration-300 ${
          showSidebar ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowSidebar(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full p-3"
            title="Menu Museum"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Panorama Viewer */}
        <div 
          ref={viewerRef} 
          className={`w-full h-full transition-opacity duration-300 overflow-hidden ${
            panoramaLoaded ? 'opacity-100' : 'opacity-30'
          }`} 
        />

        {/* Simple Loading indicator */}
        {!panoramaLoaded && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Memuat panorama...</p>
            </div>
          </div>
        )}

        {/* Info Dialog */}
        <Dialog open={showInfoDialog} onOpenChange={(open) => {
          setShowInfoDialog(open);
          if (!open) {
            stopAudioNarration();
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                {selectedMarker?.judul}
              </DialogTitle>
            </DialogHeader>
            
            {selectedMarker?.deskripsi && (
              <DialogDescription className="text-gray-600">
                {selectedMarker.deskripsi}
              </DialogDescription>
            )}

            {/* Audio Narration Controls */}
            {selectedMarker?.audio_url && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAudioNarration}
                  className="flex items-center gap-2"
                >
                  {isPlayingAudio ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                  {isPlayingAudio ? 'Hentikan' : 'Putar'} Narasi
                </Button>
                <span className="text-sm text-purple-700">
                  {isPlayingAudio ? 'Memutar audio narasi...' : 'Audio narasi tersedia'}
                </span>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setShowInfoDialog(false)}>
                Tutup
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Visitor Guide Dialog */}
        <Dialog open={showVisitorGuide} onOpenChange={setShowVisitorGuide}>
          <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto  bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl md:text-2xl font-bold text-amber-800 bg-amber-200 px-4 py-2 rounded-lg inline-block mx-auto">
                PANDUAN PENGUNJUNG
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 px-2">
              {/* Navigation Instructions */}
              <div className="bg-white/80 rounded-xl p-4 md:p-6 border border-amber-200">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4 text-center">
                  Tekan dan Geser untuk melihat area sekitar
                </h3>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 lg:gap-8">
                  <div className="text-center flex-shrink-0 max-w-[120px]">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3 relative">
                      <div className="absolute inset-2 bg-amber-400 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M12 2v20M2 12h20"/>
                          <path d="M7 7l10 10M17 7L7 17"/>
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600">Tekan dan geser<br/>untuk melihat sekitar</p>
                  </div>
                  
                  <div className="text-center flex-shrink-0 max-w-[120px]">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3 relative">
                      <div className="absolute inset-2 bg-amber-400 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <circle cx="12" cy="12" r="4"/>
                          <path d="M16 8v5a3 3 0 0 0 6 0v-5a4 4 0 1 0-8 0Z"/>
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600">Tekan ikon lingkaran berpedah<br/>untuk berpindah/menjelajahi area sekitar</p>
                  </div>
                  
                  <div className="text-center flex-shrink-0 max-w-[120px]">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3 relative">
                      <div className="absolute inset-2 bg-amber-400 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M12 1v6m0 6v6"/>
                          <circle cx="12" cy="12" r="10"/>
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600">Gunakan roda gulir untuk<br/>memperbesar dan memperkecil</p>
                  </div>
                </div>
              </div>

              {/* Interactive Elements */}
              <div className="bg-white/80 rounded-xl p-4 md:p-6 border border-amber-200">
                <h3 className="text-base md:text-lg font-semibold text-amber-800 mb-4 text-center bg-amber-100 py-2 px-4 rounded-lg">
                  INTERAKTIF HOTSPOT
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 relative">
                      <div className="w-full h-full bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 16v-4m0-4h.01"/>
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm font-medium text-gray-800 px-1">Klik ikon untuk Melihat<br/>Detail Informasi</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 relative">
                      <div className="w-full h-full bg-red-500 rounded-lg border-4 border-white shadow-lg flex items-center justify-center">
                        <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="white">
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm font-medium text-gray-800 px-1">Klik ikon untuk Membaca<br/>Buku Museum Kepresidenan</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 relative">
                      <div className="w-full h-full bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M9 6l6 6-6 6"/>
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm font-medium text-gray-800 px-1">Klik Pananda untuk<br/>Menjelajahi Ulang Informasi</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4 w-full flex-col">
              <Button 
                variant="outline"
                onClick={() => setShowVisitorGuide(false)}
                className="border-amber-600 text-amber-800 hover:bg-amber-50 font-medium px-6 py-2 flex-1"
              >
                Tutup Saja
              </Button>
              <Button 
                onClick={handleCloseVisitorGuide}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3 rounded-lg text-lg flex-1"
              >
                TUTUP & JANGAN TAMPILKAN LAGI
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Museum Info Sidebar */}
        <MuseumInfoSidebar
          museum={museum}
          allRuangan={allRuangan}
          activeRuangan={activeRuangan}
          onRoomChange={switchToRoom}
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
        />
      </div>
    </>
  );
}