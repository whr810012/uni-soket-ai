<template>
    <view class="index">
        <view class="top">{{ title || 'AI助手~' }}</view>
        <view class="content">
            <view class="dialogue_item" v-for="(item, index) in dialogueList" :key="index">
                <view class="user" v-if="item.type === 'ai'">
                    <image src="https://tse2-mm.cn.bing.net/th/id/OIP-C.yqoO2L-6goRjRhrnCNNQRwHaHa?rs=1&pid=ImgDetMain"></image>
                    <span class="user_content">
                        {{ item.content }}
                    </span>
                </view>
                <view class="ai" v-else>
                    <view class="ai_content">{{ item.content }}</view>
                    <image src="https://so1.360tres.com/t018f408d11d2b5d951.jpg"></image>
                </view>
            </view>
        </view>
        <view class="send_box"></view>
    </view>
</template>

<script>
export default {
    name: 'ai',
    props: ['title', 'sence'],
    data() {
        return {
            dialogueList: []
        }
    },
    methods: {
        init() {
            this.dialogueList = [
                {
                    type: 'user',
                    content: '你好你好'
                },
                {
                    type: 'ai',
                    content: '你好，我是AI'
                },
                {
                    type: 'user',
                    content: '你好你好'
                },
                {
                    type: 'ai',
                    content: '你好，我是A你好，我是A你好，我是A你好，我是A你好，我是A你好，我是A你好，我是A你好，我是A你好，我是A你好，我是A你好，我是A你好，我是A你好，我是A你好，我是A你好，我是A你好，我是A你好，我是A你好，我是A你好，我是A你好，我是AI'
                },
                {
                    type: 'user',
                    content: '你好你好'
                },
                {
                    type: 'ai',
                    content: '你好，我是AI'
                },                {
                    type: 'user',
                    content: '你好你好'
                },
                {
                    type: 'ai',
                    content: '你好，我是AI'
                },                {
                    type: 'user',
                    content: '你好你好'
                },
                {
                    type: 'ai',
                    content: '你好，我是AI'
                },                {
                    type: 'user',
                    content: '你好你好'
                },
                {
                    type: 'ai',
                    content: '你好，我是AI'
                },                {
                    type: 'user',
                    content: '你好你好'
                },
                {
                    type: 'ai',
                    content: '你好，我是AI'
                },                {
                    type: 'user',
                    content: '你好你好'
                },
                {
                    type: 'ai',
                    content: '你好，我是AI'
                },                {
                    type: 'user',
                    content: '你好你好'
                },
                {
                    type: 'ai',
                    content: '你好，我是AI'
                },                {
                    type: 'user',
                    content: '你好你好'
                },
                {
                    type: 'ai',
                    content: '你好，我是AI'
                },                {
                    type: 'user',
                    content: '你好你好'
                },
                {
                    type: 'ai',
                    content: '你好，我是AI'
                },                {
                    type: 'user',
                    content: '你好你好'
                },
                {
                    type: 'ai',
                    content: '你好，我是AI'
                },                {
                    type: 'user',
                    content: '你好你好'
                },
                {
                    type: 'ai',
                    content: '你好，我是AI'
                },                {
                    type: 'user',
                    content: '你好你好'
                },
                {
                    type: 'ai',
                    content: '你好，我是AI'
                },                {
                    type: 'user',
                    content: '你好你好'
                },
                {
                    type: 'ai',
                    content: '你好，我是AI'
                }
            ]
        }
    },
    created() {
        this.init()
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
        height: calc(100% - 210rpx);
        background-color: #fff;
        overflow: auto;
        padding-bottom:20rpx;
        .dialogue_item {
            width: 100%;
            padding-top: 20rpx;

            .user {
                display: flex;
                justify-content: flex-start;
                margin-left: 20rpx;

                .user_content {
                    padding:10rpx 20rpx 10rpx 20rpx; 
                    margin-left: 20rpx;
                    background-color: rgb(243, 243, 243);
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
                    padding:10rpx 20rpx 10rpx 20rpx; 
                    margin-right: 20rpx;
                    background-color: rgb(243, 243, 243);
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
        height: 140rpx;
        background-color: blue;
    }
}
</style>