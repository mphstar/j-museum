<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Museum;
use App\Models\Ruangan;
use App\Models\MarkerRuangan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class RuanganController extends Controller
{
    private function deleteFileIfExists(?string $url): void
    {
        if (!$url) return;
        $publicPath = public_path();
        $parsed = parse_url($url, PHP_URL_PATH);
        if (!$parsed) return;
        // Remove leading slash
        $relative = ltrim($parsed, '/');
        // Security: ensure it's inside allowed directories
        if (!str_starts_with($relative, 'uploads/ruangan/') && !str_starts_with($relative, 'ruangan/')) return;
        $full = $publicPath . DIRECTORY_SEPARATOR . $relative;
        if (is_file($full)) {
            @unlink($full);
        }
    }

    public function index(Museum $museum)
    {
        $data = $museum->ruangan()->latest()->get();

        return Inertia::render('ruangan/view', [
            'data' => $data,
            'museum' => $museum,
        ]);
    }

    public function store(Request $request, Museum $museum)
    {
        $validated = $request->validate([
            'nama_ruangan' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:ruangan,slug',
            'is_main' => 'nullable|boolean',
            'panorama_image' => 'nullable|image|max:4096',
            'audio_guide_file' => 'nullable|file|mimes:mp3,wav,ogg|max:10240',
        ]);

        // Convert is_main to boolean
        $validated['is_main'] = filter_var($validated['is_main'] ?? false, FILTER_VALIDATE_BOOLEAN);

        // Auto-generate slug if empty
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['nama_ruangan']);
        }
        
        // Ensure slug uniqueness
        $original = $validated['slug'];
        $i = 1;
        while (Ruangan::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $original.'-'.$i++;
        }

        // Handle panorama image upload if provided
        if ($request->hasFile('panorama_image')) {
            $file = $request->file('panorama_image');
            $dir = public_path('uploads/ruangan/panorama');
            if (!is_dir($dir)) mkdir($dir, 0775, true);
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His').'_'.Str::random(8).'.'.$ext;
            $file->move($dir, $filename);
            $validated['panorama_url'] = asset('uploads/ruangan/panorama/'.$filename);
        }

        // Handle audio guide upload if provided
        if ($request->hasFile('audio_guide_file')) {
            $file = $request->file('audio_guide_file');
            $dir = public_path('uploads/ruangan/audio');
            if (!is_dir($dir)) mkdir($dir, 0775, true);
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His').'_'.Str::random(8).'.'.$ext;
            $file->move($dir, $filename);
            $validated['audio_guide_url'] = asset('uploads/ruangan/audio/'.$filename);
        }

        // Add museum_id and remove file fields
        $validated['museum_id'] = $museum->id;
        unset($validated['panorama_image'], $validated['audio_guide_file']);
        
        $item = Ruangan::create($validated);

        return redirect()->route('museum.ruangan.index', [$museum->id])->with('success', 'Ruangan created. Silakan lanjut menambah marker.');
    }

    public function update(Request $request, Museum $museum, Ruangan $ruangan)
    {
        $validated = $request->validate([
            'nama_ruangan' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:ruangan,slug,'.$ruangan->id,
            'is_main' => 'nullable|boolean',
            'panorama_image' => 'nullable|image|max:4096',
            'audio_guide_file' => 'nullable|file|mimes:mp3,wav,ogg|max:10240',
        ]);

        // Convert is_main to boolean
        $validated['is_main'] = filter_var($validated['is_main'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if ($request->hasFile('panorama_image')) {
            $file = $request->file('panorama_image');
            $dir = public_path('uploads/ruangan/panorama');
            if (!is_dir($dir)) mkdir($dir, 0775, true);
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His').'_'.Str::random(8).'.'.$ext;
            $file->move($dir, $filename);
            $validated['panorama_url'] = asset('uploads/ruangan/panorama/'.$filename);
        }

        if ($request->hasFile('audio_guide_file')) {
            $file = $request->file('audio_guide_file');
            $dir = public_path('uploads/ruangan/audio');
            if (!is_dir($dir)) mkdir($dir, 0775, true);
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His').'_'.Str::random(8).'.'.$ext;
            $file->move($dir, $filename);
            $validated['audio_guide_url'] = asset('uploads/ruangan/audio/'.$filename);
        }

        unset($validated['panorama_image'], $validated['audio_guide_file']);

        $ruangan->update($validated);

        return redirect()->route('museum.ruangan.index', $museum->id)->with('success', 'Ruangan updated');
    }

    public function create(Museum $museum)
    {
        return Inertia::render('ruangan/create', [
            'item' => null,
            'museum' => $museum,
        ]);
    }

    public function edit(Museum $museum, Ruangan $ruangan)
    {
        $ruangan->load('markers');
        return Inertia::render('ruangan/edit', [
            'item' => $ruangan,
            'markers' => $ruangan->markers,
            'museum' => $museum,
        ]);
    }

    public function uploadPanorama(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:4096'
        ]);

        $file = $request->file('image');
        $dir = public_path('uploads/ruangan/panorama');
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        $ext = $file->getClientOriginalExtension();
        $filename = now()->format('Ymd_His') . '_' . Str::random(8) . '.' . $ext;
        $file->move($dir, $filename);
        $publicUrl = asset('uploads/ruangan/panorama/' . $filename);
        return response()->json(['url' => $publicUrl]);
    }

    public function uploadAudioGuide(Request $request)
    {
        $request->validate([
            'audio' => 'required|file|mimes:mp3,wav,ogg|max:10240'
        ]);

        $file = $request->file('audio');
        $dir = public_path('uploads/ruangan/audio');
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        $ext = $file->getClientOriginalExtension();
        $filename = now()->format('Ymd_His') . '_' . Str::random(8) . '.' . $ext;
        $file->move($dir, $filename);
        $publicUrl = asset('uploads/ruangan/audio/' . $filename);
        return response()->json(['url' => $publicUrl]);
    }

    public function manageMarkers(Museum $museum, Ruangan $ruangan)
    {
        $markers = $ruangan->markers()->latest()->get();
        
        // Get other ruangan in the same museum for navigation targets
        $ruangan_list = $museum->ruangan()
            ->where('id', '!=', $ruangan->id)
            ->select('id', 'nama_ruangan')
            ->get();

        return Inertia::render('ruangan/manage-markers', [
            'museum' => $museum,
            'ruangan' => $ruangan,
            'markers' => $markers,
            'ruangan_list' => $ruangan_list,
        ]);
    }

    public function storeMarker(Request $request, Museum $museum, Ruangan $ruangan)
    {
        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'type' => 'required|in:info,navigation',
            'position_yaw' => 'nullable|numeric',
            'position_pitch' => 'nullable|numeric',
            'navigation_target' => 'nullable|exists:ruangan,id',
            'media_file' => 'nullable|file|max:10240',
            'media_type' => 'nullable|in:image,video',
            'media_width' => 'nullable|integer|min:20|max:500',
            'media_height' => 'nullable|integer|min:20|max:500',
            'audio_file' => 'nullable|file|mimes:mp3,wav,ogg|max:5120',
        ]);

        // Handle media file upload if provided
        if ($request->hasFile('media_file')) {
            $file = $request->file('media_file');
            $dir = public_path('uploads/ruangan/markers');
            if (!is_dir($dir)) {
                mkdir($dir, 0775, true);
            }
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His') . '_' . Str::random(8) . '.' . $ext;
            $file->move($dir, $filename);
            $data['media_url'] = asset('uploads/ruangan/markers/' . $filename);
        }

        // Handle audio file upload if provided
        if ($request->hasFile('audio_file')) {
            $file = $request->file('audio_file');
            $dir = public_path('uploads/ruangan/audio');
            if (!is_dir($dir)) {
                mkdir($dir, 0775, true);
            }
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His') . '_audio_' . Str::random(8) . '.' . $ext;
            $file->move($dir, $filename);
            $data['audio_url'] = asset('uploads/ruangan/audio/' . $filename);
        }

        unset($data['media_file'], $data['audio_file']);

        MarkerRuangan::create([
            'ruangan_id' => $ruangan->id,
            ...$data
        ]);

        return redirect()->route('museum.ruangan.markers.manage', [$ruangan->museum_id, $ruangan->id])->with('success', 'Marker created');
    }

    public function updateMarker(Request $request, Museum $museum, Ruangan $ruangan, MarkerRuangan $marker)
    {
        $data = $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'type' => 'required|in:info,navigation',
            'position_yaw' => 'nullable|numeric',
            'position_pitch' => 'nullable|numeric',
            'navigation_target' => 'nullable|exists:ruangan,id',
            'media_file' => 'nullable|file|max:10240',
            'media_type' => 'nullable|in:image,video',
            'media_width' => 'nullable|integer|min:20|max:500',
            'media_height' => 'nullable|integer|min:20|max:500',
            'audio_file' => 'nullable|file|mimes:mp3,wav,ogg|max:5120',
        ]);

        // Handle media file upload if provided
        if ($request->hasFile('media_file')) {
            // Delete old file
            $this->deleteFileIfExists($marker->media_url);

            $file = $request->file('media_file');
            $dir = public_path('uploads/ruangan/markers');
            if (!is_dir($dir)) {
                mkdir($dir, 0775, true);
            }
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His') . '_' . Str::random(8) . '.' . $ext;
            $file->move($dir, $filename);
            $data['media_url'] = asset('uploads/ruangan/markers/' . $filename);
        }

        // Handle audio file upload if provided
        if ($request->hasFile('audio_file')) {
            // Delete old audio file
            $this->deleteFileIfExists($marker->audio_url);

            $file = $request->file('audio_file');
            $dir = public_path('uploads/ruangan/audio');
            if (!is_dir($dir)) {
                mkdir($dir, 0775, true);
            }
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His') . '_audio_' . Str::random(8) . '.' . $ext;
            $file->move($dir, $filename);
            $data['audio_url'] = asset('uploads/ruangan/audio/' . $filename);
        }

        unset($data['media_file'], $data['audio_file']);
        $marker->update($data);

        return redirect()->route('museum.ruangan.markers.manage', [$ruangan->museum_id, $ruangan->id])->with('success', 'Marker updated');
    }

    public function deleteMarkerMedia(Museum $museum, Ruangan $ruangan, MarkerRuangan $marker)
    {
        // Delete media file
        $this->deleteFileIfExists($marker->media_url);
        
        // Delete audio file
        $this->deleteFileIfExists($marker->audio_url);
        
        // Update marker to remove media and audio
        $marker->update([
            'media_url' => null,
            'media_type' => null,
            'audio_url' => null
        ]);
        
        return redirect()->back()->with('success', 'Media marker berhasil dihapus');
    }

    public function destroyMarker(Request $request, Museum $museum, Ruangan $ruangan, MarkerRuangan $marker)
    {
        // Delete associated media file
        $this->deleteFileIfExists($marker->media_url);
        
        // Delete associated audio file
        $this->deleteFileIfExists($marker->audio_url);
        
        // Delete the marker
        $marker->delete();
        
        return redirect()->back()->with('success', 'Marker berhasil dihapus');
    }

    public function destroy(Museum $museum, Ruangan $ruangan)
    {
        // Delete panorama file
        $this->deleteFileIfExists($ruangan->panorama_url);
        // Delete audio guide file
        $this->deleteFileIfExists($ruangan->audio_guide_url);
        // Delete marker files
        foreach ($ruangan->markers as $marker) {
            $this->deleteFileIfExists($marker->media_url);
        }
        // Delete related markers (DB cascade could also handle if FK onDelete cascade)
        MarkerRuangan::where('ruangan_id', $ruangan->id)->delete();
        $ruangan->delete();
        return redirect()->route('museum.ruangan.index', $museum->id)->with('success', 'Ruangan & files deleted');
    }

    public function deleteMultiple(Request $request, Museum $museum)
    {
        $data = $request->validate([
            'data' => 'required|array',
            'data.*.id' => 'required|integer|exists:ruangan,id'
        ]);

        $ids = collect($data['data'])->pluck('id')->unique();
        $items = $museum->ruangan()->with('markers')->whereIn('id', $ids)->get();
        foreach ($items as $item) {
            $this->deleteFileIfExists($item->panorama_url);
            $this->deleteFileIfExists($item->audio_guide_url);
            foreach ($item->markers as $marker) {
                $this->deleteFileIfExists($marker->media_url);
            }
            MarkerRuangan::where('ruangan_id', $item->id)->delete();
            $item->delete();
        }
        return redirect()->route('museum.ruangan.index', $museum->id)->with('success', 'Selected ruangan deleted');
    }
}