<template>
  <view class="index">
    <view class="top">{{ data.name || "AI助手~" }}</view>
    <scroll-view scroll-y class="content" :scroll-into-view="scrollIntoView">
      <view
        class="dialogue_item"
        :id="'dialogue_item-' + index"
        v-for="(item, index) in dialogueList"
        :key="index"
      >
        <view class="user" v-if="item.role === 'assistant'">
          <image class="avatar" :src="imageSrc"> </image>
          <span class="user_content">
            {{ item.content }}
          </span>
        </view>
        <view class="ai" v-else>
          <view class="ai_content">{{ item.content }}</view>
          <button
            style="width: 20px; height: 20px; border-radius: 50%; margin: 0; padding:0;background-color: #fff;border:none;display: flex;align-items: center;justify-content: center;"
            class="avatar-wrapper"
            open-type="chooseAvatar"
            @chooseavatar="onChooseAvatar"
          >
            <image :src="userimg"></image>
          </button>
        </view>
      </view>
    </scroll-view>
    <view class="send_box">
      <input type="text" v-model="usercontent" placeholder="请输入内容" />
      <button @click="send" :disabled="disabled">发送</button>
    </view>
  </view>
</template>

<script>
import { wenxinsendai, xunfeisendai, getass_token, qwensendai } from "../../api/ai";
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
      userimg:
        "https://tse2-mm.cn.bing.net/th/id/OIP-C.yqoO2L-6goRjRhrnCNNQRwHaHa?rs=1&pid=ImgDetMain",
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
    send() {
      this.disabled = true;
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
          res.choices.map((item) => {
            this.dialogueList.push(item.message);
          });
          uni.setStorageSync(this.data.model, this.dialogueList);
          this.disabled = false;
        });
      } else if (this.data.class === "wenxin") {
        getass_token(this.data.client_id, this.data.client_secret).then(
          (res) => {
            wenxinsendai(data, res).then((r) => {
              this.dialogueList.push({
                role: "assistant",
                content: r,
              });
              uni.setStorageSync(this.data.model, this.dialogueList);
              this.disabled = false;
            });
          }
        );
      } else if (this.data.class === 'qwen') {
        qwensendai(data, this.data.key).then((res) => {
          console.log(res);
          
          res.map((item) => {
            this.dialogueList.push(item.message);
          });
          uni.setStorageSync(this.data.model, this.dialogueList);
          this.disabled = false;
        })
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
      this.imageSrc = "https://ts1.cn.mm.bing.net/th/id/R-C.7d60b0cc97ad68c2f0366e7198231748?rik=NqTw7%2f%2fCCDDJFg&riu=http%3a%2f%2fpic.danji100.com%2fupload%2f2023-4%2f20230412144409455103.png&ehk=vfGWk5cEyY%2fq5%2fVJlWcKCsEpOfA3t5bkZ7rpN2uZZe8%3d&risl=&pid=ImgRaw&r=0"
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
  background-color: #fff;

  .top {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 8vh;
    background-color: rgb(174, 174, 172);
    font-family: Arial, Helvetica, sans-serif;
    font-size: 30rpx;
    color: #fff;
  }

  .content {
    height: 80vh;
    background-color: #fff;
    // padding-bottom: 20rpx;

    .dialogue_item {
      width: 100%;
      padding-top: 20rpx;
      padding-bottom: 20rpx;
      .user {
        display: flex;
        justify-content: flex-start;
        margin-left: 20rpx;

        .user_content {
          padding: 10rpx 20rpx 10rpx 20rpx;
          margin-left: 20rpx;
          // 渐变背景色
          background: linear-gradient(
            to right,
            rgb(240, 202, 202),
            rgb(246, 176, 176)
          );
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
        image {
          width: 20px;
          height: 20px;
          border: 1px solid #6e6e6e;
          border-radius: 50%;
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
    height: 12vh;
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
      max-height: 10vh;
    }
  }
}
</style>
