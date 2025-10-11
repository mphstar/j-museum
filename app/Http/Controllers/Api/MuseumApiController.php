<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Museum;
use Illuminate\Http\Request;

class MuseumApiController extends Controller
{
    /**
     * Get all museums with relations
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $museums = Museum::with([
                'overlays' => function($query) {
                    $query->orderBy('created_at', 'asc');
                },
                'ruangan' => function($query) {
                    $query->orderBy('is_main', 'desc')
                          ->orderBy('created_at', 'asc');
                },
                'ruangan.markers' => function($query) {
                    $query->orderBy('created_at', 'asc');
                }
            ])->get();

            return response()->json([
                'success' => true,
                'message' => 'Museums retrieved successfully',
                'data' => $museums
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve museums',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single museum with relations
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $museum = Museum::with([
                'overlays' => function($query) {
                    $query->orderBy('created_at', 'asc');
                },
                'ruangan' => function($query) {
                    $query->orderBy('is_main', 'desc')
                          ->orderBy('created_at', 'asc');
                },
                'ruangan.markers' => function($query) {
                    $query->orderBy('created_at', 'asc');
                }
            ])->find($id);

            if (!$museum) {
                return response()->json([
                    'success' => false,
                    'message' => 'Museum not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Museum retrieved successfully',
                'data' => $museum
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve museum',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get museum by slug with relations
     * 
     * @param string $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function showBySlug($slug)
    {
        try {
            $museum = Museum::with([
                'overlays' => function($query) {
                    $query->orderBy('created_at', 'asc');
                },
                'ruangan' => function($query) {
                    $query->orderBy('is_main', 'desc')
                          ->orderBy('created_at', 'asc');
                },
                'ruangan.markers' => function($query) {
                    $query->orderBy('created_at', 'asc');
                }
            ])->where('slug', $slug)->first();

            if (!$museum) {
                return response()->json([
                    'success' => false,
                    'message' => 'Museum not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Museum retrieved successfully',
                'data' => $museum
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve museum',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get museums with statistics
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function withStats()
    {
        try {
            $museums = Museum::withCount(['overlays', 'ruangan'])
                ->with([
                    'overlays' => function($query) {
                        $query->orderBy('created_at', 'asc');
                    },
                    'ruangan' => function($query) {
                        $query->orderBy('is_main', 'desc')
                              ->orderBy('created_at', 'asc')
                              ->withCount('markers');
                    },
                    'ruangan.markers' => function($query) {
                        $query->orderBy('created_at', 'asc');
                    }
                ])
                ->get()
                ->map(function($museum) {
                    // Calculate total markers across all ruangan
                    $totalMarkers = $museum->ruangan->sum(function($ruangan) {
                        return $ruangan->markers->count();
                    });

                    return [
                        'id' => $museum->id,
                        'title' => $museum->title,
                        'label' => $museum->label,
                        'subtitle' => $museum->subtitle,
                        'slug' => $museum->slug,
                        'content' => $museum->content,
                        'background_url' => $museum->background_url,
                        'cta_href' => $museum->cta_href,
                        'cta_label' => $museum->cta_label,
                        'align' => $museum->align,
                        'latitude' => $museum->latitude,
                        'longitude' => $museum->longitude,
                        'created_at' => $museum->created_at,
                        'updated_at' => $museum->updated_at,
                        'statistics' => [
                            'total_overlays' => $museum->overlays_count,
                            'total_ruangan' => $museum->ruangan_count,
                            'total_markers' => $totalMarkers
                        ],
                        'overlays' => $museum->overlays,
                        'ruangan' => $museum->ruangan
                    ];
                });

            return response()->json([
                'success' => true,
                'message' => 'Museums with statistics retrieved successfully',
                'data' => $museums
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve museums',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
