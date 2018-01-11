---
layout: "project"
title: Core Interaction, Parsons School of Design
date: 2017-01-01 00:00:00 -0500
categories: website jekyll teaching
collaborator: Nika Simovich
collaborator_url: http://nikasimovich.com
project_url: http://ci.nikasimovich.com
---

For our Core Interaction website, I chose to use [Jekyll](https://jekyllrb.com/), the static site generator written in Ruby, to manage the site's content. The website is hosted for free on [GitHub Pages](https://pages.github.com/), which automatically compiles and serves Jekyll websites. This setup is similar to what we teach our students, where they also host their websites for the semester on GitGub Pages.

The setup I like to use for Jekyll involves the following gems.

```ruby
# Gemfile

gem "jekyll", "3.3.1"
gem "guard"
gem "guard-jekyll-plus"
gem "guard-livereload"
```

`guard-jekyll-plus` makes developing the site locally as easy as running `bundle exec guard`, which starts a local web server and watches for file changes and automatically precompiles assets.

Jekyll is a great choice for a class website where information fits into a structured pattern and needs to be updated on a weekly basis. A typical agenda week looks like this, written in markdown:

```markdown
---
title:            Week 5
start_date:       2017-02-21 00:00:00 -0500
date_range:       2/21 – 2/24
---

### Tuesday, Studio
- Gaurika presents on Metahaven
- Students share progress on projects

### Homework

- Reading: [Function as Narrative, Weiyi Li](/assets/readings/li-function-as-narrative.pdf)
```

You can view the source code for Core Interaction at [https://github.com/dylanfisher/ci](https://github.com/dylanfisher/ci).
