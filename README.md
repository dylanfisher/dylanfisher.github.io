## Build

Requires the Ruby version in `.ruby-version` (rbenv/asdf will pick it up).

`bin/dev`

This installs gems if needed and runs `jekyll serve --livereload`.

## Movies

`/movies/` is generated from the local Radarr library. With the volume mounted:

`bin/movies/generate`

This parses each movie's `.nfo`, writes 400px WebP posters to `assets/images/movies/` and
`_data/movies.json` (fanart is hotlinked from TMDB). Commit both. The `bin` directory is
excluded from the Jekyll build, so nothing here runs on GitHub Pages.

To mark films as watched, export your data from Letterboxd (Settings → Import & Export) and run:

`bin/movies/watched ~/Downloads/letterboxd-export/watched.csv`

This writes `_data/movies_watched.json`, keyed by the same `<title>-<year>` slug as
`movies.json`. Watched posters show in color, unwatched in grayscale. The script prints
films whose Letterboxd and Radarr titles differ; add those to `ALIASES` in the script.
