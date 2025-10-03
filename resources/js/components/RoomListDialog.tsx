import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';

interface RoomListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  allRuangan: any[];
  activeRuangan: any;
  onRoomChange: (ruanganId: number) => void;
}

export default function RoomListDialog({ 
  isOpen, 
  onClose, 
  allRuangan, 
  activeRuangan, 
  onRoomChange 
}: RoomListDialogProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  
  const handleRoomClick = async (ruangan: any) => {
    if (ruangan.id !== activeRuangan?.id && !isNavigating) {
      setIsNavigating(true);
      try {
        onRoomChange(ruangan.id);
        // Small delay before closing to ensure navigation starts
        setTimeout(() => {
          onClose();
          setIsNavigating(false);
        }, 200);
      } catch (error) {
        console.error('Error navigating to room:', error);
        setIsNavigating(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[80vh] overflow-y-auto z-[80]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            Daftar Panorama
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {allRuangan.map((ruangan: any, index: number) => (
            <div
              key={ruangan.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                ruangan.id === activeRuangan?.id
                  ? 'bg-blue-50 border-blue-300 shadow-md ring-2 ring-blue-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => handleRoomClick(ruangan)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        ruangan.id === activeRuangan?.id ? 'bg-blue-500' : 'bg-gray-300'
                      }`}></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium truncate text-base ${
                        ruangan.id === activeRuangan?.id ? 'text-blue-700' : 'text-gray-800'
                      }`}>
                        {ruangan.nama_ruangan}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        {ruangan.is_main && (
                          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                            Ruangan Utama
                          </span>
                        )}
                        {ruangan.markers && ruangan.markers.length > 0 && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {ruangan.markers.length} marker interaktif
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {ruangan.id === activeRuangan?.id && (
                    <div className="mt-2 text-xs text-blue-600 font-medium">
                      ← Sedang dilihat
                    </div>
                  )}
                </div>
                
                {ruangan.id !== activeRuangan?.id && (
                  <div className="ml-3 flex-shrink-0">
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoomClick(ruangan);
                      }}
                      disabled={isNavigating}
                      className="text-xs"
                    >
                      {isNavigating ? 'Loading...' : 'Lihat'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}