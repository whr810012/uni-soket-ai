<template>
  <view class="map">
    <map
      id="mapId"
      ref="mapRef"
      class="map"
      :show-location="true"
      :min-scale="15"
    ></map>
   <u-popup :show="popupShow" :round="10" mode="top" @close="close" @open="open">
      <view>
        <text>人生若只如初见，何事秋风悲画扇</text>
      </view>
    </u-popup>
  </view>
</template>
<script>
export default {
  data() {
    return {
      popupShow: true,
    };
  },
  methods: {
    open() {
      this.popupShow = true;
    },
    close() {
      this.popupShow = false;
    },
  },
};
</script>
<style lang="less" scoped>
.map {
  width: 100%;
  height: 100vh;
  position: relative;
  background-color: #b4b4b4;
}
</style>
