<?php

namespace App\Http\Controllers;

use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('super_admin');

        $staffQuery = User::with(['roles', 'station']);
        if (!$isSuperAdmin) {
            $staffQuery->where('station_id', $user->station_id);
        }
        
        $staff = $staffQuery->orderBy('id', 'desc')->get();
        $roles = Role::all()->pluck('name');
        $stations = $isSuperAdmin 
            ? \App\Models\Station::where('is_active', true)->orderBy('name')->get(['id', 'name'])
            : [];

        return Inertia::render('Staff/Index', [
            'staff' => $staff,
            'roles' => $roles,
            'stations' => $stations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('super_admin');

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'employee_code' => 'required|string|max:20|unique:users',
            'phone' => 'nullable|string|max:20',
            'cnic' => 'nullable|string|max:20|unique:users',
            'address' => 'nullable|string',
            'designation' => 'nullable|string|max:100',
            'basic_salary' => 'required|numeric|min:0',
            'join_date' => 'required|date',
            'role' => 'required|string|exists:roles,name',
        ];

        if ($isSuperAdmin) {
            $rules['station_id'] = 'required|exists:stations,id';
        }

        $validated = $request->validate($rules);

        if (!$isSuperAdmin) {
            $validated['station_id'] = $user->station_id;
        }
        $validated['password'] = Hash::make($validated['password']);

        $newStaff = User::create($validated);
        $newStaff->assignRole($validated['role']);

        return redirect()->back()->with('success', 'Staff member added successfully.');
    }

    public function update(Request $request, User $staff): RedirectResponse
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('super_admin');

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $staff->id,
            'employee_code' => 'required|string|max:20|unique:users,employee_code,' . $staff->id,
            'phone' => 'nullable|string|max:20',
            'cnic' => 'nullable|string|max:20|unique:users,cnic,' . $staff->id,
            'address' => 'nullable|string',
            'designation' => 'nullable|string|max:100',
            'basic_salary' => 'required|numeric|min:0',
            'join_date' => 'required|date',
            'status' => 'required|in:active,inactive,terminated',
            'role' => 'required|string|exists:roles,name',
        ];

        if ($isSuperAdmin) {
            $rules['station_id'] = 'required|exists:stations,id';
        }

        $validated = $request->validate($rules);

        if ($request->filled('password')) {
            $request->validate(['password' => 'string|min:8']);
            $validated['password'] = Hash::make($request->input('password'));
        }

        $staff->update($validated);
        $staff->syncRoles([$validated['role']]);

        return redirect()->back()->with('success', 'Staff member updated successfully.');
    }

    public function destroy(User $staff): RedirectResponse
    {
        $staff->delete();
        return redirect()->back()->with('success', 'Staff member deleted successfully.');
    }
}
