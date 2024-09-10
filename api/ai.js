
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
          resolve(res.data);
      },
      fail: (err) => {
        reject(err);
      },
      complete: () => {},
    });
  });
};
