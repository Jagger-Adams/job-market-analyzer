CREATE TABLE import_batches (
    id              SERIAL PRIMARY KEY,
    year_month      CHAR(7) NOT NULL UNIQUE,
    imported_at     TIMESTAMP DEFAULT NOW(),
    row_count       INTEGER,
    source_file     TEXT
);

CREATE TABLE raw_postings (
    id                  SERIAL PRIMARY KEY,
    import_batch_id     INTEGER REFERENCES import_batches(id),
    snapshot_id         BIGINT,
    job_title           TEXT,
    noc21_code          CHAR(5),
    noc21_name          TEXT,
    province            TEXT,
    city                TEXT,
    first_posting_date  DATE,
    vacancy_count       SMALLINT,
    employment_type     TEXT,
    employment_term     TEXT,
    salary_per          TEXT,
    salary_min_raw      NUMERIC,
    salary_max_raw      NUMERIC,
    telework            BOOLEAN
);

CREATE INDEX idx_raw_noc       ON raw_postings(noc21_code);
CREATE INDEX idx_raw_province  ON raw_postings(province);
CREATE INDEX idx_raw_date      ON raw_postings(first_posting_date);
CREATE INDEX idx_raw_composite ON raw_postings(noc21_code, province, first_posting_date);

CREATE TABLE monthly_aggregates (
    id                  SERIAL PRIMARY KEY,
    year_month          CHAR(7) NOT NULL,
    noc21_code          CHAR(5) NOT NULL,
    noc21_name          TEXT,
    industry_category   TEXT,
    province            TEXT,
    posting_count       INTEGER,
    total_vacancies     INTEGER,
    avg_salary_annual   INTEGER,
    median_salary       INTEGER,
    pct_full_time       NUMERIC(5,2),
    pct_permanent       NUMERIC(5,2),
    pct_telework        NUMERIC(5,2),
    UNIQUE(year_month, noc21_code, province)
);

CREATE INDEX idx_agg_yearmonth ON monthly_aggregates(year_month);
CREATE INDEX idx_agg_noc       ON monthly_aggregates(noc21_code);
CREATE INDEX idx_agg_province  ON monthly_aggregates(province);
CREATE INDEX idx_agg_category  ON monthly_aggregates(industry_category);

CREATE TABLE noc_categories (
    noc21_code          CHAR(5) PRIMARY KEY,
    noc21_name          TEXT,
    industry_category   TEXT,
    subcategory         TEXT,
    created_at          TIMESTAMP DEFAULT NOW()
);