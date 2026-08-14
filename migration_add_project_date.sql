-- Tambah kolom periode/tanggal project ke tabel projects.
-- Text bebas (bukan DATE type) supaya bisa isi "Jan 2025" atau "Jan – Mar 2025".
alter table projects add column if not exists date_label text default '';
