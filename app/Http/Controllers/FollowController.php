<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function toggle(Request $request, string $username)
    {
        $target = User::where('username', $username)->firstOrFail();
        $me     = $request->user();

        if ($me->id === $target->id) {
            return back()->with('error', 'Tidak bisa mengikuti diri sendiri.');
        }

        if ($me->isFollowing($target)) {
            $me->following()->detach($target->id);
            $following = false;
        } else {
            $me->following()->attach($target->id);
            $following = true;
        }

        return back()->with([
            'follow_status'   => $following,
            'followers_count' => $target->followers()->count(),
        ]);
    }
}
