CREATE TABLE IF NOT EXISTS usage_tracking(
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,

    usage_type ENUM('LINK', 'QR') NOT NULL,

    usage_count INT UNSIGNED NOT NULL DEFAULT 0,

    period_start DATE NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_usage_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE KEY uniq_usage_user_type_period (user_id, usage_type, period_start),

    INDEX idx_usage_user_id (user_id),
    INDEX idx_usage_period (period_start)
);