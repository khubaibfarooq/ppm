<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        $permissions = [
            // Stations
            'view stations', 'manage stations',
            // Staff
            'view staff', 'manage staff', 'process salary',
            // Shifts
            'view shifts', 'manage shifts', 'open shift', 'close shift', 'verify shift',
            // Readings
            'record meter readings', 'record dip readings', 'record cash collections',
            // Tanks
            'view tanks', 'manage tanks', 'record deliveries',
            // Machines
            'view machines', 'manage machines',
            // Products
            'view products', 'manage products', 'update prices',
            // Accounting
            'view accounts', 'manage accounts',
            'view journals', 'post journals', 'reverse journals',
            // Customers & Suppliers
            'manage customers', 'manage suppliers',
            'receive payments', 'make payments',
            // Reports
            'view reports', 'export reports',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        // create roles and assign existing permissions
        $roles = [
            'super_admin'      => $permissions,
            'station_manager'  => array_diff($permissions, ['manage stations']),
            'accountant'       => ['view accounts','manage accounts','view journals','post journals','reverse journals','view reports','export reports','receive payments','make payments','process salary'],
            'shift_supervisor' => ['view shifts','open shift','close shift','verify shift','record meter readings','record dip readings','record cash collections','view tanks','view reports'],
            'cashier'          => ['view shifts','open shift','record meter readings','record dip readings','record cash collections'],
            'attendant'        => ['view shifts'],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::findOrCreate($roleName);
            $role->syncPermissions($rolePermissions);
        }
    }
}
