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
      :show="popupShow"
      :round="16"
      mode="center"
      @close="close"
      @open="open"
      :closeOnClickOverlay="true"
      :overlayStyle="{
        background: 'rgba(0, 0, 0, 0.35)'
      }"
      :customStyle="{
        maxWidth: '650rpx',
        width: '85%',
        borderRadius: '24rpx',
        overflow: 'hidden'
      }"
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
          text: "校园地图",
          icon: "map-fill",
          index: 0,
          url: "/pages/map/map",
        },
        {
          text: "AI助手",
          icon: "server-fill",
          index: 1,
          url: "/pages/index/index",
        },
        {
          text: "AI旅游",
          icon: "car-fill",
          index: 2,
          url: "/pages/aimap/aimap",
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
      } else if (row === 2) {
        uni.switchTab({
          url: `/pages/aimap/aimap`,
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
      
      const searchValue = this.searchSchool.toLowerCase().trim();
      return this.universityList.filter(item => {
        const schoolName = item.name.toLowerCase();
        return schoolName.includes(searchValue);
      }).slice(0, this.maxResults);
    },
  },
  async onLoad() {
    console.log('学校列表数据：', this.universityList);
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
  background-color: #f5f5f5;

  .icon_shcool {
    width: 80rpx;
    height: 80rpx;
    padding: 20rpx;
    position: absolute;
    top: 100rpx;
    right: 0px;
    background-color: #ffffff;
    border-radius: 40rpx 0 0 40rpx;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  .icon_shcool_active {
    padding-right: 50rpx;
    background-color: #f0f7ff;
  }

  :deep(.u-popup) {
    .u-popup__content {
      max-height: 80vh;
    }
  }

  .search-container {
    padding: 30rpx;
    background: #ffffff;
    
    .search-title {
      font-size: 32rpx;
      color: #333;
      margin-bottom: 20rpx;
      font-weight: 600;
      position: relative;
      padding-left: 16rpx;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4rpx;
        height: 24rpx;
        background: #4080ff;
        border-radius: 4rpx;
      }
    }

    .search-box {
      margin: 0 4rpx;
      
      .u-input {
        background: #f8f9fa;
        border-radius: 12rpx;
        padding: 20rpx 24rpx;
        
        &__input {
          font-size: 28rpx;
          color: #333;
        }
        
        &__placeholder {
          color: #999;
        }
      }
    }
  }

  .scroll_sh {
    max-height: 60vh;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40rpx;
      background: linear-gradient(to top, #fff, transparent);
      pointer-events: none;
    }

    .scroll_item {
      margin: 0 30rpx;
      padding: 24rpx 0;
      border-bottom: 1px solid #edf2f7;
      transition: all 0.25s ease;
      
      &:active {
        background: #f0f7ff;
      }

      .text {
        font-size: 28rpx;
        color: #333;
        line-height: 1.6;
      }

      &:last-child {
        border-bottom: none;
      }
    }

    .no-result {
      padding: 80rpx 40rpx;
      text-align: center;
      color: #999;
      font-size: 28rpx;
      
      &::before {
        content: '😅';
        display: block;
        font-size: 60rpx;
        margin-bottom: 20rpx;
      }
    }
  }

  .selected-school {
    margin-top: auto;
    padding: 30rpx;
    background: #f8f9fa;
    border-top: 1px solid #edf2f7;
    
    .label {
      font-size: 26rpx;
      color: #666;
      margin-bottom: 12rpx;
      display: flex;
      align-items: center;
      
      &::before {
        content: '';
        width: 8rpx;
        height: 8rpx;
        background: #4080ff;
        border-radius: 50%;
        margin-right: 12rpx;
      }
    }
    
    .value {
      font-size: 32rpx;
      color: #333;
      font-weight: 600;
      padding-left: 20rpx;
    }
  }
}
</style>
