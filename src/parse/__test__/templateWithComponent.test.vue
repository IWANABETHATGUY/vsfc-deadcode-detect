<template>
  <ul :class="{ all: showAllMedia === 2 }">
    <XlMediaItem
      v-for="(item, index) in recommendMovies"
      :key="index + 'b'"
      :width="48"
      :height="48"
      :to="movieLink(item.media_id)"
      @pageShow="
        reportFilm('community_film_show', {
          film_id: item.media_id,
          title: item.media_info.name,
        })
      "
      @pageClick="
        reportFilm('community_film_click', {
          film_id: item.media_id,
          title: item.media_info.name,
        })
      "
      :media="item"
    />
  </ul>
</template>