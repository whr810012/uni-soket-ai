export const xunfeisendai = ( data, password) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'https://spark-api-open.xf-yun.com/v1/chat/completions',
      data,
      header:{
        "Authorization": "Bearer " + password
      },
      timeout: 100000,
      method: 'post',
      success: (res) => {
          resolve(res.data)
      },
      fail: (err) => {
        reject(err)
      },
      complete: () => {},
    })
  })
};
export const wenxinsendai = ( data, res ) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie_speed?access_token=${res}`,
      data,
      timeout: 100000,
      method: 'post',
      success: (res) => {
          resolve(res.data.result)
      },
      fail: (err) => {
        reject(err)
      },
      complete: () => {},
    })
  })
};
export const qwensendai = (data, key) => {
  return new Promise((resolve, reject) => {
    uni.request({
      // https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
      url: `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`,
      data,
      header:{
        "Authorization": "Bearer " + key
      },
      timeout: 100000,
      method: 'post',
      success: (res) => {
          resolve(res.data.choices)
      },
      fail: (err) => {
        reject(err)
      },
      complete: () => {},
    })
  })
}
export const glmsendai = (data, key) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `https://open.bigmodel.cn/api/paas/v4/chat/completions`,
      data,
      header:{
        "Authorization": "Bearer " + key
      },
      timeout: 100000,
      method: 'post',
      success: (res) => {
          resolve(res.data.choices)
      },
      fail: (err) => {
        reject(err)
      },
      complete: () => {},
    })
  })
}
export const doubaosendai = (data, key) => {
  if(data.messages.length > 1 && data.messages[data.messages.length-1].role === data.messages[data.messages.length-2].role ) {
	  data.messages = [data.messages[data.messages.length-1]]
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url: `https://ark.cn-beijing.volces.com/api/v3/chat/completions`,
      data,
      header:{
        "Authorization": "Bearer " + key
      },
      timeout: 100000,
      method: 'post',
      success: (res) => {
          resolve(res.data.choices)
      },
      fail: (err) => {
        reject(err)
      },
      complete: () => {},
    })
  })
}
export const getass_token = ( client_id, client_secret) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`,
      timeout: 100000,
      method: 'post',
      success: (res) => {
          resolve(res.data.access_token)
      },
      fail: (err) => {
        reject(err)
      },
      complete: () => {},
    })
  })
}
export const deepseeksendai = (data, key) => {
  // 构建请求数据
  const requestData = {
    model: data.model || 'deepseek-ai/DeepSeek-V3',
    messages: data.messages,
    stream: false,
    max_tokens: data.max_tokens || 512,
    temperature: data.temperature || 0.7,
    top_p: data.top_p || 0.7,
    top_k: data.top_k || 50,
    frequency_penalty: data.frequency_penalty || 0.5,
    n: data.n || 1,
    response_format: {
      type: "text"
    }
  };

  return new Promise((resolve, reject) => {
    uni.request({
      url: 'https://api.siliconflow.cn/v1/chat/completions',
      data: requestData,
      header: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json"
      },
      timeout: 100000,
      method: 'post',
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.choices) {
          // 只返回 choices 数组，与其他 AI 接口保持一致
          resolve(res.data.choices.map(choice => ({
            index: choice.index,
            message: {
              role: choice.message.role,
              content: choice.message.content
            },
            finish_reason: choice.finish_reason
          })));
        } else {
          reject(new Error(`API 请求失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}
