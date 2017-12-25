---
layout: project
title: Midnight Commercial
date: 2017-07-01 00:00:00 -0500
categories: website wordpress
collaborator: Richard The
collaborator_url: http://richardthe.com/
project_url: http://midnightcommercial.com/
---

Richard The approached me to develop Midnight Commercial's new portfolio website. The overall design was straightforward, but there were a few interactions and layout requirements that made this website unique and technically challenging.

---

<h2>Interlace Effect</h2>

The first interaction is an "interlace" effect that happens on the home page logo, and throughout the site on any anchor tags. Richard's team already had a prototype of this effect created in JavaScript, and I helped optimize and generalize the code the be more flexible. I increased performance by replacing calls to jQuery's animate method with the equivalent animation code using [Velocity.js](http://velocityjs.org/). I then refactored the script to make applying it to multiple, different elements easier.

<div class="row">
  <div class="col-sm-12">
    <img src="/assets/images/mc_1.png" alt="Midnight Commercial">
  </div>
  <div class="col-sm-6 va-m">
    <img src="/assets/images/mc_2.png" alt="Midnight Commercial">
  </div>
  <div class="col-sm-6 va-m">
    <img src="/assets/images/mc_3.png" alt="Midnight Commercial">
  </div>
</div>

The interlace effect is achieved by splitting the DOM element into many short, repeated slices and positioning the slices vertically, offset by the height of the slice multipled by the index of that slice. A mouseover event is attached to each link that randomizes the horizontal offset of each slice.

<img src="/assets/images/mc_slice_dom.png" alt="Midnight Commercial interlace slice DOM" class="project-image" style="max-height: 619px;">

---

<h2>Collage Layout</h2>

The layout for each project on the home page consists of thee elements: a video, a block of text, and two images. These elements can be arranged and resized by the user to create unique compositions for each project. To make it easy for the user to arrange these items, I created a custom Wordpress plugin with a draggable, resizable interface. Elements snap to a 12 column grid and match the layout on the front end of the site.

<img src="/assets/images/mc_collage_arrange.jpg" alt="Midnight Commercial Collage" style="max-height: 1286px;">
