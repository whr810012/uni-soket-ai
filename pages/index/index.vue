<template>
	<view class="content">
		<view class="text-area">
			请选择ai模型
		</view>
		<view class="aiList_box">
			<view v-for="(item, index) in aiList" :key="index" @click="gotoAi(item)" class="aiList_item">
				<image class="aiList_img" :src="item.url" alt="" />
				<view class="aiList_name">{{ item.name }}</view>
			</view>
		</view>
	</view>
</template>

<script>
import { aiList } from '../../util/aiList'
export default {
	data() {
		return {
			aiList
		}
	},
	onLoad() {
	},
	methods: {
		gotoAi(data) {
			if (data.class === 'xunfei') {
				uni.navigateTo({
					url: `/pages/xunfei-ai/xunfei-ai?data=${encodeURIComponent(JSON.stringify(data))}`
				})
			}
		}
	}
}
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
		display: flex;
		width: 100%;
		margin-top: 40rpx;
		justify-content: space-around;
		flex-wrap: wrap;

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