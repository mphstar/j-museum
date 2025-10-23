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
  // Room background audio (guide)
  const roomAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingRoomAudio, setIsPlayingRoomAudio] = useState(false);
  // Ducking state: lower room audio volume while narration plays
  const roomAudioDuckedByNarrationRef = useRef(false);
  const roomAudioPrevVolumeRef = useRef<number>(1);
  const roomAudioStartNeededRef = useRef(false);
  const roomAudioStartUnsubsRef = useRef<Array<() => void> | null>(null);

  const tryStartRoomAudioNow = useCallback(() => {
    if (roomAudioRef.current) {
      roomAudioRef.current.play().then(() => {
        setIsPlayingRoomAudio(true);
        roomAudioStartNeededRef.current = false;
        // If narration is already playing, duck the room audio immediately
        try {
          if (audioRef.current && !audioRef.current.paused && roomAudioRef.current) {
            roomAudioPrevVolumeRef.current = roomAudioRef.current.volume ?? 1;
            roomAudioRef.current.volume = 0.2;
            roomAudioDuckedByNarrationRef.current = true;
          }
        } catch {}
        // remove any pending listeners
        if (roomAudioStartUnsubsRef.current) {
          roomAudioStartUnsubsRef.current.forEach((fn) => {
            try { fn(); } catch {}
          });
          roomAudioStartUnsubsRef.current = null;
        }
      }).catch(() => {
        // still blocked; keep waiting
      });
    }
  }, []);

  const scheduleRoomAudioStartOnGesture = useCallback(() => {
    if (!roomAudioStartNeededRef.current) return;
    const unsubs: Array<() => void> = [];
    const handler = () => tryStartRoomAudioNow();
    // document-level listeners
    document.addEventListener('pointerdown', handler, { once: false });
    unsubs.push(() => document.removeEventListener('pointerdown', handler));
    document.addEventListener('click', handler, { once: false });
    unsubs.push(() => document.removeEventListener('click', handler));
    // container-level listener
    if (viewerRef.current) {
      const el = viewerRef.current;
      el.addEventListener('pointerdown', handler, { once: false });
      unsubs.push(() => el.removeEventListener('pointerdown', handler));
    }
    roomAudioStartUnsubsRef.current = unsubs;
  }, [tryStartRoomAudioNow]);

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
    if (roomAudioStartNeededRef.current) {
      tryStartRoomAudioNow();
    }
  };

  // Using MarkersPlugin chroma key for video markers (no canvas processing)

  // Room switching function
  const switchToRoom = useCallback((targetRuanganId: number) => {
    console.log('=== SWITCHING TO ROOM ===', targetRuanganId);
    // Stop any playing narration audio when switching rooms
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch {}
      audioRef.current = null;
      setIsPlayingAudio(false);
    }
    // Stop room background audio when switching rooms
    if (roomAudioRef.current) {
      try { roomAudioRef.current.pause(); } catch {}
      roomAudioRef.current = null;
      setIsPlayingRoomAudio(false);
    }
    
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

  // Removed custom video element path; we will use MarkersPlugin videoLayer in generateMarkers

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

      // Simplified marker creation
      if (marker.type === 'navigation') {
        console.log('Creating navigation marker for:', marker.judul, 'Target:', marker.navigation_target);
        
        // Create navigation marker element
        const navElement = document.createElement('div');
        navElement.className = 'w-12 h-12 mx-auto relative';
        navElement.setAttribute('role', 'button');
        navElement.setAttribute('tabindex', '0');
        navElement.style.touchAction = 'manipulation';
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
        
        return {
          ...baseConfig,
          element: navElement,
          anchor: 'center center'
        };
      } else {
        // For info markers with media
        if (marker.media_type === 'video' && marker.media_url) {
          // Validate and normalize media URL
          const rawUrl = marker.media_url;
          const isStringUrl = typeof rawUrl === 'string' && rawUrl.length > 0;
          let mediaUrl: string | null = null;
          if (isStringUrl) {
            try {
              // Support both absolute and relative URLs
              mediaUrl = new URL(rawUrl, window.location.origin).href;
            } catch (e) {
              console.warn('Invalid media_url, cannot construct URL:', rawUrl);
              mediaUrl = null;
            }
          }

          if (!mediaUrl) {
            console.warn('Skipping video layer, invalid media_url for marker:', marker.judul, rawUrl);
            // Fallback to a simple info element so user still sees something clickable
            const fallbackEl = document.createElement('div');
            fallbackEl.className = 'w-12 h-12 mx-auto relative';
            fallbackEl.setAttribute('role', 'button');
            fallbackEl.setAttribute('tabindex', '0');
            fallbackEl.style.touchAction = 'manipulation';
            fallbackEl.style.cssText = `cursor: pointer;`;
            fallbackEl.innerHTML = `
              <div style="width: 100%; height: 100%; background: #ef4444; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); display: flex; align-items: center; justify-content: center;">
                <svg style="width: 16px; height: 16px; pointer-events: none;" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M12 9v4m0 4h.01"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
            `;
            return {
              ...baseConfig,
              element: fallbackEl,
              anchor: 'center center',
              data: { ...baseConfig.data, clickAction: 'showInfo' },
            } as any;
          }

          console.log('Processing video info marker with controllable HTMLVideoElement:', marker.judul, 'URL:', mediaUrl);
          const width = Number(marker.media_width) || 240;
          const height = Number(marker.media_height) || 240;
          // Follow the Layers demo: provide the URL directly as videoLayer, let plugin manage the video element
          // Enable chroma key as requested
          return {
            ...baseConfig,
            videoLayer: mediaUrl,
            size: { width, height },
            style: { cursor: 'pointer' },
            anchor: 'center center',
            tooltip: 'Play / Stop',
            chromaKey: {
            enabled: true,
            color: '#00FF00',
            similarity: 0.2,
            smoothness: 0.2
          },
            data: { ...baseConfig.data, clickAction: 'toggleVideoInfoPlay' },
          } as any;
        } else {
          console.log('Processing regular info marker:', marker.judul);
          
          // Create info marker element
          const infoElement = document.createElement('div');
          infoElement.className = 'w-12 h-12 mx-auto relative';
          infoElement.setAttribute('role', 'button');
          infoElement.setAttribute('tabindex', '0');
          infoElement.style.touchAction = 'manipulation';
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
          
          // Regular info marker
          return {
            ...baseConfig,
            element: infoElement,
            anchor: 'center center'
          };
        }
      }
    }).filter((marker: any) => marker !== null);
  }, [activeMarkers, switchToRoom]);

  // Handle browser back/forward navigation and initial hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/#ruangan-(\d+)/);
      
      if (match) {
        const ruanganIdFromHash = parseInt(match[1]);
        if (ruanganIdFromHash && ruanganIdFromHash !== activeRuangan?.id) {
          // Stop any playing narration audio when switching rooms via hash
          if (audioRef.current) {
            try { audioRef.current.pause(); } catch {}
            audioRef.current = null;
            setIsPlayingAudio(false);
          }
          // Stop room background audio when switching rooms via hash
          if (roomAudioRef.current) {
            try { roomAudioRef.current.pause(); } catch {}
            roomAudioRef.current = null;
            setIsPlayingRoomAudio(false);
          }
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
        // Stop any playing narration audio when switching rooms via history
        if (audioRef.current) {
          try { audioRef.current.pause(); } catch {}
          audioRef.current = null;
          setIsPlayingAudio(false);
        }
        if (roomAudioRef.current) {
          try { roomAudioRef.current.pause(); } catch {}
          roomAudioRef.current = null;
          setIsPlayingRoomAudio(false);
        }
        const targetRuangan = allRuangan.find((r: any) => r.id === event.state.ruanganId);
        if (targetRuangan) {
          setActiveRuangan(targetRuangan);
          setActiveMarkers(targetRuangan.markers || []);
          console.log('Navigation via browser back/forward to:', targetRuangan.nama_ruangan);
        }
      } else {
        // If no state, go back to main room
        if (audioRef.current) {
          try { audioRef.current.pause(); } catch {}
          audioRef.current = null;
          setIsPlayingAudio(false);
        }
        if (roomAudioRef.current) {
          try { roomAudioRef.current.pause(); } catch {}
          roomAudioRef.current = null;
          setIsPlayingRoomAudio(false);
        }
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
    // Start room-level audio guide if available for this room
    try {
      // stop previous room audio first (safety)
      if (roomAudioRef.current) {
        try { roomAudioRef.current.pause(); } catch {}
        roomAudioRef.current = null;
        setIsPlayingRoomAudio(false);
      }
      const guideUrl = (activeRuangan as any)?.audio_guide_url as string | undefined;
      if (guideUrl) {
        let resolvedUrl: string | null = null;
        try {
          resolvedUrl = new URL(guideUrl, window.location.origin).href;
        } catch {
          resolvedUrl = guideUrl; // fallback to raw
        }
        const audio = new Audio(resolvedUrl);
        audio.loop = true; // loop background guide by default
        roomAudioRef.current = audio;
        audio.play().then(() => {
          setIsPlayingRoomAudio(true);
          // if narration already playing, duck immediately
          try {
            if (audioRef.current && !audioRef.current.paused) {
              roomAudioPrevVolumeRef.current = audio.volume ?? 1;
              audio.volume = 0.2;
              roomAudioDuckedByNarrationRef.current = true;
            }
          } catch {}
        }).catch(() => {
          // autoplay blocked; arm gesture listeners
          setIsPlayingRoomAudio(false);
          roomAudioStartNeededRef.current = true;
          scheduleRoomAudioStartOnGesture();
        });
      }
    } catch {}

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
              markers: generatedMarkers,
              clickEventOnMarker: true,
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
          // try start room audio on first viewer interaction if was blocked
          newViewer.addEventListener('click', () => {
            if (roomAudioStartNeededRef.current) tryStartRoomAudioNow();
          });
          
          // Setup marker click handler
          const markersPlugin = newViewer.getPlugin(MarkersPlugin);
          if (markersPlugin) {
            // Ensure all video markers are paused by default (start from beginning)
            setTimeout(() => {
              try {
                const allMarkers = (markersPlugin as any).getMarkers ? (markersPlugin as any).getMarkers() : [];
                if (Array.isArray(allMarkers)) {
                  allMarkers.forEach((m: any) => {
                    const v: HTMLVideoElement | undefined = (m as any).video as any;
                    if (v) {
                      try { v.pause(); } catch {}
                      try { v.currentTime = 0; } catch {}
                    }
                  });
                }
              } catch (e) {
                console.warn('Unable to pause video markers by default:', e);
              }
            }, 0);

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
              } else if (markerData?.clickAction === 'toggleVideoInfoPlay') {
                // Play/Stop behavior: when starting, always from the beginning (video & audio)
                try {
                  const videoEl: HTMLVideoElement | undefined = (marker as any).video as any;
                  if (videoEl) {
                    const isPaused = videoEl.paused;
                    if (isPaused) {
                      // start playback under user gesture (like demo), from the beginning
                      try { videoEl.currentTime = 0; } catch {}
                      (videoEl as any).playsInline = true;
                      videoEl.setAttribute('playsinline', 'true');
                      videoEl.muted = true; // keep video muted; separate narration below
                      videoEl.play().catch(() => {});
                      // start audio narration only if provided by DB
                      const audioUrl = markerData?.audio_url;
                      if (audioUrl) {
                        // pause room audio while narration plays
                        if (roomAudioRef.current) {
                          try {
                            roomAudioPrevVolumeRef.current = roomAudioRef.current.volume ?? 1;
                            roomAudioRef.current.volume = 0.2;
                            roomAudioDuckedByNarrationRef.current = true;
                          } catch {}
                        } else {
                          roomAudioDuckedByNarrationRef.current = false;
                        }
                        // restart audio from beginning by recreating it
                        playAudioNarration(audioUrl);
                      }
                    } else {
                      // stop playback and reset to beginning
                      videoEl.pause();
                      try { videoEl.currentTime = 0; } catch {}
                      // stop narration audio
                      stopAudioNarration();
                      // resume room audio if it was paused by narration
                      if (roomAudioDuckedByNarrationRef.current && roomAudioRef.current) {
                        try {
                          roomAudioRef.current.volume = roomAudioPrevVolumeRef.current || 1;
                        } catch {}
                        roomAudioDuckedByNarrationRef.current = false;
                      }
                    }
                  } else {
                    console.warn('No video element attached to marker for toggle.');
                  }
                } catch (err) {
                  console.error('Error toggling video play/pause:', err);
                }
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
      // Ensure audio stops on unmount / viewer re-init
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch {}
        audioRef.current = null;
        setIsPlayingAudio(false);
      }
      if (roomAudioRef.current) {
        try { roomAudioRef.current.pause(); } catch {}
        roomAudioRef.current = null;
        setIsPlayingRoomAudio(false);
      }
      if (roomAudioStartUnsubsRef.current) {
        roomAudioStartUnsubsRef.current.forEach((fn) => {
          try { fn(); } catch {}
        });
        roomAudioStartUnsubsRef.current = null;
      }
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
    // Loop narration to match looping video markers
    audio.loop = true;
    
    audio.addEventListener('loadstart', () => setIsPlayingAudio(true));
    // If looping, don't mark as stopped on 'ended' between loops
    audio.addEventListener('ended', () => {
      if (!audio.loop) setIsPlayingAudio(false);
    });
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
        // restore room audio volume if it was ducked
        if (roomAudioDuckedByNarrationRef.current && roomAudioRef.current) {
          try {
            roomAudioRef.current.volume = roomAudioPrevVolumeRef.current || 1;
          } catch {}
          roomAudioDuckedByNarrationRef.current = false;
        }
      } else {
        // duck room audio while narration plays
        if (roomAudioRef.current) {
          try {
            roomAudioPrevVolumeRef.current = roomAudioRef.current.volume ?? 1;
            roomAudioRef.current.volume = 0.2;
            roomAudioDuckedByNarrationRef.current = true;
          } catch {}
        } else {
          roomAudioDuckedByNarrationRef.current = false;
        }
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
            // restore room audio volume if it was ducked by narration
            if (roomAudioDuckedByNarrationRef.current && roomAudioRef.current) {
              try {
                roomAudioRef.current.volume = roomAudioPrevVolumeRef.current || 1;
              } catch {}
              roomAudioDuckedByNarrationRef.current = false;
            }
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
          <DialogContent className="w-[100vw] sm:w-[90vw] sm:max-w-2xl h-auto max-h-[80dvh] p-0 overflow-hidden rounded-none sm:rounded-2xl border-0 sm:border bg-white dark:bg-neutral-900 z-[9999]">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-5 py-4 bg-amber-100/80 dark:bg-amber-900/20 border-b border-amber-200/60 dark:border-amber-800/50">
                <DialogTitle className="text-lg sm:text-xl font-bold text-amber-900 dark:text-amber-200 text-center">
                  Panduan Singkat
                </DialogTitle>
                <p className="text-xs sm:text-sm text-amber-800/80 dark:text-amber-200/80 text-center mt-1">
                  Cara cepat menjelajahi panorama di HP
                </p>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* 1. Gerak Kamera */}
                  <div className="rounded-xl border border-amber-200/70 dark:border-amber-800/60 bg-white/90 dark:bg-neutral-800 p-4 flex items-center gap-3">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-amber-400/90 flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M12 2v20M2 12h20"/>
                        <path d="M7 7l10 10M17 7L7 17"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100">Gerakkan Kamera</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Sentuh & geser untuk melihat sekitar</p>
                    </div>
                  </div>

                  {/* 2. Pindah Ruangan */}
                  <div className="rounded-xl border border-emerald-200/70 dark:border-emerald-800/60 bg-white/90 dark:bg-neutral-800 p-4 flex items-center gap-3">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M9 6l6 6-6 6"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100">Pindah Ruangan</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Ketuk penanda hijau untuk berpindah</p>
                    </div>
                  </div>

                  {/* 3. Info & Video */}
                  <div className="rounded-xl border border-blue-200/70 dark:border-blue-800/60 bg-white/90 dark:bg-neutral-800 p-4 flex items-center gap-3">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16v-4m0-4h.01"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100">Lihat Informasi</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Ketuk penanda biru untuk detail</p>
                    </div>
                  </div>

                  {/* 4. Video Play/Stop */}
                  <div className="rounded-xl border border-purple-200/70 dark:border-purple-800/60 bg-white/90 dark:bg-neutral-800 p-4 flex items-center gap-3">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100">Video Play / Stop</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Ketuk video untuk mulai/berhenti, narasi audio ikut</p>
                    </div>
                  </div>
                </div>

                {/* Zoom & Tips */}
                <div className="rounded-xl border border-amber-200/70 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-900/10 p-4">
                  <p className="text-sm sm:text-base font-semibold text-amber-900 dark:text-amber-200 mb-2">Zoom & Tips</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li className="text-xs sm:text-sm text-amber-800 dark:text-amber-100/90">Cubitan (pinch) untuk zoom in/out</li>
                    <li className="text-xs sm:text-sm text-amber-800 dark:text-amber-100/90">Gunakan tombol zoom di toolbar jika perlu</li>
                    <li className="text-xs sm:text-sm text-amber-800 dark:text-amber-100/90">Ketuk sekali pada marker—tidak perlu menahan</li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-amber-200/60 dark:border-amber-800/50 bg-white/90 dark:bg-neutral-900">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => setShowVisitorGuide(false)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-5 sm:py-2 rounded-lg flex-1"
                  >
                    Mengerti, Mulai Jelajah
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleCloseVisitorGuide}
                    className="border-amber-500 text-amber-700 hover:bg-amber-50 dark:text-amber-200 dark:border-amber-700 dark:hover:bg-amber-900/20 font-medium px-6 py-5 sm:py-2 rounded-lg flex-1"
                  >
                    Jangan tampilkan lagi
                  </Button>
                </div>
              </div>
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
          onOpenGuide={() => setShowVisitorGuide(true)}
        />
      </div>
    </>
  );
}