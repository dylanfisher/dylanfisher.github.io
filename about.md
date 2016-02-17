---
layout: page
title: Projects
permalink: /projects/
---

<ul>
{% for project in site.data.projects %}
  <li>
    <span>{{project.date}}</span>
    <a href="{{project.url}}">
      {{ project.title }}
    </a>
    <span>{{project.collaborator}}</span>
  </li>
{% endfor %}
</ul>
