<template>
  <section>
    <div class="w-100">
      <input type="color" v-model="color">
    </div>
    <div class="w-100 mt-4 d-flex justify-content-end">
      <b-button variant="primary" @click="setColor">SetColor</b-button>
    </div>
  </section>
</template>

<script>
export default {
  name: "CarDetail",
  props: {
    detail: {
      required: true,
    }
  },
  data() {
    return {
      color: null,
    };
  },
  methods: {
    setColor() {
      this.$emit('handleNewColor', this.color);
    }
  }

}
</script>

<style scoped>

</style>