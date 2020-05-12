<template> </template>

<script>
export default {
  props: {
    update1: {
      type: String
    },
    update2: {
      type: Number
    }
  },
  created() {
    this.test();
    const { nw } = this;
    this.$emit('update:update1')
  },
  methods: {
    test() {
      const { sn } = this;
      console.log(sn);
      this.$emit('update:update2')
    },
  },
};
</script>

<style></style>
