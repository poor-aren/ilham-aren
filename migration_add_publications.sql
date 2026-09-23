-- Tabel Publications untuk section "Publications" di halaman About Me (dikelola dari admin).
-- Jalankan sekali di Supabase → SQL Editor → New query → Run.

create table if not exists publications (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default '',
  authors     text[] not null default '{}',   -- urut: penulis pertama, kedua, ketiga, dst.
  venue       text default '',                -- jurnal / konferensi / prosiding
  year_label  text default '',                -- teks bebas, mis. "2025"
  url         text default '',                -- link paper (PDF / DOI / halaman jurnal)
  sort        int  not null default 0,        -- urutan tampil (diatur dengan drag di admin)
  created_at  timestamptz not null default now()
);

alter table publications enable row level security;

-- Semua orang boleh membaca (situs publik), hanya admin yang login boleh ubah.
drop policy if exists "publications public read" on publications;
create policy "publications public read" on publications
  for select using (true);

drop policy if exists "publications admin write" on publications;
create policy "publications admin write" on publications
  for all to authenticated using (true) with check (true);
