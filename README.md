## Build

Requires the Ruby version in `.ruby-version` (rbenv/asdf will pick it up). The `github-pages` gem
pins Jekyll and its plugins to the versions GitHub Pages builds with, so local output matches
production; see https://pages.github.com/versions/.

`bin/dev`

This installs gems if needed and runs `jekyll serve --livereload`.

## Lists

The "Lists" nav dropdown is driven by `_data/lists.yml`. Each list page (`/movies/`, `/music/`)
follows the same pattern: a `bin/<list>/generate` script writes `_data/<list>.json`, the page
renders it with the shared includes in `_includes/lists/`, styles in `_sass/partials/_lists.scss`
and the toolbar/URL/view logic in `js/lists.js`, and a per-list script (`js/movies.js`,
`js/music.js`) does the filtering and sorting. Slugs come from `bin/lib/slug.rb`.

### Movies

`/movies/` is generated from the local Radarr library. With the volume mounted:

`bin/movies/generate`

This parses each movie's `.nfo`, writes 400px WebP posters to `assets/images/movies/` and
`_data/movies.json` (fanart is hotlinked from TMDB). Commit both. The `bin` directory is
excluded from the Jekyll build, so nothing here runs on GitHub Pages.

#### Watched

To mark films as watched, export your data from Letterboxd (Settings → Import & Export) and run:

`bin/movies/watched ~/Downloads/letterboxd-export/watched.csv`

This writes `_data/movies_watched.json`, keyed by the same `<title>-<year>` slug as
`movies.json`. Watched posters show in color, unwatched in grayscale. The script prints
films whose Letterboxd and Radarr titles differ; add those to `ALIASES` in the script.

### Music

`/music/` lists artists and albums (no songs) from the music library. Rather than walking the
volume, it reads Swinsian's local SQLite library, which already holds every track's tags:

`bin/music/generate`

Artists and albums are grouped by their folders under `/Volumes/music/library/<Artist>/<Album>/`
(the stale `/Volumes/music-1` mount alias is treated as the same volume). Tags supply album
titles, years and genres. An album counts as "tagged" when every track has a Grouping (the label),
which is exactly Swinsian's "- Tagged" smart playlist. The full genre tag is kept per album; the
genre filter uses its first segment ("Electronic - Dub Techno" → "Electronic"). Writes
`_data/music.json`; commit it. Override the database path with `SWINSIAN_DB` or the first argument.
