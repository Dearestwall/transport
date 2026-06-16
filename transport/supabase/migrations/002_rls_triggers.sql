-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE edit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Helper: get current user role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper: check permission
CREATE OR REPLACE FUNCTION has_permission(p_resource TEXT, p_action TEXT)
RETURNS BOOLEAN AS $$
DECLARE v_role TEXT; v_perm BOOLEAN;
BEGIN
  SELECT role::TEXT INTO v_role FROM profiles WHERE id = auth.uid();
  IF v_role = 'superadmin' THEN RETURN TRUE; END IF;
  EXECUTE format('SELECT can_%s FROM role_permissions WHERE role = %L AND resource = %L', p_action, v_role, p_resource)
  INTO v_perm;
  RETURN COALESCE(v_perm, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- PROFILES
CREATE POLICY "Users see own profile" ON profiles FOR SELECT USING (id = auth.uid() OR get_my_role() IN ('superadmin','admin'));
CREATE POLICY "Superadmin manages profiles" ON profiles FOR ALL USING (get_my_role() = 'superadmin');
CREATE POLICY "Own profile update" ON profiles FOR UPDATE USING (id = auth.uid());

-- CLIENTS
CREATE POLICY "Authed read clients" ON clients FOR SELECT USING (auth.uid() IS NOT NULL AND NOT is_deleted);
CREATE POLICY "Can create clients" ON clients FOR INSERT WITH CHECK (has_permission('clients','create'));
CREATE POLICY "Can update clients" ON clients FOR UPDATE USING (has_permission('clients','update'));
CREATE POLICY "Superadmin delete clients" ON clients FOR DELETE USING (get_my_role() = 'superadmin');

-- TRUCKS
CREATE POLICY "Authed read trucks" ON trucks FOR SELECT USING (auth.uid() IS NOT NULL AND NOT is_deleted);
CREATE POLICY "Can create trucks" ON trucks FOR INSERT WITH CHECK (has_permission('trucks','create'));
CREATE POLICY "Can update trucks" ON trucks FOR UPDATE USING (has_permission('trucks','update'));
CREATE POLICY "Superadmin delete trucks" ON trucks FOR DELETE USING (get_my_role() = 'superadmin');

-- DRIVERS
CREATE POLICY "Authed read drivers" ON drivers FOR SELECT USING (auth.uid() IS NOT NULL AND NOT is_deleted);
CREATE POLICY "Can create drivers" ON drivers FOR INSERT WITH CHECK (has_permission('drivers','create'));
CREATE POLICY "Can update drivers" ON drivers FOR UPDATE USING (has_permission('drivers','update'));
CREATE POLICY "Superadmin delete drivers" ON drivers FOR DELETE USING (get_my_role() = 'superadmin');

-- TRIPS
CREATE POLICY "Authed read trips" ON trips FOR SELECT USING (auth.uid() IS NOT NULL AND NOT is_deleted);
CREATE POLICY "Can create trips" ON trips FOR INSERT WITH CHECK (has_permission('trips','create'));
CREATE POLICY "Can update trips" ON trips FOR UPDATE USING (has_permission('trips','update') AND (record_status != 'locked' OR get_my_role() = 'superadmin'));
CREATE POLICY "Superadmin delete trips" ON trips FOR DELETE USING (get_my_role() = 'superadmin');

-- INVOICES
CREATE POLICY "Read invoices" ON invoices FOR SELECT USING (auth.uid() IS NOT NULL AND NOT is_deleted);
CREATE POLICY "Create invoices" ON invoices FOR INSERT WITH CHECK (has_permission('invoices','create'));
CREATE POLICY "Update invoices" ON invoices FOR UPDATE USING (has_permission('invoices','update'));
CREATE POLICY "Superadmin delete invoices" ON invoices FOR DELETE USING (get_my_role() = 'superadmin');
CREATE POLICY "Read invoice items" ON invoice_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Manage invoice items" ON invoice_items FOR ALL USING (has_permission('invoices','create'));

-- SALARY RUNS
CREATE POLICY "Read salaries" ON salary_runs FOR SELECT USING (auth.uid() IS NOT NULL AND NOT is_deleted);
CREATE POLICY "Manage salaries" ON salary_runs FOR ALL USING (get_my_role() IN ('superadmin','admin','accountant'));

-- DOCUMENTS
CREATE POLICY "Read docs" ON documents FOR SELECT USING (auth.uid() IS NOT NULL AND NOT is_deleted);
CREATE POLICY "Create docs" ON documents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Superadmin delete docs" ON documents FOR DELETE USING (get_my_role() = 'superadmin');

-- AUDIT LOGS
CREATE POLICY "Read audit logs" ON audit_logs FOR SELECT USING (get_my_role() IN ('superadmin','admin'));
CREATE POLICY "Insert audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- EDIT REQUESTS
CREATE POLICY "Read edit requests" ON edit_requests FOR SELECT USING (requested_by = auth.uid() OR get_my_role() IN ('superadmin','admin'));
CREATE POLICY "Create edit requests" ON edit_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Superadmin approve requests" ON edit_requests FOR UPDATE USING (get_my_role() = 'superadmin');

-- NOTIFICATIONS
CREATE POLICY "Own notifications" ON notifications FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins insert notifications" ON notifications FOR INSERT WITH CHECK (get_my_role() IN ('superadmin','admin'));

-- PUSH SUBSCRIPTIONS
CREATE POLICY "Own push subs" ON push_subscriptions FOR ALL USING (user_id = auth.uid());

-- ROLE PERMISSIONS
CREATE POLICY "Anyone reads perms" ON role_permissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Superadmin manages perms" ON role_permissions FOR ALL USING (get_my_role() = 'superadmin');

-- ============================================================
-- AUDIT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
DECLARE v_action audit_action; v_profile RECORD;
BEGIN
  v_action := TG_OP::audit_action;
  SELECT email, role::TEXT INTO v_profile FROM profiles WHERE id = auth.uid();
  INSERT INTO audit_logs(action, table_name, record_id, old_values, new_values, changed_fields, performed_by, user_email, user_role)
  VALUES (v_action, TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    CASE WHEN TG_OP = 'UPDATE' THEN ARRAY(SELECT key FROM jsonb_each(to_jsonb(NEW)) WHERE to_jsonb(NEW)->key IS DISTINCT FROM to_jsonb(OLD)->key) ELSE NULL END,
    auth.uid(), v_profile.email, v_profile.role);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers
DO $$ DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['clients','trucks','drivers','trips','invoices','salary_runs','edit_requests'])
  LOOP
    EXECUTE format('CREATE TRIGGER audit_%s AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn()', t, t);
  END LOOP;
END $$;

-- Auto updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DO $$ DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['profiles','clients','trucks','drivers','trips','invoices','salary_runs'])
  LOOP EXECUTE format('CREATE TRIGGER updated_at_%s BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
  END LOOP;
END $$;