-- 013_device_heartbeat.sql: Track real-time device heartbeat and status for tabletop kiosks
ALTER TABLE paired_devices ADD COLUMN last_heartbeat TEXT;
