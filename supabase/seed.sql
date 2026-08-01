-- ============================================================================
-- Prime Ciné — Seed data
-- supabase/seed.sql
-- Safe to re-run: uses ON CONFLICT DO NOTHING / upserts on natural keys.
-- ============================================================================

-- Genres --------------------------------------------------------------------
insert into public.genres (name, slug) values
  ('Action', 'action'),
  ('Comédie', 'comedie'),
  ('Drame', 'drame'),
  ('Romance', 'romance'),
  ('Documentaire', 'documentaire'),
  ('Télé-réalité', 'tele-realite'),
  ('Thriller', 'thriller'),
  ('Famille', 'famille')
on conflict (name) do nothing;

-- Subscription plans ----------------------------------------------------------
insert into public.subscription_plans (name, tier, price_xaf, billing_period, features, sort_order) values
  ('Découverte', 'free', 0, 'monthly', '["Accès limité au catalogue", "1 écran", "Qualité SD", "Publicités"]', 1),
  ('Standard', 'standard', 2500, 'monthly', '["Catalogue complet", "2 écrans simultanés", "Qualité HD", "Sans publicité"]', 2),
  ('Premium', 'premium', 4500, 'monthly', '["Catalogue complet + avant-premières", "4 écrans simultanés", "Qualité 4K", "Téléchargement hors-ligne", "Sans publicité"]', 3)
on conflict do nothing;

-- Titles ----------------------------------------------------------------------
-- Zéro Couple (flagship Original)
insert into public.titles (
  slug, title, original_title, type, is_original, synopsis, short_synopsis,
  poster_url, backdrop_url, age_rating, duration_label, release_year, release_date,
  director, language, country
) values (
  'zero-couple', 'Zéro Couple', 'The Saint Family', 'reality', true,
  'Dans les bureaux tape-à-l''œil de Saint Media, Franklin Saint dirige son empire de contenu d''une main de fer, avec une règle non négociable : aucune relation amoureuse entre membres de l''équipe.',
  'Un empire du contenu. Une règle absolue : zéro couple. Une famille qui n''en peut plus.',
  'https://images.unsplash.com/photo-1489599162946-4dc4f1a2c0b7?w=600&h=900&fit=crop',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&h=1080&fit=crop',
  '13+', '4 épisodes', 2026, '2026-03-14', 'Aïcha Ngono', 'Français', 'Cameroun'
)
on conflict (slug) do nothing;

insert into public.titles (slug, title, type, is_original, synopsis, short_synopsis, poster_url, backdrop_url, age_rating, duration_label, release_year, release_date, director)
values
  ('les-heritiers-de-douala', 'Les Héritiers de Douala', 'series', true,
   'Une famille d''armateurs se déchire pour le contrôle du port.', 'Une famille d''armateurs se déchire pour le contrôle du port.',
   'https://images.unsplash.com/photo-1517602302552-471fe67acf66?w=600&h=900&fit=crop',
   'https://images.unsplash.com/photo-1517602302552-471fe67acf66?w=1920&h=1080&fit=crop',
   '13+', '2 saisons', 2025, '2025-06-01', 'Jean-Pierre Bekolo'),
  ('le-dernier-taxi', 'Le Dernier Taxi', 'movie', false,
   'Un chauffeur de taxi à Yaoundé recueille des histoires qui vont changer sa vie.', 'Un chauffeur de taxi à Yaoundé recueille des histoires qui vont changer sa vie.',
   'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=900&fit=crop',
   'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&h=1080&fit=crop',
   'Tous publics', '1h 38min', 2024, '2024-02-10', 'Rosine Mfetgo'),
  ('sangs-meles', 'Sangs Mêlés', 'series', true,
   'Une enquêtrice de Bafoussam remonte un réseau qui touche sa propre famille.', 'Une enquêtrice de Bafoussam remonte un réseau qui touche sa propre famille.',
   'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&h=900&fit=crop',
   'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1920&h=1080&fit=crop',
   '16+', '1 saison', 2026, '2026-01-20', 'Aïcha Ngono'),
  ('amour-a-kribi', 'Amour à Kribi', 'movie', false,
   'Deux âmes que tout oppose se retrouvent sur les plages de Kribi.', 'Deux âmes que tout oppose se retrouvent sur les plages de Kribi.',
   'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=900&fit=crop',
   'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&h=1080&fit=crop',
   'Tous publics', '1h 52min', 2024, '2024-05-18', 'Serge Abessolo'),
  ('royaume-des-grassfields', 'Royaume des Grassfields', 'documentary', false,
   'Voyage au cœur des chefferies traditionnelles de l''Ouest Cameroun.', 'Voyage au cœur des chefferies traditionnelles de l''Ouest Cameroun.',
   'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=600&h=900&fit=crop',
   'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1920&h=1080&fit=crop',
   'Tous publics', '1h 12min', 2023, '2023-09-05', 'Collectif Ebeni'),
  ('la-vraie-vie-des-influenceurs', 'La Vraie Vie des Influenceurs', 'reality', true,
   'Huit créateurs de contenu camerounais, une villa, zéro filtre.', 'Huit créateurs de contenu camerounais, une villa, zéro filtre.',
   'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=900&fit=crop',
   'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1920&h=1080&fit=crop',
   '13+', '1 saison', 2026, '2026-02-02', 'Divine Mbarga')
on conflict (slug) do nothing;

-- Link genres to titles ---------------------------------------------------------
insert into public.title_genres (title_id, genre_id)
select t.id, g.id from public.titles t, public.genres g
where (t.slug, g.slug) in (
  ('zero-couple', 'comedie'), ('zero-couple', 'drame'), ('zero-couple', 'tele-realite'),
  ('les-heritiers-de-douala', 'drame'), ('les-heritiers-de-douala', 'thriller'),
  ('le-dernier-taxi', 'comedie'), ('le-dernier-taxi', 'drame'),
  ('sangs-meles', 'thriller'), ('sangs-meles', 'drame'),
  ('amour-a-kribi', 'romance'),
  ('royaume-des-grassfields', 'documentaire'),
  ('la-vraie-vie-des-influenceurs', 'tele-realite'), ('la-vraie-vie-des-influenceurs', 'comedie')
)
on conflict do nothing;

-- Cast for Zéro Couple ------------------------------------------------------
insert into public.cast_members (title_id, name, role_name, photo_url, sort_order)
select t.id, c.name, c.role_name, c.photo_url, c.sort_order
from public.titles t,
  (values
    ('Franklin Saint', 'Le fondateur', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop', 1),
    ('Divine Mbarga', 'Directrice de création', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop', 2),
    ('Junior Eto''o', 'Monteur vidéo', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop', 3),
    ('Priscille Owona', 'Community manager', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop', 4)
  ) as c(name, role_name, photo_url, sort_order)
where t.slug = 'zero-couple';

-- Episodes for Zéro Couple ----------------------------------------------------
insert into public.episodes (title_id, season_number, episode_number, title, synopsis, duration_minutes, thumbnail_url, release_date)
select t.id, 1, e.episode_number, e.title, e.synopsis, e.duration_minutes, e.thumbnail_url, e.release_date::date
from public.titles t,
  (values
    (1, 'La Règle d''Or', 'Franklin annonce la règle qui va bouleverser l''équipe.', 38, 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=450&fit=crop', '2026-03-14'),
    (2, 'Confessionnal Interdit', 'Divine tente de cacher un secret pendant que Junior improvise une excuse.', 41, 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800&h=450&fit=crop', '2026-03-21'),
    (3, 'Le Piège du Livestream', 'Un direct qui tourne mal expose plus que prévu.', 36, 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=450&fit=crop', '2026-03-28'),
    (4, 'La Chasse Est Ouverte', 'Tout le monde soupçonne tout le monde.', 44, 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=450&fit=crop', '2026-04-04')
  ) as e(episode_number, title, synopsis, duration_minutes, thumbnail_url, release_date)
where t.slug = 'zero-couple'
on conflict (title_id, season_number, episode_number) do nothing;

-- Note: profiles/comments/ratings/my_list/watch_progress are seeded per real
-- user at signup time (via the handle_new_user trigger) and through normal
-- app usage, not via this static seed file.
