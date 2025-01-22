<template>
	<view class="index">
		<view class="top">{{ data.name || "AI助手~" }}</view>
		<scroll-view scroll-y class="content" :scroll-into-view="scrollIntoView">
			<view class="dialogue_item" :id="'dialogue_item-' + index" v-for="(item, index) in dialogueList"
				:key="index">
				<view class="user" v-if="item.role === 'assistant'">
					<image class="avatar" :src="imageSrc"> </image>
					<view class="message-wrapper">
						<span class="user_content" @longpress="copyMessage(item.content)" v-html="parseMarkdown(item.content)"></span>
						<view class="action-btns">
							<view class="action-btn" @click="copyMessage(item.content)">复制</view>
							<view class="action-btn" @click="regenerateResponse(index)">重新回复</view>
						</view>
					</view>
				</view>
				<view class="ai" v-else>
					<view class="message-wrapper">
						<view class="ai_content">{{ item.content }}</view>
					</view>
					<button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
						<image class="avatar" :src="userimg"></image>
					</button>
				</view>
			</view>
		</scroll-view>
		<view class="send_box">
			<input type="text" v-model="usercontent" placeholder="请输入内容" />
			<button @click="send" :disabled="disabled || !usercontent.trim()">发送</button>
		</view>
	</view>
</template>

<script>
	import {
		wenxinsendai,
		xunfeisendai,
		getass_token,
		qwensendai,
		glmsendai,
		doubaosendai
	} from "../../api/ai";

	export default {
		name: "ai",
		props: ["data"],
		data() {
			return {
				dialogueList: [],
				usercontent: "",
				scrollIntoView: "",
				disabled: false,
				imageSrc: "",
				userimg: "https://tse2-mm.cn.bing.net/th/id/OIP-C.yqoO2L-6goRjRhrnCNNQRwHaHa?rs=1&pid=ImgDetMain",
			};
		},
		methods: {
			onChooseAvatar(e) {
				uni.setStorageSync("userimg", e.detail.avatarUrl);
				this.userimg = e.detail.avatarUrl;
			},
			scrollToBottom() {
				console.log(`dialogue_item-${this.dialogueList.length - 1}`);
				this.scrollIntoView = `dialogue_item-${this.dialogueList.length - 1}`;
			},
			showLoading() {
				uni.showLoading({
					title: '正在思考中...',
					mask: true
				});
			},
			hideLoading() {
				uni.hideLoading();
			},
			send() {
				if (!this.usercontent.trim()) {
					uni.showToast({
						title: '请输入内容',
						icon: 'none',
						duration: 1500
					});
					return;
				}

				this.disabled = true;
				this.showLoading();
				this.dialogueList.push({
					role: "user",
					content: this.usercontent,
				});
				uni.setStorageSync(this.data.model, this.dialogueList);
				this.usercontent = "";
				const data = {
					model: this.data.model,
					messages: this.dialogueList,
				};
				const password = this.data.password;
				if (this.data.class === "xunfei") {
					xunfeisendai(data, password).then((res) => {
						if (res.choices.length > 0) {
							res.choices.map((item) => {
								this.dialogueList.push(item.message);
							});
							uni.setStorageSync(this.data.model, this.dialogueList);
						}
					}).finally(() => {
						this.disabled = false;
						this.hideLoading();
					});
				} else if (this.data.class === "wenxin") {
					getass_token(this.data.client_id, this.data.client_secret).then((res) => {
						wenxinsendai(data, res).then((r) => {
							if (!!r) {
								this.dialogueList.push({
									role: "assistant",
									content: r,
								});
								uni.setStorageSync(this.data.model, this.dialogueList);
							}
						}).finally(() => {
							this.disabled = false;
							this.hideLoading();
						});
					});
				} else if (this.data.class === 'qwen') {
					qwensendai(data, this.data.key).then((res) => {
						if (res.length > 0) {
							res.map((item) => {
								this.dialogueList.push(item.message);
							});
							uni.setStorageSync(this.data.model, this.dialogueList);
						}
					}).finally(() => {
						this.disabled = false;
						this.hideLoading();
					});
				} else if (this.data.class === 'glm') {
					glmsendai(data, this.data.key).then((res) => {
						if (res.length > 0) {
							res.map((item) => {
								this.dialogueList.push(item.message);
							});
							uni.setStorageSync(this.data.model, this.dialogueList);
						}
					}).finally(() => {
						this.disabled = false;
						this.hideLoading();
					});
				} else if (this.data.class === 'Doubao') {
					doubaosendai(data, this.data.key).then((res) => {
						if (res.length > 0) {
							res.map((item) => {
								this.dialogueList.push(item.message);
							});
							uni.setStorageSync(this.data.model, this.dialogueList);
						}
					}).finally(() => {
						this.disabled = false;
						this.hideLoading();
					});
				}
			},
			copyMessage(content) {
				uni.setClipboardData({
					data: content,
					success: () => {
						uni.showToast({
							title: '复制成功',
							icon: 'success',
							duration: 1500
						});
					}
				});
			},
			regenerateResponse(index) {
				let userMessage = null;
				for(let i = index - 1; i >= 0; i--) {
					if(this.dialogueList[i].role === 'user') {
						userMessage = this.dialogueList[i].content;
						break;
					}
				}
				
				if(!userMessage) return;
				
				this.dialogueList = this.dialogueList.slice(0, index);
				
				const data = {
					model: this.data.model,
					messages: this.dialogueList,
				};
				
				this.showLoading();
				
				if (this.data.class === "xunfei") {
					xunfeisendai(data, this.data.password).then((res) => {
						if (res.choices.length > 0) {
							res.choices.map((item) => {
								this.dialogueList.push(item.message);
							});
							uni.setStorageSync(this.data.model, this.dialogueList);
						}
					}).finally(() => {
						this.disabled = false;
						this.hideLoading();
					});
				} else if (this.data.class === "wenxin") {
					getass_token(this.data.client_id, this.data.client_secret).then((res) => {
						wenxinsendai(data, res).then((r) => {
							if (!!r) {
								this.dialogueList.push({
									role: "assistant",
									content: r,
								});
								uni.setStorageSync(this.data.model, this.dialogueList);
							}
						}).finally(() => {
							this.disabled = false;
							this.hideLoading();
						});
					});
				} else if (this.data.class === 'qwen') {
					qwensendai(data, this.data.key).then((res) => {
						if (res.length > 0) {
							res.map((item) => {
								this.dialogueList.push(item.message);
							});
							uni.setStorageSync(this.data.model, this.dialogueList);
						}
					}).finally(() => {
						this.disabled = false;
						this.hideLoading();
					});
				} else if (this.data.class === 'glm') {
					glmsendai(data, this.data.key).then((res) => {
						if (res.length > 0) {
							res.map((item) => {
								this.dialogueList.push(item.message);
							});
							uni.setStorageSync(this.data.model, this.dialogueList);
						}
					}).finally(() => {
						this.disabled = false;
						this.hideLoading();
					});
				} else if (this.data.class === 'Doubao') {
					doubaosendai(data, this.data.key).then((res) => {
						if (res.length > 0) {
							res.map((item) => {
								this.dialogueList.push(item.message);
							});
							uni.setStorageSync(this.data.model, this.dialogueList);
						}
					}).finally(() => {
						this.disabled = false;
						this.hideLoading();
					});
				}
			},
			parseMarkdown(content) {
				try {
					if (!content) return '';
					
					// 处理代码块
					content = content.replace(/```([\s\S]*?)```/g, (match, code) => {
						code = code.replace(/^.*\n/, '');
						return `<div class="code-block"><pre><code>${code}</code></pre></div>`;
					});
					
					// 处理粗体
					content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
					
					// 处理标题 (## 类型)
					content = content.replace(/^(#{1,6})\s+([^\n]+)/gm, (match, hashes, title) => {
						const level = hashes.length;
						return `<div class="markdown-heading-${level}">${title}</div>`;
					});
					
					// 处理行内代码
					content = content.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
					
					// 处理列表
					content = content.replace(/^\s*[-*+]\s+([^\n]+)/gm, '<div class="markdown-list-item">• $1</div>');
					
					// 处理换行 (保持段落间的换行)
					content = content.replace(/\n\n/g, '</p><p>');
					content = content.replace(/\n/g, '<br>');
					
					// 包装整个内容
					content = `<p>${content}</p>`;
					
					return content;
				} catch (e) {
					console.error('Markdown解析错误:', e);
					return content || '';
				}
			},
		},
		watch: {
			dialogueList() {
				this.scrollToBottom();
			},
		},
		created() {
			if (this.data.class === "xunfei") {
				this.imageSrc = "https://so1.360tres.com/t018f408d11d2b5d951.jpg";
			} else if (this.data.class === "wenxin") {
				this.imageSrc =
					"https://www.aitool6.com/wp-content/uploads/2023/06/9557d1-13.png";
			} else if (this.data.class === 'qwen') {
				this.imageSrc =
					"https://ts1.cn.mm.bing.net/th/id/R-C.7d60b0cc97ad68c2f0366e7198231748?rik=NqTw7%2f%2fCCDDJFg&riu=http%3a%2f%2fpic.danji100.com%2fupload%2f2023-4%2f20230412144409455103.png&ehk=vfGWk5cEyY%2fq5%2fVJlWcKCsEpOfA3t5bkZ7rpN2uZZe8%3d&risl=&pid=ImgRaw&r=0"
			} else if (this.data.class === 'glm') {
				this.imageSrc = 'https://ts1.cn.mm.bing.net/th?id=OIP-C.lP7TvomXA35x9wyyCxFl0QHaHa&rs=1&pid=ImgDetMain'
			} else if (this.data.class === 'Doubao') {
				this.imageSrc =
					'https://ark-auto-2100207538-cn-beijing-default.tos-cn-beijing.volces.com/model_cardLTPtdLeE5K.png'
			}
			this.userimg =
				uni.getStorageSync("userimg") ||
				"https://tse2-mm.cn.bing.net/th/id/OIP-C.yqoO2L-6goRjRhrnCNNQRwHaHa?rs=1&pid=ImgDetMain";
			this.dialogueList = uni.getStorageSync(this.data.model) || [];
		},
	};
</script>

<style lang="less" scoped>
	.index {
		width: 750rpx;
		height: 100vh;
		background-color: #f5f5f5;

		.top {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100%;
			height: 88rpx;
			background-color: #4a90e2;
			font-size: 32rpx;
			color: #fff;
			font-weight: 500;
			box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
		}

		.content {
			height: calc(100vh - 188rpx);
			padding: 20rpx 0;
			
			.dialogue_item {
				padding: 24rpx;
				margin-bottom: 20rpx;
				
				.user {
					display: flex;
					align-items: flex-start;
					margin-bottom: 24rpx;

					.message-wrapper {
						position: relative;
						display: flex;
						flex-direction: column;
						max-width: 70%;
						
						.action-btns {
							display: flex;
							gap: 16rpx;
							margin-top: 8rpx;
							padding: 0 8rpx;
							
							.action-btn {
								font-size: 24rpx;
								color: #666;
								padding: 4rpx 12rpx;
								background: rgba(74, 144, 226, 0.1);
								border-radius: 6rpx;
								transition: all 0.3s ease;
								
								&:active {
									background: rgba(74, 144, 226, 0.2);
								}
								&:last-child {
									background: rgba(74, 144, 226, 0.15);
								}
							}
						}
					}
					
					.user_content {
						margin-left: 16rpx;
						padding: 20rpx 24rpx;
						background: #4a90e2;
						color: #fff;
						border-radius: 18rpx;
						border-top-left-radius: 4rpx;
						max-width: 70%;
						word-break: break-all;
						box-shadow: 0 2rpx 8rpx rgba(74, 144, 226, 0.2);
						line-height: 1.5;
						font-size: 28rpx;
						transition: all 0.3s ease;
						cursor: pointer;
						user-select: text;
						
						&:active {
							opacity: 0.8;
						}
						
						:deep(p) {
							margin: 16rpx 0;
							line-height: 1.6;
						}
						
						:deep(strong) {
							font-weight: bold;
							color: #000;
						}
						
						:deep(.markdown-heading-1) {
							font-size: 40rpx;
							font-weight: bold;
							margin: 32rpx 0 24rpx;
							color: #000;
						}
						
						:deep(.markdown-heading-2) {
							font-size: 36rpx;
							font-weight: bold;
							margin: 28rpx 0 20rpx;
							color: #222;
						}
						
						:deep(.markdown-heading-3) {
							font-size: 32rpx;
							font-weight: bold;
							margin: 24rpx 0 16rpx;
							color: #333;
						}
						
						:deep(.code-block) {
							background: #f6f8fa;
							border-radius: 8rpx;
							margin: 16rpx 0;
							padding: 16rpx;
							
							pre {
								margin: 0;
								overflow-x: auto;
								
								code {
									font-family: Consolas, Monaco, 'Andale Mono', monospace;
									font-size: 24rpx;
									line-height: 1.6;
									color: #333;
									white-space: pre-wrap;
									word-break: break-all;
								}
							}
						}
						
						:deep(.inline-code) {
							background: #f6f8fa;
							padding: 4rpx 8rpx;
							border-radius: 4rpx;
							font-family: Consolas, Monaco, 'Andale Mono', monospace;
							font-size: 24rpx;
							color: #333;
						}
						
						:deep(.markdown-list-item) {
							padding: 8rpx 0;
							padding-left: 32rpx;
							position: relative;
						}
						
						:deep(br) {
							display: block;
							content: "";
							margin: 8rpx 0;
						}
					}
				}

				.ai {
					display: flex;
					align-items: flex-start;
					justify-content: flex-end;
					margin-bottom: 24rpx;

					.message-wrapper {
						position: relative;
						display: flex;
						flex-direction: column;
						max-width: 70%;
						
						.action-btns {
							display: flex;
							gap: 16rpx;
							margin-top: 8rpx;
							padding: 0 8rpx;
						}
					}

					.ai_content {
						margin-right: 16rpx;
						padding: 20rpx 24rpx;
						background: #fff;
						color: #333;
						border-radius: 18rpx;
						border-top-right-radius: 4rpx;
						max-width: 70%;
						word-break: break-all;
						box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
						line-height: 1.5;
						font-size: 28rpx;
						transition: all 0.3s ease;
						
						&:active {
							background: rgba(74, 144, 226, 0.05);
						}
					}
				}

				.avatar {
					width: 72rpx;
					height: 72rpx;
					border-radius: 50%;
					border: 2rpx solid #e0e0e0;
					box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
					transition: all 0.3s ease;
					
					&:active {
						transform: scale(0.95);
					}
				}
			}
		}

		.send_box {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			padding: 16rpx 24rpx;
			background: #fff;
			border-top: 1rpx solid #e0e0e0;
			display: flex;
			align-items: center;
			gap: 16rpx;

			input {
				flex: 1;
				height: 72rpx;
				background: #f5f5f5;
				border: none;
				border-radius: 36rpx;
				padding: 0 24rpx;
				font-size: 28rpx;
			}

			button {
				min-width: 120rpx;
				height: 72rpx;
				background: #4a90e2;
				color: #fff;
				border-radius: 36rpx;
				font-size: 28rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 0 32rpx;
				margin: 0;

				&:disabled {
					background: #ccc;
				}
			}
		}

		.dialogue_item {
			.user, .ai {
				.message-wrapper {
					position: relative;
					display: flex;
					flex-direction: column;
					max-width: 70%;
					
					.action-btns {
						display: flex;
						gap: 16rpx;
						margin-top: 8rpx;
						padding: 0 8rpx;
					}
				}
				
				.user .action-btn {
					right: 0;
				}
				
				.ai .action-btn {
					left: 0;
				}
			}

			.avatar-btn {
				width: 72rpx;
				height: 72rpx;
				margin: 0;
				padding: 0;
				background: none;
				border: none;
				
				&::after {
					border: none;
				}
				
				.avatar {
					width: 72rpx;
					height: 72rpx;
					border-radius: 50%;
					border: 2rpx solid #e0e0e0;
					box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
					transition: all 0.3s ease;
					
					&:active {
						transform: scale(0.95);
					}
				}
			}
		}
	}
</style>