import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import 'leaflet/dist/leaflet.css';

interface LocationMapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  museumName: string;
}

export default function LocationMapDialog({ 
  isOpen, 
  onClose, 
  latitude, 
  longitude, 
  museumName 
}: LocationMapDialogProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [leafletComponents, setLeafletComponents] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    const loadMap = async () => {
      try {
        // Dynamically import React Leaflet components
        const [
          { MapContainer, TileLayer, Marker, Popup },
          L
        ] = await Promise.all([
          import('react-leaflet'),
          import('leaflet')
        ]);

        if (!mounted) return;

        // Configure Leaflet icons
        const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
        const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
        const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl,
          iconUrl,
          shadowUrl,
        });

        setLeafletComponents({
          MapContainer,
          TileLayer,
          Marker,
          Popup
        });
        setMapLoaded(true);
      } catch (error) {
        console.error('Error loading map:', error);
        if (mounted) {
          setMapError(true);
        }
      }
    };

    loadMap();

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  const renderMap = () => {
    if (!leafletComponents) return null;

    const { MapContainer, TileLayer, Marker, Popup } = leafletComponents;

    return (
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="text-center">
              <h3 className="font-semibold">{museumName}</h3>
              <p className="text-sm text-gray-600">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[80vh] p-0 z-[80]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl">
            Lokasi {museumName}
          </DialogTitle>
          <div className="text-sm text-gray-600">
            Koordinat: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </div>
        </DialogHeader>
        
        <div className="flex-1 px-6 pb-6">
          {!mapLoaded && !mapError && (
            <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat peta...</p>
              </div>
            </div>
          )}
          
          {mapError && (
            <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">Gagal memuat peta</p>
                <p className="text-sm text-gray-500">
                  Koordinat: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              </div>
            </div>
          )}
          
          {mapLoaded && !mapError && (
            <div className="h-full" style={{ minHeight: '400px' }}>
              {renderMap()}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}