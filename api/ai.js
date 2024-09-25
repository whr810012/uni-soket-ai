
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
      url: `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ai_apaas?access_token=${res}`,
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
