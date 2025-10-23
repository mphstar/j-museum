<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Museum;
use App\Models\MuseumOverlays;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class MuseumController extends Controller
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
        if (!str_starts_with($relative, 'uploads/museum/') && !str_starts_with($relative, 'museum/')) return;
        $full = $publicPath . DIRECTORY_SEPARATOR . $relative;
        if (is_file($full)) {
            @unlink($full);
        }
    }

    public function index()
    {
        $data = Museum::latest()->get();

        return Inertia::render('museum/view', [
            'data' => $data,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'label' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:museum,slug',
            'content' => 'nullable|string',
            'background_url' => 'nullable|string|max:255', // will be set after upload
            'background_image' => 'nullable|image',
            'cta_href' => 'nullable|string|max:255',
            'cta_label' => 'nullable|string|max:255',
            'align' => 'required|in:left,right',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
            // Ensure uniqueness
            $original = $validated['slug'];
            $i = 1;
            while (Museum::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $original.'-'.$i++;
            }
        }

        // Handle background image upload if provided
        if ($request->hasFile('background_image')) {
            $file = $request->file('background_image');
            $dir = public_path('uploads/museum/backgrounds');
            if (!is_dir($dir)) mkdir($dir, 0775, true);
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His').'_'.Str::random(8).'.'.$ext;
            $file->move($dir, $filename);
            $validated['background_url'] = asset('uploads/museum/backgrounds/'.$filename);
        }

        unset($validated['background_image']);
        $item = Museum::create($validated);

        return redirect()->route('museum.edit', $item->id)->with('success', 'Museum created. Silakan lanjut menambah overlay.');
    }

    public function update(Request $request, Museum $museum)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'label' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'slug' => 'required|string|max:255|unique:museum,slug,'.$museum->id,
            'content' => 'nullable|string',
            'background_url' => 'nullable|string|max:255',
            'background_image' => 'nullable|image',
            'cta_href' => 'nullable|string|max:255',
            'cta_label' => 'nullable|string|max:255',
            'align' => 'required|in:left,right',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        if ($request->hasFile('background_image')) {
            $file = $request->file('background_image');
            $dir = public_path('uploads/museum/backgrounds');
            if (!is_dir($dir)) mkdir($dir, 0775, true);
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His').'_'.Str::random(8).'.'.$ext;
            $file->move($dir, $filename);
            $validated['background_url'] = asset('uploads/museum/backgrounds/'.$filename);
        }
        unset($validated['background_image']);

        $museum->update($validated);

        return redirect()->route('museum.index')->with('success', 'Museum updated');
    }

    public function create()
    {
        return Inertia::render('museum/create', [
            'item' => null,
        ]);
    }

    public function edit(Museum $museum)
    {
        $museum->load('overlays');
        return Inertia::render('museum/edit', [
            'item' => $museum,
            'overlays' => $museum->overlays,
        ]);
    }

    public function uploadBackground(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:2048'
        ]);

        $file = $request->file('image');
        $dir = public_path('uploads/museum/backgrounds');
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        $ext = $file->getClientOriginalExtension();
        $filename = now()->format('Ymd_His') . '_' . Str::random(8) . '.' . $ext;
        $file->move($dir, $filename);
        $publicUrl = asset('uploads/museum/backgrounds/' . $filename);
        return response()->json(['url' => $publicUrl]);
    }

    public function storeOverlay(Request $request, Museum $museum)
    {
        $data = $request->validate([
            'overlay' => 'required|image',
            'position_horizontal' => 'nullable|in:left,center,right',
            'position_vertical' => 'nullable|in:top,center,bottom',
            'object_fit' => 'nullable|in:contain,cover,fill,none,scale-down,crop'
        ]);
        $file = $request->file('overlay');
        $dir = public_path('uploads/museum/overlays');
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        $ext = $file->getClientOriginalExtension();
        $filename = now()->format('Ymd_His') . '_' . Str::random(8) . '.' . $ext;
        $file->move($dir, $filename);
        $publicUrl = asset('uploads/museum/overlays/' . $filename);
        MuseumOverlays::create([
            'museum_id' => $museum->id,
            'overlay_url' => $publicUrl,
            'position_horizontal' => $data['position_horizontal'] ?? 'center',
            'position_vertical' => $data['position_vertical'] ?? 'top',
            'object_fit' => $data['object_fit'] ?? 'contain',
        ]);
        return redirect()->route('museum.edit', $museum->id)->with('success', 'Overlay created');
    }

    public function updateOverlay(Request $request, MuseumOverlays $overlay)
    {
        $data = $request->validate([
            'position_horizontal' => 'nullable|in:left,center,right',
            'position_vertical' => 'nullable|in:top,center,bottom',
            'object_fit' => 'nullable|in:contain,cover,fill,none,scale-down,crop'
        ]);
        $overlay->update($data);
        return redirect()->route('museum.edit', $overlay->museum_id)->with('success', 'Overlay updated');
    }

    public function deleteOverlay(MuseumOverlays $overlay)
    {
        $pid = $overlay->museum_id;
        // delete file
        $this->deleteFileIfExists($overlay->overlay_url);
        $overlay->delete();
        return redirect()->route('museum.edit', $pid)->with('success', 'Overlay deleted');
    }

    public function destroy(Museum $museum)
    {
        // Delete background file
        $this->deleteFileIfExists($museum->background_url);
        // Delete overlay files
        foreach ($museum->overlays as $ov) {
            $this->deleteFileIfExists($ov->overlay_url);
        }
        // Delete related overlays (DB cascade could also handle if FK onDelete cascade)
        MuseumOverlays::where('museum_id', $museum->id)->delete();
        $museum->delete();
        return redirect()->route('museum.index')->with('success', 'Museum & files deleted');
    }

    public function deleteMultiple(Request $request)
    {
        $data = $request->validate([
            'data' => 'required|array',
            'data.*.id' => 'required|integer|exists:museum,id'
        ]);

        $ids = collect($data['data'])->pluck('id')->unique();
        $items = Museum::with('overlays')->whereIn('id', $ids)->get();
        foreach ($items as $item) {
            $this->deleteFileIfExists($item->background_url);
            foreach ($item->overlays as $ov) {
                $this->deleteFileIfExists($ov->overlay_url);
            }
            MuseumOverlays::where('museum_id', $item->id)->delete();
            $item->delete();
        }
        return redirect()->route('museum.index')->with('success', 'Selected museum deleted');
    }
}
