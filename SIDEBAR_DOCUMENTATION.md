# Museum Information Sidebar Feature

## Overview
Fitur sidebar yang telah dibuat menampilkan informasi museum dan daftar panorama dalam PanoramaViewer, serta peta lokasi museum menggunakan React Leaflet.

## Components Created

### 1. MuseumInfoSidebar.tsx
**Location**: `resources/js/components/MuseumInfoSidebar.tsx`

**Features**:
- Sidebar yang dapat dibuka/tutup dari PanoramaViewer
- Menampilkan informasi museum (title, subtitle, content)
- Menampilkan koordinat lokasi museum (latitude, longitude)
- Tombol untuk membuka peta lokasi
- Daftar semua ruangan/panorama dengan navigasi
- Responsive design untuk mobile

**Props**:
```typescript
interface MuseumInfoSidebarProps {
  museum: any;          // Data museum
  allRuangan: any[];    // Array semua ruangan
  activeRuangan: any;   // Ruangan yang sedang aktif
  onRoomChange: (ruanganId: number) => void; // Callback untuk pindah ruangan
  isOpen: boolean;      // Status sidebar terbuka/tertutup
  onClose: () => void;  // Callback untuk menutup sidebar
}
```

### 2. LocationMapDialog.tsx
**Location**: `resources/js/Pages/frontend/LocationMapDialog.tsx`

**Features**:
- Dialog yang menampilkan peta interaktif menggunakan React Leaflet
- Dynamic loading untuk performance optimization
- Marker museum di peta dengan popup informasi
- Error handling jika gagal memuat peta
- Loading state saat memuat komponen peta

**Props**:
```typescript
interface LocationMapDialogProps {
  isOpen: boolean;      // Status dialog terbuka/tertutup
  onClose: () => void;  // Callback untuk menutup dialog
  latitude: number;     // Koordinat latitude museum
  longitude: number;    // Koordinat longitude museum
  museumName: string;   // Nama museum untuk ditampilkan
}
```

## Integration with PanoramaViewer

### Changes Made:
1. **Import Components**: Added import untuk MuseumInfoSidebar
2. **State Management**: Added `showSidebar` state untuk mengontrol sidebar
3. **Header Button**: Added tombol "Info" dengan icon Menu di header
4. **Z-Index Management**: Updated z-index untuk proper layering
5. **Component Integration**: Added MuseumInfoSidebar component di akhir render

### Button Location:
Tombol "Info" berada di header sebelah kanan, dengan icon menu dan teks "Info".

## Usage Flow

1. User membuka PanoramaViewer
2. User klik tombol "Info" di header
3. Sidebar muncul dari kiri dengan:
   - Informasi museum (title, subtitle, content)
   - Koordinat lokasi (jika ada)
   - Tombol "Lihat Peta Lokasi" (jika ada koordinat)
   - Daftar semua ruangan dengan indikator ruangan aktif
4. User dapat:
   - Navigasi ke ruangan lain dengan klik item di daftar
   - Lihat peta lokasi dengan klik tombol peta
   - Tutup sidebar dengan klik X atau overlay

## Map Integration

### React Leaflet:
- Dynamic import untuk menghindari SSR issues
- CSS Leaflet dimuat otomatis
- Icon configuration untuk marker
- Responsive map container

### Map Features:
- Center di koordinat museum
- Zoom level 15 untuk detail yang baik
- Marker dengan popup informasi
- OpenStreetMap tiles
- Error handling dan loading states

## Styling

### Responsive Design:
- Sidebar width 320px (w-80) dengan max-width 90vw untuk mobile
- Z-index hierarchy: Header (70) > Sidebar (60) > Overlay (55)
- Smooth transitions untuk open/close animations
- Proper overflow handling

### Visual Elements:
- Gradient header untuk sidebar
- Color-coded room status (active vs inactive)
- Loading spinners dan error states
- Consistent button styling dengan shadcn/ui

## Database Requirements

Museum table harus memiliki kolom:
- `latitude` (decimal 10,8, nullable)
- `longitude` (decimal 11,8, nullable)

## Dependencies

Already installed:
- react-leaflet
- leaflet
- @types/leaflet

## Performance Considerations

1. **Dynamic Loading**: React Leaflet dimuat secara dinamis hanya saat dibutuhkan
2. **Lazy Loading**: LocationMapDialog menggunakan React.lazy()
3. **Memory Management**: Proper cleanup untuk map components
4. **Conditional Rendering**: Map hanya render saat dialog terbuka

## Testing

Untuk test fitur:
1. Pastikan museum memiliki data latitude/longitude
2. Buka PanoramaViewer (`/museum/{id}`)
3. Klik tombol "Info" di header
4. Verifikasi sidebar muncul dengan informasi
5. Test navigasi antar ruangan
6. Test peta lokasi (jika ada koordinat)

## Browser Compatibility

- Modern browsers yang support ES6+ modules
- CSS Grid dan Flexbox support
- WebGL untuk Photo Sphere Viewer
- Geolocation API optional

## Error Handling

1. **Map Loading Errors**: Fallback UI dengan koordinat text
2. **Missing Coordinates**: Conditional rendering, section tidak muncul
3. **Navigation Errors**: Toast notifications untuk user feedback
4. **Component Loading**: Loading states dan error boundaries