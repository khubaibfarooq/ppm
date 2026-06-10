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
        $stationId = auth()->user()->station_id;

        $staff = User::with('roles')
            ->where('station_id', $stationId)
            ->get();

        $roles = Role::all()->pluck('name');

        return Inertia::render('Staff/Index', [
            'staff' => $staff,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $stationId = auth()->user()->station_id;

        $validated = $request->validate([
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
        ]);

        $validated['station_id'] = $stationId;
        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);
        $user->assignRole($validated['role']);

        return redirect()->back()->with('success', 'Staff member added successfully.');
    }

    public function update(Request $request, User $staff): RedirectResponse
    {
        $validated = $request->validate([
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
        ]);

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
