USE clinic_db;

CREATE TABLE IF NOT EXISTS referrals (
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
    INDEX idx_referrals_patient (patient_id),
    INDEX idx_referrals_date (referral_date),
    CONSTRAINT referrals_patient_fk
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT referrals_referred_by_fk
        FOREIGN KEY (referred_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT referrals_from_department_fk
        FOREIGN KEY (from_department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    CONSTRAINT referrals_to_department_fk
        FOREIGN KEY (to_department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    CONSTRAINT referrals_from_doctor_fk
        FOREIGN KEY (from_doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    CONSTRAINT referrals_to_doctor_fk
        FOREIGN KEY (to_doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT
);
