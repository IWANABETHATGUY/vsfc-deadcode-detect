<template>
  <MediaItem
    v-for="(item, index) in recommendMovies"
    :key="index + 'b'"
    :width="48"
    :height="48"
    :to="movieLink(item.media_id)"
    @pageShow="
      reportFilm('_show', {
        film_id: item.media_id,
        title: item.media_info.name,
      })
    "
    @pageClick="
      reportFilm('comk', {
        film: item.m_id,
        title: item.m_id.name,
      })
    "
    :media="item"
  />
</template>