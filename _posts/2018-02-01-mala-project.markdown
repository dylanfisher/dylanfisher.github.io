---
layout: "project"
title: MáLà Project
date: 2018-02-01 00:00:00 -0500
categories: website rails forest
collaborator: Abby Chen & Ben Grandgenett
project_url: https://www.malaproject.nyc
read_only: true
---

Abby Chen approached me to develop a website for MáLà Project, a Michelin Bib Gourmand recommended Chinese restaurant located in New York City's East Village. The site is more than just a typical restaurant website–it manages multiple locations, menus, news items, press releases, a glossary, a photo gallery, form submissions, and more.

This is one of the first websites to use [Forest](https://github.com/dylanfisher/forest), a Ruby on Rails CMS I've been developing for the past 12 months. So far the process of developing with Forest has been great, and I've received very positive feedback about how the admin interface works.

<div class="image-with-caption">
  <img src="/assets/images/mala-project/mala-project-dashboard.png" alt="Mala Project admin dashboard" style="max-height: 1276px;">
  <div class="caption">The Forest dashboard customized for MáLà Project</div>
</div>

For this project, I wanted to use [schema.org](http://schema.org/) JSON-LD (JavaScript Object Notation for Linked Data), to define the data that represents the resturant locations and menus at each location. Here is a screenshot of the Rice/Dimsum [menu section](http://schema.org/MenuSection) as it looks on the front end of the website, and in JSON-LD below.

<div class="image-with-caption">
  <img src="/assets/images/mala-project/mala-project-menus-1.jpg" alt="Mala Project menus" style="max-height: 1276px;">
  <div class="caption">A Rice/Dimsum menu category</div>
</div>

```
{
  "@type": "MenuSection",
  "name": "RICE\/DIMSUM",
  "hasMenuItem": [
    {
      "@type": "MenuItem",
      "name": "SCALLION PANCAKE",
      "offers": {
        "@type": "Offer",
        "price": "6.00",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "MenuItem",
      "name": "GOLD &amp; SILVER MANTO",
      "offers": {
        "@type": "Offer",
        "price": "6.00",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "MenuItem",
      "name": "DUMPLING PLATE [PORK\/VEG]",
      "offers": {
        "@type": "Offer",
        "price": "6.00",
        "priceCurrency": "USD"
      }
    }
    ...
  ]
}
```

This JSON-LD data informs search engines like Google that the content of this website conforms to a particular data structure, and by defining the data of the website in this JSON-LD format, search engines can choose to display parts of the menu directly within the search results page. Structured data also has the benefit of improving SEO because the search engine knows exactly how to understand this information.

It can be helpful to consult [schema.org](http://schema.org/) to review how they define the structure of data when determining the data structure in your own app. With MáLà Project's website, I created the data structure first, and reviewed schema.org after to format the JSON. It was reassuring to see that the data structure that schema.org defined was the same as I had created on my own, which made translating the data to JSON-LD trivial.
