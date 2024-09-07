<template>
	<view class="index">
		<aiIndex :title="title" :sence="sence" />
	</view>
</template>

<script>
import aiIndex from '../../components/ai/ai'
export default {
	components:{aiIndex},
	data() {
		return {
			sence: null,
			title:''
		};
	},
	onLoad(option) {
		const data = JSON.parse(decodeURIComponent(option.data))
		console.log(data);
		this.sence = data.sence
		this.title = data.name
	}
}
</script>

<style lang="less" scoped>
	.index{
		width: 750rpx;
		height: 100vh;
	}
</style>
