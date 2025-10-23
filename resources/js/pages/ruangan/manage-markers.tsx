import React, { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Plus, MapPin, Info, Navigation, Volume2, Play, Edit, Trash2, Save, Upload, X } from 'lucide-react';
import '../../../css/photo-sphere-viewer.css';

export default function ManageMarkers() {
  const { ruangan, museum, markers, ruangan_list } = usePage().props as any;
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<any>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  const [showMarkerForm, setShowMarkerForm] = useState(false);
  const [editingMarker, setEditingMarker] = useState<any>(null);
  const [pendingPosition, setPendingPosition] = useState<{yaw: number, pitch: number} | null>(null);
  const [processing, setProcessing] = useState(false);
  const [tempMarker, setTempMarker] = useState<any>(null);
  const [isPositioning, setIsPositioning] = useState(false);
  const [panoramaLoaded, setPanoramaLoaded] = useState(false);

  // Use refs to maintain current state in event listeners
  const showMarkerFormRef = useRef(showMarkerForm);
  const isPositioningRef = useRef(isPositioning);
  const pendingPositionRef = useRef(pendingPosition);

  // Update refs when state changes
  useEffect(() => {
    showMarkerFormRef.current = showMarkerForm;
  }, [showMarkerForm]);

  useEffect(() => {
    isPositioningRef.current = isPositioning;
  }, [isPositioning]);

  useEffect(() => {
    pendingPositionRef.current = pendingPosition;
  }, [pendingPosition]);

  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    type: 'info' as 'info' | 'navigation',
    navigation_target: '',
    media_file: null as File | null,
    media_type: 'image' as 'image' | 'video',
    media_width: 100,
    media_height: 100,
    audio_file: null as File | null
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Museum', href: '/museum' },
    { title: museum.title, href: `/museum/edit/${museum.id}` },
    { title: 'Ruangan', href: `/museum/${museum.id}/ruangan` },
    { title: ruangan.nama_ruangan, href: `/museum/${museum.id}/ruangan/edit/${ruangan.id}` },
    { title: 'Kelola Marker', href: '#' }
  ];

  const markerTypes = [
    { value: 'info', label: 'Informasi', icon: Info, color: '#3b82f6', description: 'Marker informasi umum' },
    { value: 'navigation', label: 'Navigasi', icon: Navigation, color: '#10b981', description: 'Pindah ke ruangan lain' }
  ];

  const getMarkerTypeInfo = (type: string) => {
    return markerTypes.find(t => t.value === type) || markerTypes[0];
  };

  // Handle panorama click with useCallback to ensure fresh state
  const handlePanoramaClick = useCallback((e: any) => {
    console.log('Panorama clicked:', e); // Debug log
    console.log('Event data:', e.data); // Debug log
    console.log('Current showMarkerForm (ref):', showMarkerFormRef.current); // Debug log
    console.log('Current isPositioning (ref):', isPositioningRef.current); // Debug log
    
    // Prevent default behavior
    e.preventDefault?.();
    
    const clickData = e.data;
    if (clickData && typeof clickData.yaw === 'number' && typeof clickData.pitch === 'number') {
      const position = { yaw: clickData.yaw, pitch: clickData.pitch };
      console.log('Valid position clicked:', position); // Debug log
      
      if (isPositioningRef.current) {
        // In positioning mode - update position, exit positioning mode, and reopen dialog
        console.log('Positioning mode: updating position and reopening form'); // Debug log
        setPendingPosition(position);
        setIsPositioning(false); // Exit positioning mode
        setShowMarkerForm(true); // Reopen dialog
        toast.success(`Posisi marker berhasil dipilih: ${position.yaw.toFixed(1)}°, ${position.pitch.toFixed(1)}°`);
      } else if (showMarkerFormRef.current) {
        // Form open but not in positioning mode - just update position
        console.log('Updating position for open form (not positioning)'); // Debug log
        setPendingPosition(position);
        toast.success(`Posisi marker diperbarui: ${position.yaw.toFixed(1)}°, ${position.pitch.toFixed(1)}°`);
      } else {
        // Create new marker only if form is not open
        console.log('Creating new marker at position'); // Debug log
        setPendingPosition(position);
        setShowMarkerForm(true);
      }
    } else {
      console.log('Invalid click data:', clickData); // Debug log
    }
  }, []);

  useEffect(() => {
    if (!ruangan.panorama_url || !viewerRef.current) return;

    const initViewer = async () => {
      try {
        setPanoramaLoaded(false);
        
        // Import Photo Sphere Viewer dynamically
        const { Viewer } = await import('@photo-sphere-viewer/core');
        const { MarkersPlugin } = await import('@photo-sphere-viewer/markers-plugin');

        const newViewer = new Viewer({
          container: viewerRef.current!,
          panorama: ruangan.panorama_url,
          plugins: [
            [MarkersPlugin, {
              clickEventOnMarker: true,
              markers: markers?.map((marker: any) => generateMarkerConfig(marker)) || []
            }]
          ],
          navbar: [
            'zoom',
            'move',
            'fullscreen',
          ],
          loadingTxt: 'Memuat panorama...',
        });

        // Wait for viewer to be ready before setting up event listeners
        newViewer.addEventListener('ready', () => {
          console.log('Viewer ready, setting up plugins');
          setPanoramaLoaded(true);
          
          try {
            // Get markers plugin after viewer is ready
            const markersPlugin = newViewer.getPlugin(MarkersPlugin);
            console.log('MarkersPlugin available:', !!markersPlugin);
            
            if (markersPlugin) {
              // Handle marker clicks for editing
              markersPlugin.addEventListener('select-marker', (e: any) => {
                console.log('Marker selected:', e.marker);
                const marker = e.marker.data;
                setSelectedMarkerId(marker.id);
                openEditForm(marker);
              });
            }

            // Handle panorama clicks for adding new markers and positioning
            newViewer.addEventListener('click', handlePanoramaClick);
            
          } catch (error) {
            console.error('Error setting up markers plugin:', error);
          }
        });

        setViewer(newViewer);

      } catch (error) {
        console.error('Error initializing panorama viewer:', error);
        toast.error('Gagal memuat panorama viewer');
      }
    };

    initViewer();

    return () => {
      if (viewer) {
        viewer.destroy();
      }
    };
  }, [ruangan.panorama_url]); // Remove markers and handlePanoramaClick dependency

  // Separate effect to update markers without reinitializing viewer
  useEffect(() => {
    if (viewer && panoramaLoaded && markers) {
      import('@photo-sphere-viewer/markers-plugin').then(({ MarkersPlugin }) => {
        try {
          const markersPlugin = viewer.getPlugin(MarkersPlugin);
          
          if (markersPlugin) {
            // Clear existing markers and add new ones
            markersPlugin.clearMarkers();
            markers.forEach((marker: any) => {
              markersPlugin.addMarker(generateMarkerConfig(marker));
            });
            console.log('Markers updated without reinitializing viewer');
          }
        } catch (error) {
          console.error('Error updating markers:', error);
        }
      });
    }
  }, [markers, viewer, panoramaLoaded]);

  // Update temp marker when pendingPosition changes
  useEffect(() => {
    if (pendingPosition && viewer && showMarkerForm && panoramaLoaded) {
      try {
        // Use import dynamically to get the plugin class
        import('@photo-sphere-viewer/markers-plugin').then(({ MarkersPlugin }) => {
          const markersPlugin = viewer.getPlugin(MarkersPlugin);
          if (!markersPlugin) {
            console.error('MarkersPlugin not found');
            return;
          }
          
          // Remove old temp marker if exists
          if (tempMarker) {
            try {
              markersPlugin.removeMarker(tempMarker);
              console.log('Removed old temp marker:', tempMarker);
            } catch (e) {
              console.log('Old temp marker not found');
            }
          }
          
          // Create new temp marker with media preview
          const newTempMarker = generateTempMarkerConfig(
            pendingPosition, 
            formData.type,
            formData.media_file || undefined
          );
          
          markersPlugin.addMarker(newTempMarker);
          setTempMarker(newTempMarker.id);
          console.log('Added temp marker:', newTempMarker.id, 'at position:', pendingPosition);
        }).catch(error => {
          console.error('Error importing MarkersPlugin:', error);
        });
      } catch (error) {
        console.error('Error creating temp marker:', error);
      }
    }
  }, [pendingPosition, viewer, showMarkerForm, formData.type, formData.media_file, panoramaLoaded]);

  // Using MarkersPlugin videoLayer + chromaKey (see Chroma Key demo); removed custom Canvas approach

  // Generate marker configuration based on media and type
  const generateMarkerConfig = (marker: any) => {
    const typeInfo = getMarkerTypeInfo(marker.type);
    const hasMedia = marker.media_url && marker.media_type;
    
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
      data: marker
    };

    if (hasMedia) {
      if (marker.media_type === 'video') {
        const width = marker.media_width || 100;
        const height = marker.media_height || 100;
        return {
          ...baseConfig,
          videoLayer: marker.media_url,
          size: { width, height },
          chromaKey: {
            enabled: true,
            color: '#00FF00',
            similarity: 0.2,
            smoothness: 0.2
          },
          anchor: 'center center',
        } as any;
      } else if (marker.media_type === 'image') {
        // Image marker with custom size
        const width = marker.media_width || 100;
        const height = marker.media_height || 100;
        return {
          ...baseConfig,
          image: marker.media_url,
          size: { width, height },
          className: 'custom-image-marker'
        };
      }
    }

    // Default HTML marker for types without media or for navigation/audio
    return {
      ...baseConfig,
      html: `
        <div class="custom-marker custom-marker-${marker.type}" style="
          width: 35px; 
          height: 35px; 
          background: ${typeInfo.color}; 
          border: 2px solid white; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            ${getIconSVG(marker.type)}
          </svg>
          <div class="marker-pulse" style="
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: ${typeInfo.color};
            opacity: 0.6;
            animation: markerPulse 2s infinite;
          "></div>
        </div>
      `
    };
  };

  // Generate temp marker configuration with media preview
  const generateTempMarkerConfig = (position: {yaw: number, pitch: number}, type: string, mediaFile?: File) => {
    const selectedType = markerTypes.find(t => t.value === type);
    const tempMarkerId = 'temp-marker-' + Date.now();
    
    // If there's a media file, create preview URL
    if (mediaFile) {
      const mediaUrl = URL.createObjectURL(mediaFile);
      
      if (mediaFile.type.startsWith('video/')) {
        const previewWidth = Math.min(formData.media_width || 50, 50);
        const previewHeight = Math.min(formData.media_height || 50, 50);
        const blobUrl = URL.createObjectURL(mediaFile);

        return {
          id: tempMarkerId,
          position,
          videoLayer: blobUrl,
          size: { width: previewWidth, height: previewHeight },
          chromaKey: {
            enabled: true,
            color: '#009200',
            similarity: 0.1,
          },
          anchor: 'center center',
          tooltip: {
            content: `Preview Video Greenscreen - Posisi: ${position.yaw.toFixed(1)}°, ${position.pitch.toFixed(1)}°`,
            position: 'top center'
          }
        } as any;
      } else if (mediaFile.type.startsWith('image/')) {
        // Use current form data for size or default to 45px for preview
        const previewWidth = Math.min(formData.media_width || 45, 50); // Cap preview size
        const previewHeight = Math.min(formData.media_height || 45, 50);
        
        return {
          id: tempMarkerId,
          position: position,
          html: `
            <div class="temp-image-marker" style="
              width: ${previewWidth}px; 
              height: ${previewHeight}px; 
              border-radius: 50%; 
              border: 2px solid #ff6b35; 
              overflow: hidden;
              box-shadow: 0 4px 16px rgba(0,0,0,0.6);
              cursor: move;
              transform: scale(1.1);
              animation: markerPulse 1.5s infinite;
              position: relative;
            ">
              <img 
                src="${mediaUrl}" 
                style="width: 100%; height: 100%; object-fit: cover;" 
                alt="Preview"
              />
              <div style="
                position: absolute;
                top: -5px;
                right: -5px;
                width: 16px;
                height: 16px;
                background: #ff6b35;
                border-radius: 50%;
                border: 2px solid white;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              </div>
            </div>
          `,
          tooltip: {
            content: `Preview Gambar - Posisi: ${position.yaw.toFixed(1)}°, ${position.pitch.toFixed(1)}°`,
            position: 'top center'
          }
        };
      }
    }

    // Default temp marker for types without media
    return {
      id: tempMarkerId,
      position: position,
      html: `
        <div class="temp-default-marker" style="
          width: 35px; 
          height: 35px; 
          border-radius: 50%; 
          background: ${selectedType?.color || '#3b82f6'}; 
          border: 2px solid #ff6b35; 
          box-shadow: 0 4px 16px rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          cursor: move;
          transform: scale(1.2);
          animation: markerPulse 1.5s infinite;
          position: relative;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            ${getIconSVG(type)}
          </svg>
          <div style="
            position: absolute;
            top: -5px;
            right: -5px;
            width: 16px;
            height: 16px;
            background: #ff6b35;
            border-radius: 50%;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `,
      tooltip: {
        content: `${selectedType?.label} - Posisi: ${position.yaw.toFixed(1)}°, ${position.pitch.toFixed(1)}°`,
        position: 'top center'
      }
    };
  };

  const getIconSVG = (type: string) => {
    switch (type) {
      case 'info':
        return '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>';
      case 'navigation':
        return '<polygon points="3,11 22,2 13,21 11,13 3,11"/>';
      default:
        return '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>';
    }
  };

  const deleteMarker = (markerId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus marker ini?')) {
      router.delete(route('museum.ruangan.markers.destroy', [museum.id, ruangan.id, markerId]), {
        onSuccess: () => {
          toast.success('Marker berhasil dihapus');
          
          // Close the form dialog after successful delete
          closeForm();
          
          // Let the markers effect handle the update automatically
          console.log('Marker deleted, will update automatically');
        },
        onError: () => {
          toast.error('Gagal menghapus marker');
        }
      });
    }
  };

  const typeStats = markerTypes.map(type => ({
    ...type,
    count: markers?.filter((m: any) => m.type === type.value).length || 0
  }));

  // Form management functions
  const resetForm = () => {
    setFormData({
      judul: '',
      deskripsi: '',
      type: 'info',
      navigation_target: '',
      media_file: null,
      media_type: 'image',
      media_width: 100,
      media_height: 100,
      audio_file: null
    });
    setPendingPosition(null);
    setEditingMarker(null);
    setTempMarker(null);
    setIsPositioning(false);
  };

  const openCreateForm = useCallback(() => {
    resetForm();
    setShowMarkerForm(true);
    console.log('Opening create form, pendingPosition:', pendingPositionRef.current);
    
    // Don't try to create temp marker here - let the useEffect handle it
    // when pendingPosition and viewer are both ready
  }, []);

  const openEditForm = (marker: any) => {
    setFormData({
      judul: marker.judul || '',
      deskripsi: marker.deskripsi || '',
      type: marker.type || 'info',
      navigation_target: marker.navigation_target || '',
      media_file: null,
      media_type: marker.media_type || 'image',
      media_width: marker.media_width || 100,
      media_height: marker.media_height || 100,
      audio_file: null
    });
    setPendingPosition({
      yaw: parseFloat(marker.position_yaw || '0'),
      pitch: parseFloat(marker.position_pitch || '0')
    });
    setEditingMarker(marker);
    setShowMarkerForm(true);
    
    // Add temporary marker for repositioning
    if (viewer) {
      const markersPlugin = viewer.getPlugin('MarkersPlugin');
      const selectedType = markerTypes.find(t => t.value === marker.type);
      
      const tempMarkerId = 'temp-positioning';
      markersPlugin.addMarker({
        id: tempMarkerId,
        position: { 
          yaw: parseFloat(marker.position_yaw || '0'), 
          pitch: parseFloat(marker.position_pitch || '0') 
        },
        html: `<div style="
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          background: ${selectedType?.color || '#3b82f6'}; 
          border: 3px solid white; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          cursor: move;
          animation: pulse 2s infinite;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            ${getIconSVG(marker.type)}
          </svg>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        </style>`,
        tooltip: {
          content: `${marker.judul} - Klik untuk reposisi`,
          position: 'top center'
        }
      });
      
      setTempMarker(tempMarkerId);
    }
  };

  const closeForm = () => {
    // Remove temporary marker safely
    if (viewer && tempMarker) {
      import('@photo-sphere-viewer/markers-plugin').then(({ MarkersPlugin }) => {
        try {
          const markersPlugin = viewer.getPlugin(MarkersPlugin);
          if (markersPlugin) {
            markersPlugin.removeMarker(tempMarker);
            console.log('Removed temp marker on form close:', tempMarker);
          }
        } catch (e) {
          console.log('Error removing temp marker on close:', e);
        }
      }).catch(error => {
        console.error('Error importing MarkersPlugin for cleanup:', error);
      });
    }
    
    setShowMarkerForm(false);
    setEditingMarker(null);
    setSelectedMarkerId(null);
    setPendingPosition(null);
    setTempMarker(null);
    setIsPositioning(false);
    resetForm();
  };

  const startPositioning = () => {
    console.log('Start positioning mode'); // Debug log
    setIsPositioning(true);
    // Dialog akan tertutup otomatis karena showMarkerForm && !isPositioning
    toast.info('Mode positioning aktif! Klik pada panorama untuk memilih posisi marker baru', {
      duration: 8000,
      action: {
        label: 'Selesai',
        onClick: () => {
          setIsPositioning(false);
          // Buka kembali dialog setelah positioning selesai
          setShowMarkerForm(true);
        }
      }
    });
  };

  const updateMarkerPosition = (position: {yaw: number, pitch: number}) => {
    console.log('Updating marker position:', position); // Debug log
    setPendingPosition(position);
    
    // Update temporary marker position if exists
    if (viewer && tempMarker) {
      const markersPlugin = viewer.getPlugin('MarkersPlugin');
      try {
        // Remove old temp marker
        markersPlugin.removeMarker(tempMarker);
      } catch (e) {
        console.log('Old temp marker not found, creating new one');
      }
      
      // Add new temp marker at updated position
      const selectedType = markerTypes.find(t => t.value === formData.type);
      const newTempMarker = {
        id: tempMarker,
        position: position,
        html: `<div style="
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          background: ${selectedType?.color || '#3b82f6'}; 
          border: 3px solid white; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          cursor: move;
          transform: scale(1.2);
          animation: markerPulse 1.5s infinite;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            ${getIconSVG(formData.type)}
          </svg>
        </div>
        <style>
          @keyframes markerPulse {
            0% { transform: scale(1.2); box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
            50% { transform: scale(1.4); box-shadow: 0 6px 20px rgba(0,0,0,0.6); }
            100% { transform: scale(1.2); box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
          }
        </style>`,
        tooltip: {
          content: `Posisi: ${position.yaw.toFixed(1)}°, ${position.pitch.toFixed(1)}°`,
          position: 'top center'
        }
      };
      
      markersPlugin.addMarker(newTempMarker);
    } else if (viewer) {
      // Create temp marker if it doesn't exist
      const markersPlugin = viewer.getPlugin('MarkersPlugin');
      const selectedType = markerTypes.find(t => t.value === formData.type);
      const tempMarkerId = 'temp-positioning-' + Date.now();
      
      const newTempMarker = {
        id: tempMarkerId,
        position: position,
        html: `<div style="
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          background: ${selectedType?.color || '#3b82f6'}; 
          border: 3px solid white; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          cursor: move;
          transform: scale(1.2);
          animation: markerPulse 1.5s infinite;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            ${getIconSVG(formData.type)}
          </svg>
        </div>`,
        tooltip: {
          content: `Posisi baru: ${position.yaw.toFixed(1)}°, ${position.pitch.toFixed(1)}°`,
          position: 'top center'
        }
      };
      
      markersPlugin.addMarker(newTempMarker);
      setTempMarker(tempMarkerId);
    }
    
    setIsPositioning(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData); // Debug log
    console.log('Pending position:', pendingPosition); // Debug log
    setProcessing(true);

    if (!pendingPosition) {
      toast.error('Silakan tentukan posisi marker terlebih dahulu');
      setProcessing(false);
      return;
    }

    const submitData = new FormData();
    submitData.append('judul', formData.judul);
    submitData.append('deskripsi', formData.deskripsi);
    submitData.append('type', formData.type);
    submitData.append('position_yaw', pendingPosition.yaw.toString());
    submitData.append('position_pitch', pendingPosition.pitch.toString());
    
    if (formData.navigation_target) {
      submitData.append('navigation_target', formData.navigation_target);
    }
    
    if (formData.media_file) {
      submitData.append('media_file', formData.media_file);
      submitData.append('media_type', formData.media_type);
    }
    
    submitData.append('media_width', formData.media_width.toString());
    submitData.append('media_height', formData.media_height.toString());
    
    if (formData.audio_file) {
      submitData.append('audio_file', formData.audio_file);
    }

    const isEditing = !!editingMarker;
    const url = isEditing 
      ? route('museum.ruangan.markers.update', [museum.id, ruangan.id, editingMarker.id])
      : route('museum.ruangan.markers.store', [museum.id, ruangan.id]);

    console.log('Submitting to URL:', url); // Debug log

    router.post(url, submitData, {
      onSuccess: (page) => {
        toast.success(isEditing ? 'Marker berhasil diupdate' : 'Marker berhasil dibuat');
        
        // Instead of router.reload, just close form and let the markers effect handle the update
        closeForm();
        
        // Trigger a small delay to ensure data is updated
        setTimeout(() => {
          console.log('Marker operation completed');
        }, 100);
      },
      onError: (errors) => {
        console.error('Form errors:', errors);
        toast.error(isEditing ? 'Gagal mengupdate marker' : 'Gagal membuat marker');
        setProcessing(false);
      },
      onFinish: () => {
        setProcessing(false);
      }
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Kelola Marker - ${ruangan.nama_ruangan}`} />
      
      <div className="flex h-full w-full">
        {/* Left Panel - Panorama Viewer */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="   border-b px-6 py-4 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.visit(route('museum.ruangan.index', [museum.id]))}
                  className="gap-2 w-fit"
                >
                  <ArrowLeft size={16} />
                  Kembali
                </Button>
                <div className="">
                  <h1 className="text-xl font-bold tracking-tight flex items-center gap-3">
                    <MapPin size={20} />
                    Kelola Marker
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {ruangan.nama_ruangan} - Klik pada panorama untuk menambah marker
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={() => openCreateForm()}
                className="gap-2"
              >
                <Plus size={16} />
                Tambah Marker
              </Button>
            </div>
          </div>

          {/* Panorama Viewer */}
          <div className="flex-1 relative">
            {ruangan.panorama_url ? (
              <>
                <div ref={viewerRef} className="w-full h-full" />
                
                {/* Add CSS for marker animations */}
                <style dangerouslySetInnerHTML={{
                  __html: `
                    @keyframes markerPulse {
                      0% { transform: scale(1.2); box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
                      50% { transform: scale(1.4); box-shadow: 0 6px 20px rgba(0,0,0,0.6); }
                      100% { transform: scale(1.2); box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
                    }
                  `
                }} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center">
                  <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">Panorama belum diatur</p>
                  <p className="text-sm text-gray-500">Upload panorama di halaman edit ruangan</p>
                </div>
              </div>
            )}
            
            {/* Overlay Instructions */}
            {ruangan.panorama_url && (
              <>
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
                  💡 Klik pada panorama untuk menambah marker, klik marker untuk mengedit
                </div>
                
                {isPositioning && (
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium animate-pulse">
                    🎯 Mode Posisi Aktif - Klik untuk menentukan lokasi marker
                  </div>
                )}
                
                {showMarkerForm && !isPositioning && (
                  <div className="absolute bottom-4 left-4 bg-green-600 text-white px-3 py-2 rounded-lg text-sm">
                    ✏️ Form terbuka - Klik panorama untuk mengatur ulang posisi
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Marker List */}
  <div className="w-80   border-l flex flex-col dark:border-gray-800">
          {/* Stats */}
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3">Statistik Marker</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="text-sm font-medium">Total</span>
                <span className="font-bold">{markers?.length || 0}</span>
              </div>
              {typeStats.map((type) => {
                const IconComponent = type.icon;
                return (
                  <div key={type.value} className="flex items-center justify-between p-2 rounded">
                    <div className="flex items-center gap-2">
                      <IconComponent size={14} style={{ color: type.color }} />
                      <span className="text-sm">{type.label}</span>
                    </div>
                    <span className="font-medium">{type.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Marker List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold mb-3">Daftar Marker ({markers?.length || 0})</h3>
              
              {markers && markers.length > 0 ? (
                <div className="space-y-3">
                  {markers.map((marker: any) => {
                    const typeInfo = getMarkerTypeInfo(marker.type);
                    const IconComponent = typeInfo.icon;
                    
                    return (
                      <div 
                        key={marker.id} 
                        className={`p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                          selectedMarkerId === marker.id ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-950/30' : 'dark:border-gray-700'
                        }`}
                        onClick={() => {
                          setSelectedMarkerId(marker.id);
                          // Focus marker in panorama if viewer is available
                          if (viewer) {
                            try {
                              const markersPlugin = viewer.getPlugin('MarkersPlugin');
                              markersPlugin.gotoMarker(marker.id.toString(), 1000);
                            } catch (error) {
                              console.error('Error focusing marker:', error);
                            }
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Marker Icon */}
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-white shadow-sm flex-shrink-0"
                            style={{ backgroundColor: typeInfo.color }}
                          >
                            <IconComponent size={12} className="text-white" />
                          </div>
                          
                          {/* Marker Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm truncate">{marker.judul}</h4>
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ borderColor: typeInfo.color, color: typeInfo.color }}
                              >
                                {typeInfo.label}
                              </Badge>
                            </div>
                            
                            {marker.deskripsi && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                                {marker.deskripsi}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {parseFloat(marker.position_yaw).toFixed(1)}°, {parseFloat(marker.position_pitch).toFixed(1)}°
                              </span>
                              
                              <div className="flex gap-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditForm(marker);
                                  }}
                                >
                                  <Edit size={12} />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteMarker(marker.id);
                                  }}
                                >
                                  <Trash2 size={12} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium mb-1">Belum ada marker</p>
                  <p className="text-xs">Klik pada panorama untuk menambah marker</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Marker Form Modal - Hidden during positioning */}
      <Dialog 
        open={showMarkerForm && !isPositioning} 
        onOpenChange={(open) => {
          console.log('Dialog onOpenChange called with:', open);
          if (!open) {
            closeForm();
          }
        }}
      >
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin size={20} />
              {editingMarker ? 'Edit Marker' : 'Tambah Marker'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Marker Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tipe Marker</Label>
                <div className="grid grid-cols-2 gap-3">
                  {markerTypes.map((type) => {
                    const IconComponent = type.icon;
                    const isSelected = formData.type === type.value;
                    
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: type.value as 'info' | 'navigation' }))}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500' 
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: type.color }}
                          >
                            <IconComponent size={16} className="text-white" />
                          </div>
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-200">{type.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

            {/* Position Info */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Posisi Marker</Label>
              
              {pendingPosition ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/30 dark:border-blue-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                        Koordinat: {pendingPosition.yaw.toFixed(2)}°, {pendingPosition.pitch.toFixed(2)}°
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                        Yaw (horizontal) • Pitch (vertical)
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <MapPin size={16} className="text-white" />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={isPositioning ? "default" : "outline"}
                      size="sm"
                      onClick={isPositioning ? () => setIsPositioning(false) : startPositioning}
                      className={`gap-2 flex-1 ${isPositioning ? 'bg-blue-600 hover:bg-blue-700 text-white animate-pulse' : ''}`}
                    >
                      <MapPin size={14} />
                      {isPositioning ? 'Klik di Panorama untuk Posisi Baru' : 'Ubah Posisi'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPendingPosition(null);
                        if (viewer && tempMarker) {
                          const markersPlugin = viewer.getPlugin('MarkersPlugin');
                          try {
                            markersPlugin.removeMarker(tempMarker);
                          } catch (e) {}
                        }
                        setTempMarker(null);
                      }}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/30 dark:border-amber-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                        Belum ada posisi marker
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                        Klik tombol atau klik langsung di panorama
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                      <MapPin size={16} className="text-white" />
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    onClick={isPositioning ? () => setIsPositioning(false) : startPositioning}
                    className={`gap-2 w-full ${isPositioning ? 'bg-blue-600 hover:bg-blue-700 animate-pulse' : ''}`}
                    variant={isPositioning ? "default" : "default"}
                  >
                    <MapPin size={14} />
                    {isPositioning ? 'Klik di Panorama untuk Memilih Posisi' : 'Pilih Posisi di Panorama'}
                  </Button>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="judul">Judul Marker *</Label>
                  <Input
                    id="judul"
                    value={formData.judul}
                    onChange={(e) => setFormData(prev => ({ ...prev, judul: e.target.value }))}
                    placeholder="Masukkan judul marker"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="deskripsi">Deskripsi</Label>
                  <Textarea
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                    placeholder="Masukkan deskripsi marker (opsional)"
                    rows={3}
                  />
                </div>
              </div>

            {/* Navigation Target - only for navigation type */}
            {formData.type === 'navigation' && (
              <div>
                <Label htmlFor="navigation_target">Target Navigasi</Label>
                <Select 
                  value={formData.navigation_target} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, navigation_target: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih ruangan tujuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {ruangan_list?.map((r: any) => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.nama_ruangan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Media Upload - for info type only */}
            {formData.type !== 'navigation' && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">Media Marker (Opsional)</Label>
                
                {/* Visual Media Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Media Visual</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="image"
                        checked={formData.media_type === 'image'}
                        onChange={(e) => setFormData(prev => ({ ...prev, media_type: e.target.value as 'image' | 'video' }))}
                      />
                      Gambar
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="video"
                        checked={formData.media_type === 'video'}
                        onChange={(e) => setFormData(prev => ({ ...prev, media_type: e.target.value as 'image' | 'video' }))}
                      />
                      Video
                    </label>
                  </div>
                    
                  <input
                    type="file"
                    accept={formData.media_type === 'image' ? 'image/*' : 'video/*'}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFormData(prev => ({ ...prev, media_file: file }));
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                    
                  {formData.media_type === 'video' ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Format: MP4, WebM, AVI (Max: 10MB)
                      </p>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/30 dark:border-green-900/50">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0 mt-0.5"></div>
                          <div>
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">Video Greenscreen Seamless:</p>
                            <ul className="text-xs text-green-700 dark:text-green-300 mt-1 space-y-1">
                              <li>• Video akan ter-blend langsung dengan panorama (tanpa kotak)</li>
                              <li>• Gunakan background hijau solid (#00FF00) untuk hasil optimal</li>
                              <li>• Pencahayaan merata pada background hijau</li>
                              <li>• Bentuk circular dengan gradual fade-out ke panorama</li>
                              <li>• Format MP4 direkomendasikan</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Format: JPG, PNG, GIF, WebP
                    </p>
                  )}
                </div>

                {/* Media Size Controls */}
                {(formData.media_file || editingMarker?.media_url) && (
                  <div className="space-y-3 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/30 dark:border-blue-900/50">
                    <Label className="text-sm font-medium text-blue-800">Ukuran Media (pixels)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-blue-700">Lebar</Label>
                        <Input
                          type="number"
                          min="20"
                          value={formData.media_width}
                          onChange={(e) => setFormData(prev => ({ ...prev, media_width: parseInt(e.target.value) || 100 }))}
                          className="text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-blue-700">Tinggi</Label>
                        <Input
                          type="number"
                          min="20"
                          value={formData.media_height}
                          onChange={(e) => setFormData(prev => ({ ...prev, media_height: parseInt(e.target.value) || 100 }))}
                          className="text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, media_width: 50, media_height: 50 }))}
                        className="text-xs"
                      >
                        Kecil (50px)
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, media_width: 100, media_height: 100 }))}
                        className="text-xs"
                      >
                        Sedang (100px)
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, media_width: 150, media_height: 150 }))}
                        className="text-xs"
                      >
                        Besar (150px)
                      </Button>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-300">Preview ukuran akan terlihat setelah marker dibuat/diupdate</p>
                  </div>
                )}

                {/* Audio Narration Section */}
                <div className="space-y-3 border-t pt-4 dark:border-gray-800">
                  <Label className="text-sm font-medium">Audio Narasi (Opsional)</Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Upload file audio untuk narasi penjelasan marker informasi</p>
                  
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFormData(prev => ({ ...prev, audio_file: file }));
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Format: MP3, WAV, OGG (Max: 5MB)
                  </p>
                  
                  {/* Audio preview */}
                  {formData.audio_file && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg dark:bg-purple-950/30 dark:border-purple-900/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-purple-800">Preview Audio Narasi:</p>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, audio_file: null }))}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs"
                        >
                          Hapus
                        </button>
                      </div>
                      <audio 
                        src={URL.createObjectURL(formData.audio_file)} 
                        className="w-full"
                        controls
                      />
                      <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                        🎵 Audio narasi siap untuk marker informasi
                      </p>
                    </div>
                  )}
                </div>

                  {/* New media preview */}
                  {formData.media_file && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/30 dark:border-blue-900/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-blue-800">Preview Media Baru:</p>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, media_file: null }))}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs"
                        >
                          Hapus
                        </button>
                      </div>
                    {formData.media_type === 'image' && formData.media_file.type.startsWith('image/') ? (
                      <img 
                        src={URL.createObjectURL(formData.media_file)} 
                        alt="Preview" 
                        className="max-w-full h-32 object-cover rounded"
                      />
                    ) : formData.media_type === 'video' && formData.media_file.type.startsWith('video/') ? (
                      <div className="space-y-2">
                        <video 
                          src={URL.createObjectURL(formData.media_file)} 
                          className="max-w-full h-32 rounded"
                          controls
                          muted
                        />
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                          ✓ Video siap dengan chroma key (greenscreen) menggunakan MarkersPlugin
                        </p>
                      </div>
                    ) : formData.media_file.type.startsWith('audio/') ? (
                      <audio 
                        src={URL.createObjectURL(formData.media_file)} 
                        className="w-full"
                        controls
                      />
                    ) : null}
                  </div>
                )}

                {/* Current media preview for editing */}
                {editingMarker?.media_url && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 border rounded-lg dark:border-gray-700">
                    <p className="text-sm text-gray-700 mb-2">Media visual saat ini:</p>
                    {editingMarker.media_type === 'image' ? (
                      <img 
                        src={editingMarker.media_url} 
                        alt="Current media" 
                        className="max-w-full h-32 object-cover rounded"
                      />
                    ) : editingMarker.media_type === 'video' ? (
                      <video 
                        src={editingMarker.media_url} 
                        className="max-w-full h-32 rounded"
                        controls
                      />
                    ) : (
                      <audio 
                        src={editingMarker.media_url} 
                        className="w-full"
                        controls
                      />
                    )}
                    <p className="text-xs text-gray-500 mt-1">Upload file baru untuk mengganti</p>
                  </div>
                )}

                {/* Current audio preview for editing */}
                {editingMarker?.audio_url && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg dark:bg-purple-950/30 dark:border-purple-900/50">
                    <p className="text-sm text-purple-700 mb-2">Audio narasi saat ini:</p>
                    <audio 
                      src={editingMarker.audio_url} 
                      className="w-full"
                      controls
                    />
                    <p className="text-xs text-purple-600 mt-1">Upload file audio baru untuk mengganti narasi</p>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeForm}
                  className="flex-1"
                  disabled={processing}
                >
                  <X size={16} className="mr-2" />
                  Batal
                </Button>
                
                {editingMarker && (
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={() => deleteMarker(editingMarker.id)}
                    className="flex-1"
                    disabled={processing}
                  >
                    <Trash2 size={16} className="mr-2" />
                    {processing ? 'Menghapus...' : 'Hapus Marker'}
                  </Button>
                )}
                
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={processing || !formData.judul || !pendingPosition}
                >
                  <Save size={16} className="mr-2" />
                  {processing ? 'Menyimpan...' : (editingMarker ? 'Update Marker' : 'Simpan Marker')}
                </Button>
              </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}