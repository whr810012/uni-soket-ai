<template>
  <view class="map">
    <map
      id="mapId"
      ref="mapRef"
      class="map"
      :show-location="true"
      :min-scale="15"
    ></map>
   <u-popup height="300" :show="popupShow" :round="10" mode="center" @close="close" @open="open">
      <scroll-view scroll-y style="height:500rpx">
        <view v-for="item in universityList" :key="item.name">{{ item.name }}</view>
      </scroll-view>
    </u-popup>
  </view>
</template>
<script>
import {universityList} from '../../util/universityList'
import {space} from '../../util/utils'
export default {
  data() {
    return {
      popupShow: true,
      universityList
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
  onLoad(){
    console.log('onload',this.universityList);
    uni.getLocation({
      type: 'wgs84',
      success: function (res) {
        console.log('当前位置的经度：' + res.longitude);
        console.log('当前位置的纬度：' + res.latitude);
      }
    });
    this.universityList.map(item => {
		// console.log(item);
    
	})
  }
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
