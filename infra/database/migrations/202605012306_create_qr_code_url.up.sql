CREATE TABLE IF NOT EXISTS qr_code_url (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,

    short_code VARCHAR(20) NOT NULL,

    url VARCHAR(255) NOT NULL,

    -- optional metadata
    file_size INT UNSIGNED NULL,
    mime_type VARCHAR(50) DEFAULT 'image/png',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uniq_qr_short_code UNIQUE (short_code),

    CONSTRAINT fk_qr_resource
        FOREIGN KEY (short_code)
        REFERENCES resources(short_code)
        ON DELETE CASCADE,

    INDEX idx_qr_created_at (created_at)
);