USE clinic_db;

ALTER TABLE appointments
  MODIFY status VARCHAR(20) NOT NULL DEFAULT 'PENDING';

UPDATE appointments
SET status = CASE
  WHEN LOWER(status) = 'completed' THEN 'ACCEPTED'
  WHEN LOWER(status) IN ('cancelled', 'no_show') THEN 'DECLINED'
  ELSE 'PENDING'
END;

ALTER TABLE appointments
  MODIFY status ENUM('PENDING', 'ACCEPTED', 'DECLINED') NOT NULL DEFAULT 'PENDING';

ALTER TABLE diagnoses
  DROP FOREIGN KEY diagnoses_ibfk_2;

ALTER TABLE diagnoses
  MODIFY doctor_id INT NULL;

ALTER TABLE diagnoses
  ADD CONSTRAINT diagnoses_ibfk_2
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL;
