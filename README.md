# Uni-Socket-AI 项目说明文档

## 项目简介

Uni-Socket-AI 是一个基于 Uni-app 框架开发的多页面应用项目，旨在提供地图浏览、学校搜索、AI 交互和路径规划等多种功能。项目使用了 Uni-app 的组件库 uView，并集成了多种 AI 模型，以便用户能够方便地与不同的 AI 进行对话。

## 功能特点

- **地图功能**：用户可以通过地图页面查看特定位置，搜索和选择学校。
- **AI 交互**：用户可以在 AI 助手页面选择不同的 AI 模型进行对话。
- **AI 路径规划**：用户可以在 AI 旅游页面输入旅游想法，系统将自动规划合理的旅游路线。
- **组件丰富**：项目使用了 uView 组件库，提供了丰富的 UI 组件供开发者使用。

## AI 交互

AI 交互界面是 Uni-Socket-AI 项目的核心功能之一，用户可以在该界面选择不同的 AI 模型进行对话。AI 交互界面使用了 Uni-app 的输入框和消息列表组件，提供了良好的用户体验。

## AI 路径规划

AI 路径规划功能允许用户输入旅游想法，系统将自动规划合理的旅游路线。用户可以在地图上查看规划的路线，并获取详细的交通方式和时间信息。

## 注意事项

- 请确保在使用 API 接口时，已经正确配置了密钥和参数。
- 项目中的某些功能可能需要网络连接才能正常使用。

## 如何使用

1. 克隆项目到本地。
2. 使用 HBuilderX 打开项目。
3. 配置 API 接口的密钥和参数。
4. 运行项目，开始使用。

## 贡献指南

欢迎对本项目进行贡献。如果您有任何建议或问题，请通过项目的 Issue 跟踪器提交。

## 许可证

本项目采用 MIT 许可证。有关详细信息，请参阅 LICENSE 文件。

## 目录结构

```plaintext
├── .hbuilderx
│   └── launch.json
├── api
│   └── ai.js
├── App.vue
├── components
│   ├── ai
│   │   └── ai.vue //ai问答组件
│   └── uview组件
├── libs
│   ├── config
│   ├── css
│   ├── function
│   ├── mixin
│   ├── request
│   ├── store
│   └── util
├── main.js
├── manifest.json
├── package.json
├── pages
│   ├── ai
│   │   └── ai.vue //ai问答主界面
│   ├── aimap
│   │   └── aimap.vue //ai旅游规划主界面
│   ├── index
│   │   └── index.vue
│   └── map
│       └── map.vue  //校园地图主界面
├── pages.json
├── README.md
├── scripts
├── static
│   └── icons
├── uni.promisify.adaptor.js
└── util
    ├── aiList.js
    └── utils.js
```

## 目录说明

- `.hbuilderx/launch.json`：HBuilderX 的启动配置文件。
- `api/ai.js`：定义了与 AI 模型交互的 API 接口。
- `App.vue`：项目的根组件，定义了全局的样式和配置。
- `components/`：存放了项目中使用的所有组件。
- `libs/`：包含了项目的配置、样式、函数、混入、请求、状态管理和工具函数。
- `main.js`：项目的入口文件，初始化了 Vue 应用。
- `manifest.json`：项目的配置文件，包含了项目的名称、版本等信息。
- `pages/`：存放了项目的所有页面。
- `pages.json`：定义了项目的页面结构和路由信息。
- `static/`：存放了项目的静态资源，如图标等。
- `uni.promisify.adaptor.js`：Uni-app 的 Promise 化适配器。
- `util/`：存放了项目的工具函数和 AI 模型列表。

## AI 模型列表

项目支持多种 AI 模型，具体列表如下：

- 讯飞星火（Spark Lite）
- 讯飞星火（Spark Pro）
- 讯飞星火（Spark Pro-128K）
- 讯飞星火（Spark Max）
- 讯飞星火（Spark 4.0 Uitra）
- 文心一言
- 通义千问（Qwen-2.0）
- 通义千问（Qwen-2.5）
- 通义千问（Qwen-Math）
- 智谱清言（GLM-4）
- 豆包

## 配置说明

本项目使用了多个AI服务和地图服务的API，需要配置相应的密钥才能正常运行。

### 配置步骤

1. 在 `config` 目录下创建 `keys.js` 文件
2. 参考 `config/keys.example.js` 的格式，填入您的API密钥
3. 确保 `keys.js` 已被添加到 `.gitignore` 中，避免敏感信息泄露

### 所需密钥

- 文心一言：CLIENT_ID 和 CLIENT_SECRET
- 通义千问：API_KEY
- 智谱清言：API_KEY
- 讯飞星火：各版本的 APP_ID 和 API_KEY
- 豆包：API_KEY
- 高德地图：API_KEY

请在相应平台申请以上密钥，并妥善保管。

## 如何使用

1. 克隆项目到本地。
2. 使用 HBuilderX 打开项目。
3. 配置 API 接口的密钥和参数。
4. 运行项目，开始使用。
