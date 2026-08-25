# ETL source drop-zone

Place the legacy exports here (or point env vars elsewhere), then run the migration.

```
migrate-src/
├── dump.sql        # mysqldump of the live database  (SQL_DUMP)
├── data/           # the legacy data/ folder (33 JSON stores)  (JSON_DIR)
├── uploads/        # the legacy uploads/ folder (~90 MB)  (UPLOADS_SRC)
└── files/          # the legacy files/ folder (DACP docs)  (FILES_SRC)
```

## Run

```bash
# 1) Validate first — parses + validates every record, writes nothing:
npm run migrate:dry

# 2) Full migration (needs MongoDB running + MONGO_URI set):
PUBLIC_ASSET_BASE=https://your-domain npm run migrate
```

Env overrides (if your sources live elsewhere):
`SQL_DUMP`, `JSON_DIR`, `UPLOADS_SRC`, `FILES_SRC`, `PUBLIC_ASSET_BASE`, `UPLOAD_DIR`.

The migration is **idempotent** — re-running upserts by natural keys
(username, roleKey, directorateKey, setting key, page key, regulation code)
so it won't create duplicates.
