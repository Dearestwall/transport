-- ============================================================
-- APPLY EDIT REQUEST (called by superadmin approval)
-- ============================================================
CREATE OR REPLACE FUNCTION apply_edit_request(
  p_table TEXT,
  p_record_id UUID,
  p_changes JSONB
) RETURNS VOID AS $$
DECLARE
  v_set_clause TEXT := '';
  v_key TEXT;
  v_val JSONB;
BEGIN
  FOR v_key, v_val IN SELECT * FROM jsonb_each(p_changes)
  LOOP
    IF v_set_clause != '' THEN v_set_clause := v_set_clause || ', '; END IF;
    v_set_clause := v_set_clause || format('%I = %L', v_key, v_val #>> '{}');
  END LOOP;
  IF v_set_clause = '' THEN RETURN; END IF;
  EXECUTE format(
    'UPDATE %I SET %s, updated_at = now(), record_status = ''draft'' WHERE id = %L',
    p_table, v_set_clause, p_record_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- AUTO SEQUENCE GENERATORS
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS client_code_seq START 1001;
CREATE SEQUENCE IF NOT EXISTS driver_code_seq START 2001;
CREATE SEQUENCE IF NOT EXISTS trip_number_seq START 5001;

CREATE OR REPLACE FUNCTION generate_client_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_code IS NULL OR NEW.client_code = '' THEN
    NEW.client_code := 'CLT-' || LPAD(nextval('client_code_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_driver_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.driver_code IS NULL OR NEW.driver_code = '' THEN
    NEW.driver_code := 'DRV-' || LPAD(nextval('driver_code_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_trip_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.trip_number IS NULL OR NEW.trip_number = '' THEN
    NEW.trip_number := 'TRP-' || TO_CHAR(now(), 'YYYYMM') || '-' ||
      LPAD(nextval('trip_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_client_code BEFORE INSERT ON clients
  FOR EACH ROW EXECUTE FUNCTION generate_client_code();
CREATE TRIGGER trg_driver_code BEFORE INSERT ON drivers
  FOR EACH ROW EXECUTE FUNCTION generate_driver_code();
CREATE TRIGGER trg_trip_number BEFORE INSERT ON trips
  FOR EACH ROW EXECUTE FUNCTION generate_trip_number();

-- ============================================================
-- DOCUMENT EXPIRY NOTIFICATION FUNCTION (called by cron)
-- ============================================================
CREATE OR REPLACE FUNCTION notify_expiring_documents()
RETURNS VOID AS $$
DECLARE
  v_doc RECORD;
BEGIN
  FOR v_doc IN
    SELECT d.*, p.id as admin_id
    FROM documents d
    CROSS JOIN profiles p
    WHERE d.expiry_date IS NOT NULL
      AND d.expiry_date - CURRENT_DATE BETWEEN 0 AND 30
      AND NOT d.is_deleted
      AND p.role IN ('superadmin','admin','operations_manager')
  LOOP
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      v_doc.admin_id, 'doc_expiring',
      'Document Expiring Soon',
      format('%s expires on %s (%s days remaining)',
        v_doc.title, v_doc.expiry_date,
        (v_doc.expiry_date - CURRENT_DATE)::TEXT),
      jsonb_build_object('document_id', v_doc.id, 'entity_type', v_doc.entity_type)
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DASHBOARD ANALYTICS FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_trips', (SELECT COUNT(*) FROM trips WHERE NOT is_deleted),
    'active_trips', (SELECT COUNT(*) FROM trips WHERE status = 'in_transit' AND NOT is_deleted),
    'total_clients', (SELECT COUNT(*) FROM clients WHERE NOT is_deleted),
    'active_drivers', (SELECT COUNT(*) FROM drivers WHERE status = 'active' AND NOT is_deleted),
    'active_trucks', (SELECT COUNT(*) FROM trucks WHERE status = 'active' AND NOT is_deleted),
    'total_freight_this_month', (
      SELECT COALESCE(SUM(freight_amount), 0) FROM trips
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', now())
      AND status = 'delivered' AND NOT is_deleted
    ),
    'invoices_pending', (SELECT COUNT(*) FROM invoices WHERE status IN ('sent','overdue') AND NOT is_deleted),
    'invoices_overdue', (SELECT COUNT(*) FROM invoices WHERE status = 'overdue' AND NOT is_deleted),
    'total_outstanding', (SELECT COALESCE(SUM(balance_amount), 0) FROM invoices WHERE status NOT IN ('paid','cancelled') AND NOT is_deleted),
    'pending_edit_requests', (SELECT COUNT(*) FROM edit_requests WHERE status = 'pending'),
    'expiring_docs_30d', (SELECT COUNT(*) FROM documents WHERE expiry_date - CURRENT_DATE BETWEEN 0 AND 30 AND NOT is_deleted)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;