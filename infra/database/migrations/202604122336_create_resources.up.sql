CREATE TABLE IF NOT EXISTS resources(
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,

    -- Redis generated counter (for batching / sequencing)
    counter_id BIGINT UNSIGNED NOT NULL,

    user_id BIGINT UNSIGNED NULL,

    short_code VARCHAR(20) NOT NULL,
    original_url TEXT NOT NULL,

    resource_type ENUM('LINK', 'QR') NOT NULL DEFAULT 'LINK',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    activate_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,

    password_hash VARBINARY(255) NULL,
    password_salt VARBINARY(255) NULL,

    click_count BIGINT UNSIGNED NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_resources_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE KEY uniq_resources_short_code (short_code),

    -- optional but recommended (prevents duplicate Redis assignment bugs)
    UNIQUE KEY uniq_resources_counter_id (counter_id),

    INDEX idx_resources_user_id (user_id),
    INDEX idx_resources_active (is_active),
    INDEX idx_resources_activate_at (activate_at),
    INDEX idx_resources_expires_at (expires_at)
);