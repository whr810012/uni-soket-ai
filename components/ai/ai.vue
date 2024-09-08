<template>
    <view class="index">
        <view class="top">{{ data.name || 'AI助手~' }}</view>
        <scroll-view scroll-y class="content" scroll-into-view="{{scrollIntoView}}">
            <view class="dialogue_item" :id="'dialogue_item-'+index" v-for="(item, index) in dialogueList" :key="index">
                <view class="user" v-if="item.role === 'assistant'">
                    <image src="https://so1.360tres.com/t018f408d11d2b5d951.jpg">
                    </image>
                    <span class="user_content">
                        {{ item.content }}
                    </span>
                </view>
                <view class="ai" v-else>
                    <view class="ai_content">{{ item.content }}</view>
                    <image src="https://tse2-mm.cn.bing.net/th/id/OIP-C.yqoO2L-6goRjRhrnCNNQRwHaHa?rs=1&pid=ImgDetMain">
                    </image>
                </view>
            </view>
        </scroll-view>
        <view class="send_box">
            <input type="text" v-model="usercontent" placeholder="请输入内容">
            <button @click="send" :disabled="disabled">发送</button>
        </view>
    </view>
</template>

<script>
import { xunfeisendai } from '../../api/ai'
export default {
    name: 'ai',
    props: ['data'],
    data() {
        return {
            dialogueList: [],
            usercontent: '',
            scrollIntoView:'',
            disabled:false
        }
    },
    methods: {
        scrollToBottom() {
            console.log(`dialogue_item-${this.dialogueList.length - 1}`);
            this.scrollIntoView = `dialogue_item-${this.dialogueList.length - 1}`
        },
        send() {
            this.disabled = true
            this.dialogueList.push({
                role: 'user',
                content: this.usercontent
            })
            this.usercontent = ''
            const data = {
                model: this.data.model,
                messages: this.dialogueList
            }
            const password = this.data.password
            if (this.data.class === 'xunfei') {
                xunfeisendai(data, password).then(res => {
                    res.choices.map(item => {
                        this.dialogueList.push(item.message)
                    })
                    this.disabled = false
                })
            }
        }
    },
    watch: {
        dialogueList() {
            this.scrollToBottom()
        }
    }
}
</script>

<style lang="less" scoped>
.index {
    width: 750rpx;
    height: 100%;
    background-color: #fff;

    .top {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 70rpx;
        background-color: rgb(174, 174, 172);
        font-family: Arial, Helvetica, sans-serif;
        font-size: 30rpx;
        color: #fff
    }

    .content {
        height: 80vh;
        background-color: #fff;
        padding-bottom: 20rpx;

        .dialogue_item {
            width: 100%;
            padding-top: 20rpx;

            .user {
                display: flex;
                justify-content: flex-start;
                margin-left: 20rpx;

                .user_content {
                    padding: 10rpx 20rpx 10rpx 20rpx;
                    margin-left: 20rpx;
                    // 渐变背景色
                    background: linear-gradient(to right, rgb(240, 202, 202), rgb(246, 176, 176));
                    // background-color: rgb(243, 243, 243);
                    padding: 10rpx;
                    border-radius: 10rpx;
                    max-width: 550rpx;
                }
            }

            .ai {
                margin-right: 20rpx;
                display: flex;
                justify-content: flex-end;

                .ai_content {
                    padding: 10rpx 20rpx 10rpx 20rpx;
                    margin-right: 20rpx;
                    background-color: rgb(212, 208, 208);
                    padding: 10rpx;
                    border-radius: 10rpx;
                    max-width: 550rpx;
                    text-align: right;
                }
            }

            image {
                width: 20px;
                height: 20px;
                border: 1px solid #6e6e6e;
                border-radius: 50%;
            }
        }
    }

    .send_box {
        border-top: 1px solid #a1a0a0;
        width: 750rpx;
        height: 120rpx;
        // background-color: rgb(186, 186, 187);
        display: flex;
        align-items: center;

        input {
            height: 80rpx;
            border: 1px solid #6e6e6e;
            border-radius: 60rpx;
            width: 500rpx;
            margin: 0 40rpx;
            padding-left: 20rpx;
        }

        button {
            margin: 0%;
        }
    }
}
</style>