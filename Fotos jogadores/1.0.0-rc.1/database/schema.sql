PRAGMA foreign_keys = ON;

CREATE TABLE athletes (
    slug            TEXT PRIMARY KEY,
    display_name    TEXT NOT NULL,
    position_group  TEXT NOT NULL,      -- goalkeeper | outfield
    position_code   TEXT,               -- GK | ''
    is_goalkeeper   INTEGER NOT NULL    -- 0/1
);

CREATE TABLE source_files (
    source_file             TEXT PRIMARY KEY,
    slug                    TEXT REFERENCES athletes(slug),
    sha256                  TEXT,
    width                   INTEGER,
    height                  INTEGER,
    format                  TEXT,
    bytes                   INTEGER,
    imported_from_this_file INTEGER,    -- 0/1
    exact_duplicate_sha     TEXT,
    native_card_path        TEXT
);

CREATE TABLE cards (
    slug                        TEXT PRIMARY KEY REFERENCES athletes(slug),
    canonical_name              TEXT,
    source_file                 TEXT REFERENCES source_files(source_file),
    source_sha256               TEXT,
    native_card_path            TEXT,
    width                       INTEGER,
    height                      INTEGER,
    format                      TEXT,
    identity_validated          INTEGER,
    name_text_validated         INTEGER,
    goalkeeper_gloves_validated TEXT,   -- yes | no | n/a
    card_status                 TEXT,
    review_status               TEXT,
    notes                       TEXT
);

CREATE TABLE ratings (
    slug           TEXT PRIMARY KEY REFERENCES athletes(slug),
    display_name   TEXT,
    position_group TEXT,
    overall_rating INTEGER,             -- NULL enquanto não fornecida (0..99)
    rating_status  TEXT,                -- pending_input | provided
    rating_source  TEXT,
    notes          TEXT,
    CHECK (overall_rating IS NULL OR (overall_rating >= 0 AND overall_rating <= 99))
);

CREATE TABLE verifications (
    slug                  TEXT PRIMARY KEY REFERENCES athletes(slug),
    printed_name_read     TEXT,
    name_matches_expected INTEGER,
    has_goalkeeper_gloves TEXT,
    rating_number_drawn   INTEGER,
    bottom_area_free      INTEGER,
    gfp_logo_present      INTEGER,
    identity_correction_ok TEXT,
    confidence            TEXT,
    concerns              TEXT
);

CREATE TABLE export_meta (
    key   TEXT PRIMARY KEY,
    value TEXT
);
