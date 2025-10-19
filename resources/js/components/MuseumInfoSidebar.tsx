import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Info, X, Map, Navigation, Building2, HelpCircle } from 'lucide-react';
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
  onOpenGuide?: () => void;
}

export default function MuseumInfoSidebar({ 
  museum, 
  allRuangan, 
  activeRuangan, 
  onRoomChange, 
  isOpen, 
  onClose,
  onOpenGuide
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
      icon: HelpCircle,
      label: 'Panduan Pengunjung',
      description: 'Tips cepat & kontrol',
      onClick: () => { onClose(); onOpenGuide && onOpenGuide(); },
      available: true
    },
    {
      icon: Navigation,
      label: 'Daftar Panorama',
      description: `${allRuangan.length} ruangan tersedia`,
      onClick: () => {
        onClose();
        setShowRoomList(true)
      },
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
      <div className={`fixed left-0 top-0 h-full w-[85vw] sm:w-64 max-w-sm bg-white dark:bg-gray-900 dark:text-gray-100 shadow-2xl transform transition-transform duration-300 z-[120] overscroll-contain touch-pan-y ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}>
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
        <div className="p-4 space-y-3 overflow-y-auto pb-24">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                onClick={item.onClick}
                disabled={!item.available}
                className={`w-full p-5 sm:p-4 rounded-lg border text-left transition-all duration-200 ${
                  item.available
                    ? 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-blue-950/40 dark:hover:border-blue-500'
                    : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed dark:bg-gray-800/60 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 sm:p-2 rounded-full ${
                    item.available 
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' 
                      : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${
                      item.available ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {item.label}
                    </p>
                    <p className={`text-xs mt-1 ${
                      item.available ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
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
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t dark:bg-gray-800 dark:border-gray-700" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Ruangan Aktif:
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
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
        <DialogContent className="max-w-2xl w-[95vw] max-h-[80vh] overflow-y-auto z-[80] dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Informasi Museum
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg">{museum.title}</h3>
              {museum.subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{museum.subtitle}</p>
              )}
            </div>
            
            {museum.content && (
              <div className="text-sm text-gray-700 dark:text-gray-200">
                <p className="font-medium mb-2">Deskripsi:</p>
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: museum.content }}
                />
              </div>
            )}

            {hasCoordinates && (
              <div className="pt-4 border-t dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span className="font-medium text-gray-800 dark:text-gray-100">Koordinat Lokasi</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p>Latitude: {museum.latitude}</p>
                  <p>Longitude: {museum.longitude}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
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
            <DialogContent className="max-w-4xl w-[95vw] h-[80vh] z-[80] dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700">
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