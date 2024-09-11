<template>
	<view class="index">
		<aiIndex v-if="data" :data="data" />
	</view>
</template>

<script>
import aiIndex from '../../components/ai/ai'
export default {
	components:{aiIndex},
	data() {
		return {
			data:null
		};
	},
	onLoad(option) {
		 this.data = JSON.parse(decodeURIComponent(option.data))
		 console.log(this.data);
	}
}
</script>

<style lang="less" scoped>
	.index{
		width: 750rpx;
		height: 100vh;
	}
</style>
