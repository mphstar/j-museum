<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'style' => 'required|in:column,row',
        ]);

        $setting = Setting::first();
        if (!$setting) {
            $setting = Setting::create($validated);
        } else {
            $setting->update($validated);
        }

        return redirect()->back()->with('success', 'Settings updated successfully');
    }

    public function getSettings()
    {
        $setting = Setting::first();
        return response()->json($setting ?: ['style' => 'column']);
    }
}