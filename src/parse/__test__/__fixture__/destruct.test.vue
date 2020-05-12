<template> </template>

<script>
export default {
  data() {
    return {
      nw: '',
      sn: '',
      th: ''
    };
  },
  created() {
    this.test();
    const { nw } = this;
  },
  methods: {
    test() {
      const { sn } = this;
      console.log(sn);
    },
  },
};
</script>

<style></style>
