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
      <DialogContent className="max-w-2xl w-[95vw] sm:w-[90vw] md:w-[720px] max-h-[85vh] p-0 z-[80] dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700">
        <DialogHeader className="p-4 sm:p-6 pb-2 sticky top-0 bg-white dark:bg-gray-900 z-10" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}>
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            Daftar Panorama
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-4 px-4 sm:px-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          {allRuangan.map((ruangan: any, index: number) => (
            <div
              key={ruangan.id}
              className={`p-5 sm:p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                ruangan.id === activeRuangan?.id
                  ? 'bg-blue-50 border-blue-300 shadow-md ring-2 ring-blue-200 dark:bg-blue-950/30 dark:border-blue-600/60 dark:ring-blue-700/40'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleRoomClick(ruangan)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        ruangan.id === activeRuangan?.id ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-500'
                      }`}></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium truncate text-base ${
                        ruangan.id === activeRuangan?.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-100'
                      }`}>
                        {ruangan.nama_ruangan}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        {ruangan.is_main && (
                          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full font-medium">
                            Ruangan Utama
                          </span>
                        )}
                        {ruangan.markers && ruangan.markers.length > 0 && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                            {ruangan.markers.length} marker interaktif
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {ruangan.id === activeRuangan?.id && (
                    <div className="mt-2 text-xs text-blue-600 dark:text-blue-300 font-medium">
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
        
        <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700 px-4 sm:px-6 pb-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}