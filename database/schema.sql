DROP DATABASE IF EXISTS clinic_db;
CREATE DATABASE clinic_db;
USE clinic_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('administrator', 'clinician', 'receptionist') NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100),
    description TEXT,
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    department_id INT NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    bio TEXT,
    phone VARCHAR(50),
    status ENUM('active', 'inactive', 'on-leave') DEFAULT 'active',
    joined_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE RESTRICT
);

CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    assigned_doctor_id INT,
    registered_date DATE NOT NULL,
    status ENUM('active', 'discharged', 'critical') DEFAULT 'active',
    insurance_provider VARCHAR(255),
    allergies TEXT,
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

CREATE TABLE diagnoses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT,
    icd_code VARCHAR(20),
    condition_name VARCHAR(255) NOT NULL,
    severity ENUM('mild', 'moderate', 'severe', 'critical') NOT NULL,
    status ENUM('active', 'resolved', 'monitoring') DEFAULT 'active',
    diagnosed_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT,
    created_by_user_id INT NOT NULL,
    appointment_type ENUM('general_practice', 'specialist_consultation') NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    notes TEXT,
    status ENUM('PENDING', 'ACCEPTED', 'DECLINED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_doctor_appointment (doctor_id, appointment_date, appointment_time)
);

CREATE TABLE referrals (
    referral_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    referred_by_user_id INT NOT NULL,
    from_department_id INT NOT NULL,
    to_department_id INT NOT NULL,
    from_doctor_id INT NOT NULL,
    to_doctor_id INT NOT NULL,
    referral_reason VARCHAR(255) NOT NULL,
    referral_notes TEXT,
    referral_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (from_department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (to_department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (from_doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    FOREIGN KEY (to_doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT
);

CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE doctor_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_patients_name ON patients(full_name);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_referrals_patient ON referrals(patient_id);
CREATE INDEX idx_referrals_date ON referrals(referral_date);
