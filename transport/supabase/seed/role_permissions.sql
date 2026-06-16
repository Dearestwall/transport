-- ============================================================
-- SEED: ROLE PERMISSIONS
-- ============================================================
-- Resources: clients, trucks, drivers, trips, invoices,
--            salaries, documents, users, audit_logs,
--            edit_requests, notifications, import_export

-- SUPERADMIN: full access (handled in code, no RLS restriction)

-- ADMIN
INSERT INTO role_permissions (role, resource, can_create, can_read, can_update, can_delete, can_export, can_import, can_approve) VALUES
('admin','clients',    true, true, true, true,  true, true,  false),
('admin','trucks',     true, true, true, true,  true, true,  false),
('admin','drivers',    true, true, true, true,  true, true,  false),
('admin','trips',      true, true, true, true,  true, true,  false),
('admin','invoices',   true, true, true, true,  true, false, false),
('admin','salaries',   true, true, true, false, true, false, false),
('admin','documents',  true, true, true, true,  true, true,  false),
('admin','users',      true, true, true, false, false,false, false),
('admin','audit_logs', false,true, false,false, true, false, false),
('admin','edit_requests',false,true,false,false,false,false, false),
('admin','notifications',false,true,false,false,false,false,false),
('admin','import_export',true,true,true,false,  true, true,  false);

-- OPERATIONS MANAGER
INSERT INTO role_permissions (role, resource, can_create, can_read, can_update, can_delete, can_export, can_import, can_approve) VALUES
('operations_manager','clients',    true, true, true, false, true, false, false),
('operations_manager','trucks',     true, true, true, false, true, false, false),
('operations_manager','drivers',    true, true, true, false, true, false, false),
('operations_manager','trips',      true, true, true, false, true, false, false),
('operations_manager','invoices',   false,true, false,false, true, false, false),
('operations_manager','salaries',   false,true, false,false, true, false, false),
('operations_manager','documents',  true, true, true, false, true, false, false),
('operations_manager','users',      false,false,false,false, false,false, false),
('operations_manager','audit_logs', false,true, false,false, false,false, false),
('operations_manager','edit_requests',true,true,false,false,false,false,false),
('operations_manager','notifications',false,true,false,false,false,false,false),
('operations_manager','import_export',true,true,true,false,  true, true,  false);

-- ACCOUNTANT
INSERT INTO role_permissions (role, resource, can_create, can_read, can_update, can_delete, can_export, can_import, can_approve) VALUES
('accountant','clients',    false,true, false,false, true, false, false),
('accountant','trucks',     false,true, false,false, false,false, false),
('accountant','drivers',    false,true, false,false, true, false, false),
('accountant','trips',      false,true, false,false, true, false, false),
('accountant','invoices',   true, true, true, false, true, false, false),
('accountant','salaries',   true, true, true, false, true, false, false),
('accountant','documents',  false,true, false,false, true, false, false),
('accountant','users',      false,false,false,false, false,false, false),
('accountant','audit_logs', false,true, false,false, true, false, false),
('accountant','edit_requests',true,true,false,false,false,false,false),
('accountant','notifications',false,true,false,false,false,false,false),
('accountant','import_export',false,true,false,false,true, false, false);

-- DISPATCHER
INSERT INTO role_permissions (role, resource, can_create, can_read, can_update, can_delete, can_export, can_import, can_approve) VALUES
('dispatcher','clients',    false,true, false,false, false,false, false),
('dispatcher','trucks',     false,true, true, false, false,false, false),
('dispatcher','drivers',    false,true, true, false, false,false, false),
('dispatcher','trips',      true, true, true, false, false,false, false),
('dispatcher','invoices',   false,true, false,false, false,false, false),
('dispatcher','salaries',   false,false,false,false, false,false, false),
('dispatcher','documents',  true, true, false,false, false,false, false),
('dispatcher','users',      false,false,false,false, false,false, false),
('dispatcher','audit_logs', false,false,false,false, false,false, false),
('dispatcher','edit_requests',true,true,false,false,false,false,false),
('dispatcher','notifications',false,true,false,false,false,false,false),
('dispatcher','import_export',false,false,false,false,false,false,false);

-- DATA ENTRY
INSERT INTO role_permissions (role, resource, can_create, can_read, can_update, can_delete, can_export, can_import, can_approve) VALUES
('data_entry','clients',    true, true, false,false, false,false, false),
('data_entry','trucks',     true, true, false,false, false,false, false),
('data_entry','drivers',    true, true, false,false, false,false, false),
('data_entry','trips',      true, true, false,false, false,false, false),
('data_entry','invoices',   false,true, false,false, false,false, false),
('data_entry','salaries',   false,false,false,false, false,false, false),
('data_entry','documents',  true, true, false,false, false,false, false),
('data_entry','users',      false,false,false,false, false,false, false),
('data_entry','audit_logs', false,false,false,false, false,false, false),
('data_entry','edit_requests',true,true,false,false,false,false,false),
('data_entry','notifications',false,true,false,false,false,false,false),
('data_entry','import_export',false,false,false,false,false,false,false);

-- VIEWER
INSERT INTO role_permissions (role, resource, can_create, can_read, can_update, can_delete, can_export, can_import, can_approve) VALUES
('viewer','clients',    false,true,false,false,false,false,false),
('viewer','trucks',     false,true,false,false,false,false,false),
('viewer','drivers',    false,true,false,false,false,false,false),
('viewer','trips',      false,true,false,false,false,false,false),
('viewer','invoices',   false,true,false,false,false,false,false),
('viewer','salaries',   false,true,false,false,false,false,false),
('viewer','documents',  false,true,false,false,false,false,false),
('viewer','users',      false,false,false,false,false,false,false),
('viewer','audit_logs', false,true,false,false,false,false,false),
('viewer','edit_requests',false,false,false,false,false,false,false),
('viewer','notifications',false,true,false,false,false,false,false),
('viewer','import_export',false,false,false,false,false,false,false);