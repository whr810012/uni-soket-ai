<template>
	<view class="map">
		<map id="mapId" ref="mapRef" class="map" :show-location="true" :min-scale="15"></map>
		<u-popup height="300" width="300" style="max-width: 500rpx; min-width:500rpx ;" :show="popupShow" :round="10"
			mode="center" @close="close" @open="open">
			<view style="display: flex;align-items: center; margin: 20rpx 10rpx;">
				搜索您的学校：
				<u-input v-model="searchSchool" class="search_inp"></u-input>
			</view>
			<scroll-view scroll-y class="scroll_sh" style="height:500rpx">
				<view class="scroll_item" @click="clickSchool(item)" v-for="item in filterSchoolList" :key="item.name">
					<view class="text">
						{{ item.name }}
					</view>
				</view>
			</scroll-view>
			<view style="margin: 20rpx;max-width: 500rpx;">
				您最终选择的学校是：<br />
				{{chooseShoole}}
			</view>
		</u-popup>
		<u-loading-page loading-text="正在定位您的学校,请稍等..." :loading="loadingshow"></u-loading-page>
		<u-tabbar style="position: absolute;bottom: 0;width: 750rpx;z-index: 100000;" :value="tabbar" :fixed="true"
			@change="changeTabbar" :safeAreaInsetBottom="false" :placeholder="false">
			<u-tabbar-item :text="item.text" :icon="item.icon" v-for="item in tabbarList"
				:key="item.index"></u-tabbar-item>
		</u-tabbar>
	</view>
</template>
<script>
	import {
		universityList
	} from '../../util/universityList'
	import {
		space
	} from '../../util/utils'
	export default {
		data() {
			return {
				popupShow: false,
				universityList,
				searchSchool: '',
				chooseShoole: '',
				chooseShooleInfo: null,
				loadingshow: false,
				tabbarList: [{
						text: '地图',
						icon: 'home',
						index: 0,
						url: '/pages/map/map'
					},
					{
						text: 'Ai',
						icon: 'ai',
						index: 1,
						url: '/pages/index/index'
					}
				],
				tabbar: 0
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
				this.chooseShoole = row.name
				this.chooseShooleInfo = row
			},
			changeTabbar(row) {
				if (row === 0) {
					uni.switchTab({
						url: `/pages/map/map`,
					})
				} else if (row === 1){
					uni.switchTab({
						url: `/pages/index/index`,
					})
				}
			}
		},
		computed: {
			filterSchoolList() {
				const list = this.universityList.filter(item => {
					return item.name.indexOf(this.searchSchool) !== -1
				})
				return list
			}
		},
		async onLoad() {
			this.loadingshow = true
			// console.log('onload',this.universityList);
			const that = this
			await uni.getLocation({
				type: 'wgs84',
				success: function(res) {
					console.log('当前位置的经度：' + res.longitude);
					console.log('当前位置的纬度：' + res.latitude);
					let minLength = 100000000000000000000
					that.filterSchoolList.map((item, index) => {
						// console.log(item);
						if (item.location) {
							const length = space(res.latitude, res.longitude, item.location.lat,
								item.location.lng)
							// console.log(length);
							if (length < minLength) {
								minLength = length
								that.chooseShooleInfo = item
								that.chooseShoole = item.name + '(ai智能推断)'
							}
						}
						if (index === that.filterSchoolList.length - 1) {
							that.loadingshow = false
							that.popupShow = true
							console.log('res', that.chooseShooleInfo);
						}
					})
				}
			});

		}
	};
</script>
<style lang="less" scoped>
	.map {
		width: 100%;
		height: calc(100vh - 52px);
		position: relative;
		background-color: #b4b4b4;

		.scroll_sh {
			width: 90%;
			margin-left: 5%;
			border: 1px solid #b4b4b4;

			// padding: 20rpx;
			.scroll_item {
				max-width: 100%;
				padding: 10rpx;
				border-bottom: 1px solid #b4b4b4;

				.text {
					max-width: 400rpx;
					min-width: 400rpx;
				}
			}
		}
	}
</style>