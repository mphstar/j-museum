import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Info, X, Map, Navigation, Building2 } from 'lucide-react';
import RoomListDialog from './RoomListDialog';

// Dynamic import for Leaflet to avoid SSR issues
// NOTE: path casing must match actual filesystem path to avoid TS casing conflicts
const LocationMapDialog = React.lazy(() => import('../pages/frontend/LocationMapDialog'));

interface MuseumInfoSidebarProps {
  museum: any;
  allRuangan: any[];
  activeRuangan: any;
  onRoomChange: (ruanganId: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function MuseumInfoSidebar({ 
  museum, 
  allRuangan, 
  activeRuangan, 
  onRoomChange, 
  isOpen, 
  onClose 
}: MuseumInfoSidebarProps) {
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [showRoomList, setShowRoomList] = useState(false);
  const [showMuseumInfo, setShowMuseumInfo] = useState(false);

  const hasCoordinates = museum.latitude && museum.longitude;

  const menuItems = [
    {
      icon: Info,
      label: 'Informasi Museum',
      description: 'Detail dan deskripsi museum',
      onClick: () => setShowMuseumInfo(true),
      available: true
    },
    {
      icon: Navigation,
      label: 'Daftar Panorama',
      description: `${allRuangan.length} ruangan tersedia`,
      onClick: () => setShowRoomList(true),
      available: true
    },
    {
      icon: MapPin,
      label: 'Peta Lokasi',
      description: 'Lihat lokasi museum di peta',
      onClick: () => setShowLocationMap(true),
      available: hasCoordinates
    }
  ];

  return (
    <>
      {/* Compact Menu Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 z-[120] ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Menu Museum</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-3">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                onClick={item.onClick}
                disabled={!item.available}
                className={`w-full p-4 rounded-lg border text-left transition-all duration-200 ${
                  item.available
                    ? 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md cursor-pointer'
                    : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    item.available ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${
                      item.available ? 'text-gray-800' : 'text-gray-500'
                    }`}>
                      {item.label}
                    </p>
                    <p className={`text-xs mt-1 ${
                      item.available ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t">
          <div className="text-center">
            <p className="text-xs text-gray-600">
              Ruangan Aktif:
            </p>
            <p className="text-sm font-medium text-gray-800 truncate">
              {activeRuangan?.nama_ruangan}
            </p>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-[55]"
          onClick={onClose}
        />
      )}

      {/* Museum Info Dialog */}
      <Dialog open={showMuseumInfo} onOpenChange={setShowMuseumInfo}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[80vh] overflow-y-auto z-[80]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Informasi Museum
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">{museum.title}</h3>
              {museum.subtitle && (
                <p className="text-sm text-gray-600 mt-1">{museum.subtitle}</p>
              )}
            </div>
            
            {museum.content && (
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-2">Deskripsi:</p>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: museum.content }}
                />
              </div>
            )}

            {hasCoordinates && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span className="font-medium text-gray-800">Koordinat Lokasi</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Latitude: {museum.latitude}</p>
                  <p>Longitude: {museum.longitude}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowMuseumInfo(false)}>
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Room List Dialog */}
      <RoomListDialog
        isOpen={showRoomList}
        onClose={() => setShowRoomList(false)}
        allRuangan={allRuangan}
        activeRuangan={activeRuangan}
        onRoomChange={onRoomChange}
      />

      {/* Location Map Dialog */}
      {showLocationMap && hasCoordinates && (
        <React.Suspense fallback={
          <Dialog open={showLocationMap} onOpenChange={setShowLocationMap}>
            <DialogContent className="max-w-4xl w-[95vw] h-[80vh] z-[80]">
              <DialogHeader>
                <DialogTitle>Memuat Peta...</DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            </DialogContent>
          </Dialog>
        }>
          <LocationMapDialog
            isOpen={showLocationMap}
            onClose={() => setShowLocationMap(false)}
            latitude={parseFloat(museum.latitude)}
            longitude={parseFloat(museum.longitude)}
            museumName={museum.title}
          />
        </React.Suspense>
      )}
    </>
  );
}