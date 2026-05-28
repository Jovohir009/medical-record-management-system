USE clinic_db;

-- Departments (6)
INSERT INTO departments (name, location, phone, email, description, color) VALUES
('Cardiology', 'Building A, Floor 2', '555-0101', 'cardio@clinic.com', 'Heart and cardiovascular system', '#FF5733'),
('Neurology', 'Building A, Floor 3', '555-0102', 'neuro@clinic.com', 'Nervous system disorders', '#3357FF'),
('Dermatology', 'Building B, Floor 1', '555-0103', 'derm@clinic.com', 'Skin, hair, and nail conditions', '#FF33F5'),
('Orthopaedics', 'Building B, Floor 2', '555-0104', 'ortho@clinic.com', 'Skeletal system and muscles', '#33FF57'),
('Pediatrics', 'Building C, Floor 1', '555-0105', 'pediatrics@clinic.com', 'Medical care for infants and children', '#F5FF33'),
('General Practice', 'Building A, Floor 1', '555-0106', 'general@clinic.com', 'Primary care and general consultations', '#33FFF5');

-- Users (13)
INSERT INTO users (full_name, email, password_hash, role, status) VALUES
('Admin One', 'admin@clinic.com', '$2b$10$NYhkMHAmenBrVwTdO7/Wlul0ycPs8YhJlkmTeqXZ0QF6nVxNfAuo2', 'administrator', 'active'),
('Admin Two', 'admin2@clinic.com', '$2b$10$NYhkMHAmenBrVwTdO7/Wlul0ycPs8YhJlkmTeqXZ0QF6nVxNfAuo2', 'administrator', 'active'),
('Receptionist Mary', 'mary.r@clinic.com', '$2b$10$NYhkMHAmenBrVwTdO7/Wlul0ycPs8YhJlkmTeqXZ0QF6nVxNfAuo2', 'receptionist', 'active'),
('Receptionist John', 'john.r@clinic.com', '$2b$10$NYhkMHAmenBrVwTdO7/Wlul0ycPs8YhJlkmTeqXZ0QF6nVxNfAuo2', 'receptionist', 'active'),
('Receptionist Anna', 'anna.r@clinic.com', '$2b$10$NYhkMHAmenBrVwTdO7/Wlul0ycPs8YhJlkmTeqXZ0QF6nVxNfAuo2', 'receptionist', 'active'),
('Dr. Alice Smith', 'alice.s@clinic.com', '$2b$10$NYhkMHAmenBrVwTdO7/Wlul0ycPs8YhJlkmTeqXZ0QF6nVxNfAuo2', 'clinician', 'active'),
('Dr. Bob Jones', 'bob.j@clinic.com', '$2b$10$NYhkMHAmenBrVwTdO7/Wlul0ycPs8YhJlkmTeqXZ0QF6nVxNfAuo2', 'clinician', 'active'),
('Dr. Charlie Brown', 'charlie.b@clinic.com', '$2b$10$NYhkMHAmenBrVwTdO7/Wlul0ycPs8YhJlkmTeqXZ0QF6nVxNfAuo2', 'clinician', 'active'),
('Dr. Diana Prince', 'diana.p@clinic.com', '$2b$10$NYhkMHAmenBrVwTdO7/Wlul0ycPs8YhJlkmTeqXZ0QF6nVxNfAuo2', 'clinician', 'active'),
('Dr. Edward Teach', 'edward.t@clinic.com', '$2b$10$NYhkMHAmenBrVwTdO7/Wlul0ycPs8YhJlkmTeqXZ0QF6nVxNfAuo2', 'clinician', 'active'),
('Dr. Fiona Gallagher', 'fiona.g@clinic.com', '$2b$10$NYhkMHAmenBrVwTdO7/Wlul0ycPs8YhJlkmTeqXZ0QF6nVxNfAuo2', 'clinician', 'active'),
('Dr. George Costanza', 'george.c@clinic.com', '$2b$10$NYhkMHAmenBrVwTdO7/Wlul0ycPs8YhJlkmTeqXZ0QF6nVxNfAuo2', 'clinician', 'active'),
('Dr. Hannah Abbott', 'hannah.a@clinic.com', '$2b$10$NYhkMHAmenBrVwTdO7/Wlul0ycPs8YhJlkmTeqXZ0QF6nVxNfAuo2', 'clinician', 'active');

-- Doctors (8)
INSERT INTO doctors (user_id, department_id, specialty, license_number, bio, phone, status, joined_date) VALUES
(6, 1, 'Cardiologist', 'LIC-001', 'Experienced cardiologist.', '555-1001', 'active', '2020-01-15'),
(7, 2, 'Neurologist', 'LIC-002', 'Specialist in neurology.', '555-1002', 'active', '2019-05-20'),
(8, 3, 'Dermatologist', 'LIC-003', 'Expert in skin conditions.', '555-1003', 'active', '2021-08-10'),
(9, 4, 'Orthopedic Surgeon', 'LIC-004', 'Bone and joint specialist.', '555-1004', 'active', '2018-11-01'),
(10, 5, 'Pediatrician', 'LIC-005', 'Dedicated pediatric care.', '555-1005', 'active', '2022-03-14'),
(11, 6, 'General Practitioner', 'LIC-006', 'Family medicine doctor.', '555-1006', 'active', '2017-07-22'),
(12, 6, 'General Practitioner', 'LIC-007', 'Primary care physician.', '555-1007', 'on-leave', '2020-09-05'),
(13, 1, 'Cardiologist', 'LIC-008', 'Interventional cardiology.', '555-1008', 'active', '2023-01-10');

-- Patients (10)
INSERT INTO patients (full_name, dob, gender, email, phone, address, blood_type, assigned_doctor_id, registered_date, status, insurance_provider, allergies) VALUES
('James Holden', '1985-04-12', 'male', 'james.h@example.com', '555-2001', '123 Earth St', 'O+', 1, '2023-01-01', 'active', 'BlueCross', 'Penicillin'),
('Naomi Nagata', '1990-08-25', 'female', 'naomi.n@example.com', '555-2002', '456 Belt Ave', 'AB+', 2, '2023-02-15', 'active', 'Aetna', 'Dust'),
('Amos Burton', '1982-11-10', 'male', 'amos.b@example.com', '555-2003', '789 Baltimore Rd', 'O-', 3, '2023-03-20', 'active', 'Cigna', 'None'),
('Alex Kamal', '1978-02-18', 'male', 'alex.k@example.com', '555-2004', '101 Mars Blvd', 'A+', 4, '2023-04-10', 'active', 'UHC', 'Pollen'),
('Chrisjen Avasarala', '1955-12-05', 'female', 'chrisjen.a@example.com', '555-2005', '202 UN Plaza', 'B+', 1, '2023-05-05', 'active', 'BlueCross', 'None'),
('Roberta Draper', '1988-07-30', 'female', 'roberta.d@example.com', '555-2006', '303 Marine Corps', 'O+', 6, '2023-06-12', 'active', 'Military Health', 'None'),
('Clarissa Mao', '1992-09-15', 'female', 'clarissa.m@example.com', '555-2007', '404 Luna Way', 'A-', 7, '2023-07-08', 'discharged', 'Aetna', 'Peanuts'),
('Fred Johnson', '1965-03-22', 'male', 'fred.j@example.com', '555-2008', '505 Tycho Station', 'B-', 8, '2023-08-19', 'critical', 'Cigna', 'Latex'),
('Camina Drummer', '1989-10-01', 'female', 'camina.d@example.com', '555-2009', '606 Ceres Pkwy', 'AB-', 2, '2023-09-25', 'active', 'UHC', 'None'),
('Josephus Miller', '1970-05-14', 'male', 'josephus.m@example.com', '555-2010', '707 Eros Ln', 'O+', 6, '2023-10-30', 'discharged', 'BlueCross', 'Dust Mites');

-- Diagnoses (10)
INSERT INTO diagnoses (patient_id, doctor_id, icd_code, condition_name, severity, status, diagnosed_date, notes) VALUES
(1, 1, 'I10', 'Essential Hypertension', 'moderate', 'monitoring', '2023-01-05', 'Patient advised to reduce sodium.'),
(2, 2, 'G43.9', 'Migraine', 'severe', 'active', '2023-02-20', 'Prescribed sumatriptan.'),
(3, 3, 'L20.9', 'Atopic Dermatitis', 'mild', 'active', '2023-03-25', 'Topical corticosteroids prescribed.'),
(4, 4, 'M54.5', 'Low Back Pain', 'moderate', 'active', '2023-04-15', 'Physical therapy recommended.'),
(5, 1, 'I20.9', 'Angina Pectoris', 'critical', 'monitoring', '2023-05-10', 'Scheduled for angiogram.'),
(6, 6, 'J01.90', 'Acute Sinusitis', 'mild', 'resolved', '2023-06-15', 'Completed antibiotic course.'),
(7, 7, 'E11.9', 'Type 2 Diabetes Mellitus', 'moderate', 'monitoring', '2023-07-10', 'Dietary changes and metformin.'),
(8, 8, 'I50.9', 'Heart Failure', 'critical', 'active', '2023-08-20', 'Admitted for observation.'),
(9, 2, 'G40.909', 'Epilepsy', 'severe', 'active', '2023-09-30', 'Starting anti-epileptic drugs.'),
(10, 6, 'J45.909', 'Asthma', 'moderate', 'resolved', '2023-11-05', 'Inhaler provided.');

-- Appointments (7)
INSERT INTO appointments (patient_id, doctor_id, created_by_user_id, appointment_type, appointment_date, appointment_time, notes, status) VALUES
(1, 1, 3, 'specialist_consultation', '2024-05-20', '09:00:00', 'Follow up on hypertension.', 'PENDING'),
(2, 2, 4, 'specialist_consultation', '2024-05-21', '10:30:00', 'Migraine review.', 'PENDING'),
(3, 3, 3, 'specialist_consultation', '2024-05-22', '14:00:00', 'Skin rash check.', 'PENDING'),
(4, 4, 5, 'specialist_consultation', '2024-05-23', '11:15:00', 'Back pain assessment.', 'ACCEPTED'),
(5, 1, 4, 'specialist_consultation', '2024-05-20', '10:00:00', 'Angiogram results.', 'PENDING'),
(6, 6, 5, 'general_practice', '2024-05-24', '15:30:00', 'Annual physical.', 'PENDING'),
(8, 8, 3, 'specialist_consultation', '2024-05-20', '13:00:00', 'Heart failure review.', 'DECLINED');

-- Audit Logs (5)
INSERT INTO audit_logs (user_id, action, resource, ip_address) VALUES
(1, 'CREATE', 'User ID 6', '192.168.1.10'),
(3, 'CREATE', 'Appointment ID 1', '192.168.1.20'),
(6, 'UPDATE', 'Diagnosis ID 1', '192.168.1.30'),
(4, 'CREATE', 'Patient ID 2', '192.168.1.21'),
(2, 'LOGIN', 'System', '192.168.1.11');

-- Doctor Availability
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, is_available) VALUES
(1, 'Monday', '09:00:00', '17:00:00', TRUE),
(1, 'Tuesday', '09:00:00', '17:00:00', TRUE),
(2, 'Wednesday', '08:00:00', '16:00:00', TRUE),
(3, 'Thursday', '10:00:00', '18:00:00', TRUE),
(4, 'Friday', '07:00:00', '15:00:00', TRUE),
(5, 'Monday', '09:00:00', '17:00:00', TRUE),
(6, 'Tuesday', '08:30:00', '16:30:00', TRUE),
(8, 'Friday', '09:00:00', '17:00:00', TRUE);
