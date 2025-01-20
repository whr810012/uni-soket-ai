<template>
  <view class="map">
    <map
      v-if="forceRefresh"
      key="MPDBZ-HC2KL-J5ZPP-MZIQD-5C22S-MBFB5"
      :longitude="longitude"
      :latitude="latitude"
      id="mapId"
      ref="mapRef"
      class="map"
      :show-location="true"
      :min-scale="15"
      :scale="myScale"
    ></map>
    <image
      @click="popupShow = true"
      class="icon_shcool"
      :class="popupShow ? 'icon_shcool icon_shcool_active' : 'icon_shcool'"
      src="../../static/icons/icon_school.svg"
      mode=""
    ></image>
    <u-popup
      height="300"
      width="300"
      style="max-width: 600rpx; min-width: 600rpx"
      :show="popupShow"
      :round="10"
      mode="center"
      @close="close"
      @open="open"
    >
      <view class="search-container">
        <view class="search-title">搜索您的学校</view>
        <view class="search-box">
          <u-input 
            v-model="searchSchool" 
            @input="handleSearch"
            class="search_inp"
            placeholder="请输入学校名称"
            clearable
          ></u-input>
        </view>
      </view>

      <scroll-view scroll-y class="scroll_sh" style="height: 500rpx">
        <template v-if="filterSchoolList.length">
          <view
            class="scroll_item"
            @click="clickSchool(item)"
            v-for="item in filterSchoolList"
            :key="item.name"
          >
            <view class="text">{{ item.name }}</view>
          </view>
        </template>
        <view v-else class="no-result">
          未找到相关学校
        </view>
      </scroll-view>

      <view v-if="chooseShoole" class="selected-school">
        <view class="label">已选择的学校</view>
        <view class="value">{{ chooseShoole }}</view>
      </view>
    </u-popup>
    <u-loading-page
      loading-text="正在定位您的学校,请稍等..."
      :loading="loadingshow"
    ></u-loading-page>
    <u-tabbar
      style="position: absolute; bottom: 0; width: 750rpx; z-index: 100000"
      :value="tabbar"
      :fixed="true"
      @change="changeTabbar"
      :safeAreaInsetBottom="false"
      :placeholder="false"
    >
      <u-tabbar-item
        :text="item.text"
        :icon="item.icon"
        v-for="item in tabbarList"
        :key="item.index"
      ></u-tabbar-item>
    </u-tabbar>
  </view>
</template>
<script>
import { universityList } from "../../util/universityList";
import { space } from "../../util/utils";
export default {
  data() {
    return {
      latitude: 36.66490086882746,
      longitude: 117.08660055611418,
      popupShow: false,
      universityList,
      searchSchool: "",
      chooseShoole: "",
      chooseShooleInfo: null,
      loadingshow: false,
      tabbarList: [
        {
          text: "地图",
          icon: "map-fill",
          index: 0,
          url: "/pages/map/map",
        },
        {
          text: "Ai",
          icon: "ai",
          index: 1,
          url: "/pages/index/index",
        },
      ],
      tabbar: 0,
      forceRefresh: false,
      myScale: 18,
      searchTimeout: null,
      maxResults: 20, // 限制最大显示结果数
    };
  },
  methods: {
    open() {
      this.popupShow = true;
    },
    close() {
      this.popupShow = false;
    },
    clickSchool(row) {
      this.chooseShoole = row.name;
      this.chooseShooleInfo = row;
      this.latitude = row.location.lat;
      this.longitude = row.location.lng;
      this.forceRefresh = false;
      this.$nextTick(() => {
        this.forceRefresh = true;
      });
      uni.setStorageSync("chooseShooleInfo", this.chooseShooleInfo);
    },
    changeTabbar(row) {
      if (row === 0) {
        uni.switchTab({
          url: `/pages/map/map`,
        });
      } else if (row === 1) {
        uni.switchTab({
          url: `/pages/index/index`,
        });
      }
    },
    handleSearch(value) {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      this.searchTimeout = setTimeout(() => {
        this.searchSchool = value;
      }, 300);
    },
  },
  computed: {
    filterSchoolList() {
      if (!this.searchSchool) {
        return this.universityList.slice(0, this.maxResults);
      }
      
      const searchValue = this.searchSchool.toLowerCase();
      const list = this.universityList.filter((item, index) => {
        // 当搜索结果达到最大限制时停止筛选
        if (index >= this.maxResults) return false;
        
        const schoolName = item.name.toLowerCase();
        return schoolName.indexOf(searchValue) !== -1;
      });
      
      return list.slice(0, this.maxResults);
    },
  },
  async onLoad() {
    this.loadingshow = true;
    // console.log('onload',this.universityList);
    const that = this;
    this.chooseShooleInfo = uni.getStorageSync("chooseShooleInfo");
    if (this.chooseShooleInfo) {
      this.chooseShoole = this.chooseShooleInfo.name;
	  this.longitude = this.chooseShooleInfo.location.lng;
	  this.latitude = this.chooseShooleInfo.location.lat;
      this.loadingshow = false;
      this.forceRefresh = false;
      this.$nextTick(() => {
        this.forceRefresh = true;
      });
    } else {
      await uni.getLocation({
        type: "wgs84",
        success: function (res) {
          console.log("当前位置的经度：" + res.longitude);
          console.log("当前位置的纬度：" + res.latitude);
          let minLength = 100000000000000000000;
          that.filterSchoolList.map((item, index) => {
            // console.log(item);
            if (item.location) {
              const length = space(
                res.latitude,
                res.longitude,
                item.location.lat,
                item.location.lng
              );
              if (length < minLength) {
                minLength = length;
                that.chooseShooleInfo = item;
              }
            }
            if (index === that.filterSchoolList.length - 1) {
              that.loadingshow = false;
              that.popupShow = true;
              console.log("res", that.chooseShooleInfo);
              that.longitude = that.chooseShooleInfo.location.lng;
              that.latitude = that.chooseShooleInfo.location.lat;
              console.log("最终的位置", that.latitude, that.longitude);
              that.chooseShoole = that.chooseShooleInfo.name + "(ai智能推断)";
              // 刷新组件
              // this.$refs.mapRef.refresh()
              that.forceRefresh = false;
              that.$nextTick(() => {
                that.forceRefresh = true;
              });
              uni.setStorageSync("chooseShooleInfo", that.chooseShooleInfo);
            }
          });
        },
      });
    }
  },
};
</script>
<style lang="less" scoped>
.map {
  width: 100%;
  height: calc(100vh - 52px);
  position: relative;
  background-color: #b4b4b4;
  .icon_shcool {
    width: 80rpx;
    height: 80rpx;
    padding: 20rpx;
    position: absolute;
    top: 100rpx;
    right: 0px;
    background-color: aliceblue;
    border-radius: 40rpx 0 0 40rpx;
    border: 1px solid #b4b4b4;
  }
  .icon_shcool_active {
    padding-right: 50rpx;
  }

  .search-container {
    padding: 20rpx;
    background: #f5f5f5;
    border-radius: 16rpx 16rpx 0 0;

    .search-title {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 16rpx;
    }

    .search-box {
      display: flex;
      align-items: center;
      background: #fff;
      padding: 12rpx 24rpx;
      border-radius: 8rpx;
      border: 1px solid #eee;

      .search_inp {
        flex: 1;
        font-size: 28rpx;
      }
    }
  }

  .scroll_sh {
    width: 100%;
    border-top: 1px solid #eee;
    background: #fff;

    .scroll_item {
      padding: 24rpx;
      border-bottom: 1px solid #eee;
      transition: all 0.3s;

      &:active {
        background: #f5f5f5;
      }

      .text {
        font-size: 28rpx;
        color: #333;
        line-height: 1.5;
      }
    }

    .no-result {
      padding: 40rpx;
      text-align: center;
      color: #999;
      font-size: 28rpx;
    }
  }

  .selected-school {
    padding: 24rpx;
    background: #f5f7fa;
    border-radius: 0 0 16rpx 16rpx;
    
    .label {
      font-size: 26rpx;
      color: #666;
      margin-bottom: 8rpx;
    }
    
    .value {
      font-size: 30rpx;
      color: #333;
      font-weight: 500;
    }
  }
}
</style>
