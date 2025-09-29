<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TahunAkademik;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TahunAkademikController extends Controller
{
    public function index()
    {
        $data = TahunAkademik::latest()->get();

        return Inertia::render('tahun-akademik/view', [
            'data' => $data,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:tahun_akademik,name',
        ], []);

        DB::beginTransaction();

        try {
            TahunAkademik::create([
                'name' => $request->name,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Tahun akademik created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'error' => 'Internal Server Error',
            ]);
        }
    }

    public function deleteMultiple(Request $request)
    {
        $request->validate([
            'data' => 'required',
        ], []);

        DB::beginTransaction();

        try {
            foreach ($request->data as $res) {
                $data = TahunAkademik::find($res['id']);
                if ($data) {
                    $data->delete();
                }
            }
            DB::commit();
            return redirect()->back()->with('success', 'Tahun akademik deleted successfully');
        } catch (\Throwable $th) {
            //throw $th;
            DB::rollBack();

            throw ValidationException::class::withMessages([
                'error' => 'Internal Server Error',
            ]);
        }
    }

    public function delete(Request $request)
    {
        DB::beginTransaction();

        try {
            TahunAkademik::findOrFail($request->id)->delete();

            DB::commit();

            return redirect()->back()->with('success', 'Tahun akademik deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'error' => 'Internal Server Error',
            ]);
        }
    }

    public function update(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:kelas,id',
            'name' => 'required|string|max:255|unique:tahun_akademik,name,' . $request->id,
        ], []);

        DB::beginTransaction();

        try {
            $data = TahunAkademik::findOrFail($request->id);
            $data->name = $request->name;
            $data->save();

            DB::commit();

            return redirect()->back()->with('success', 'Tahun akademik updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'error' => 'Internal Server Error',
            ]);
        }
    }
}
