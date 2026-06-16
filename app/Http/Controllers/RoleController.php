<?php

namespace App\Http\Controllers;

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    private function checkPermission()
    {
        if (!auth()->user()->hasRole('super_admin')) {
            abort(403, 'Unauthorized action. Only global administrators can manage roles and permissions.');
        }
    }

    public function index(): Response
    {
        $this->checkPermission();

        $roles = Role::with('permissions')->orderBy('name')->get();
        $permissions = Permission::orderBy('name')->get();

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $this->checkPermission();

        // Prevent modifying the super_admin role permissions directly to avoid locking out the admin
        if ($role->name === 'super_admin') {
            return redirect()->back()->with('error', 'The Super Admin role permissions cannot be edited.');
        }

        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->syncPermissions($validated['permissions']);

        return redirect()->back()->with('success', 'Role permissions synchronized successfully.');
    }
}
