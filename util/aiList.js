import keys from '../config/keys'

export const aiList = [
  {
    url: "https://so1.360tres.com/t018f408d11d2b5d951.jpg",
    name: "讯飞星火（Spark Lite）",
    class: "xunfei",
    model: "general",
    password: keys.XUNFEI.SPARK_LITE.API_KEY,
  },
  {
    url: "https://so1.360tres.com/t018f408d11d2b5d951.jpg",
    name: "讯飞星火（Spark Pro-128K）",
    class: "xunfei",
    model: "pro-128k",
    password: keys.XUNFEI.SPARK_PRO.API_KEY,
  },
  {
    url: "https://so1.360tres.com/t018f408d11d2b5d951.jpg",
    name: "讯飞星火（Spark Max）",
    class: "xunfei",
    model: "generalv3.5",
    password: keys.XUNFEI.SPARK_MAX.API_KEY,
  },
  {
    url: "https://so1.360tres.com/t018f408d11d2b5d951.jpg",
    name: "讯飞星火（Spark 4.0 Uitra）",
    class: "xunfei",
    model: "4.0Ultra",
    password: keys.XUNFEI.SPARK_ULTRA.API_KEY,
  },
  {
    url: "https://www.aitool6.com/wp-content/uploads/2023/06/9557d1-13.png",
    name: "文心一言",
    class: "wenxin",
    model: "ERNIE",
    client_id: keys.WENXIN.CLIENT_ID,
    client_secret: keys.WENXIN.CLIENT_SECRET,
  },
  {
    url: "https://www.cnschat.com/wp-content/uploads/2023/06/1686582383-nav-ai-tongyi.png",
    name: "通义千问（Qwen-2.0）",
    class: "qwen",
    model: "qwen2-1.5b-instruct",
    key: keys.QWEN.API_KEY,
  },
  {
    url: "https://www.cnschat.com/wp-content/uploads/2023/06/1686582383-nav-ai-tongyi.png",
    name: "通义千问（Qwen-2.5）",
    class: "qwen",
    model: "qwen2.5-0.5b-instruct",
    key: keys.QWEN.API_KEY,
  },
  {
    url: "https://www.cnschat.com/wp-content/uploads/2023/06/1686582383-nav-ai-tongyi.png",
    name: "通义千问（Qwen-Math）",
    class: "qwen",
    model: "qwen2.5-math-1.5b-instruct",
    key: keys.QWEN.API_KEY,
  },
  {
    url: "https://ts1.cn.mm.bing.net/th?id=OIP-C.lP7TvomXA35x9wyyCxFl0QHaHa&rs=1&pid=ImgDetMain",
    name: "智谱清言（GLM-4）",
    class: "glm",
    model: "glm-4-flash",
    key: keys.GLM.API_KEY,
  },
  {
    url:'https://ark-auto-2100466578-cn-beijing-default.tos-cn-beijing.volces.com/model_cardAgLUOSwptd.png',
    name:'豆包',
    class:'Doubao',
    model:'ep-20240926132036-gt5zx',
    key: keys.DOUBAO.API_KEY
  },
  {
    url: 'https://cdn.deepseek.com/platform/favicon.png',
    name: 'DeepSeek Chat',
    class: 'deepseek',
    model: 'deepseek-ai/DeepSeek-V3',
    key: keys.DEEPSEEK.API_KEY
  }
];