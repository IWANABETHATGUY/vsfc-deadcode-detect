<template>
  <div>
    {{c}} {{d}}
  </div>
</template>

<script>
export default {
  data() {
    return {
      a: 'test',
      b: 'test',
      c,
      d
    }
  },
  mounted() {
    const that = this;
    test(function() {
      that.a
    })
    this.func()
  },
  methods: {
    func() {
      let that = this;
      that.b;
    }
  }
}
</script>

<style>

</style>