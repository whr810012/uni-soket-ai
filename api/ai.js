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
    model: data.model,
    messages: data.messages,
    stream: false,
    max_tokens: 512,
    temperature: 0.7,
    top_p: 0.7,
    top_k: 50,
    frequency_penalty: 0.5,
    n: 1,
    response_format: {
      type: "text"
    }
  };

  return new Promise((resolve, reject) => {
    uni.request({
      url: 'https://api.siliconflow.cn/v1/chat/completions', // 更新为新的API地址
      data: requestData,
      header:{
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json"
      },
      timeout: 100000,
      method: 'post',
      success: (res) => {
        if(res.data && res.data.choices) {
          resolve(res.data.choices)
        } else {
          reject(new Error('Invalid response format'))
        }
      },
      fail: (err) => {
        reject(err)
      },
      complete: () => {},
    })
  })
}
