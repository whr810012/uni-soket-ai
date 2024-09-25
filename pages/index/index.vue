<template>
	<view class="content">
		<!-- <view class="text-area"> 请选择ai模型 </view> -->
		<scroll-view scroll-y class="aiList_box">
			<view class="aiList_box_items">
				<view v-for="(item, index) in aiList" :key="index" @click="gotoAi(item)" class="aiList_item">
				<image class="aiList_img" :src="item.url" alt="" />
				<view class="aiList_name">{{ item.name }}</view>
			</view>
			</view>
		</scroll-view>
		<u-tabbar style="position: absolute;bottom: 0;width: 750rpx;" :value="tabbar" :fixed="false"
			@change="changeTabbar" :safeAreaInsetBottom="false" :placeholder="false">
			<u-tabbar-item :text="item.text" :icon="item.icon" v-for="item in tabbarList"
				:key="item.index"></u-tabbar-item>
		</u-tabbar>
	</view>
</template>

<script>
	import {
		aiList
	} from "../../util/aiList";
	export default {
		data() {
			return {
				aiList,
				tabbarList: [{
						text: '地图',
						icon: 'map-fill',
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
				tabbar: 1
			};
		},
		onLoad() {},
		methods: {
			gotoAi(data) {
				uni.navigateTo({
					url: `/pages/ai/ai?data=${encodeURIComponent(JSON.stringify(data))}`,
				});
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
	};
</script>

<style lang="less" scoped>
	.content {
		width: 750rpx;
		height: 100%;

		.text-area {
			display: flex;
			justify-content: center;
			margin: 20rpx 0 20rpx 0;
			color: #8f8f94;
			font-size: 20px;
		}

		.aiList_box {
			height: calc(100vh - 52px);
			.aiList_box_items {
				display: flex;
			width: 100%;
			margin-top: 40rpx;
			justify-content: space-around;
			flex-wrap: wrap;
			}

			.aiList_item {
				width: 43%;
				border: #8f8f94 1px solid;
				border-radius: 20px;
				display: flex;
				flex-direction: column;
				align-items: center;
				margin-bottom: 20rpx;
			}

			.aiList_img {
				text-align: center;
				width: 150rpx;
				height: 150rpx;
			}

			.aiList_name {
				font-size: 24rpx;
				text-align: center;
				color: #1989fa;
				padding: 20rpx;
			}
		}
	}
</style>