# Uni-Socket-AI 项目说明文档

## 项目简介

Uni-Socket-AI 是一个基于 Uni-app 框架开发的多页面应用项目，旨在提供地图浏览、学校搜索、AI 交互等多种功能。项目使用了 Uni-app 的组件库 uView，并集成了多种 AI 模型，以便用户能够方便地与不同的 AI 进行对话。

## 功能特点

- **地图功能**：用户可以通过地图页面查看特定位置，搜索和选择学校。
- **AI 交互**：用户可以在 AI 助手页面选择不同的 AI 模型进行对话。
- **组件丰富**：项目使用了 uView 组件库，提供了丰富的 UI 组件供开发者使用。

## 目录结构

```
├── .hbuilderx
│   └── launch.json
├── api
│   └── ai.js
├── App.vue
├── components
│   ├── ai
│   │   └── ai.vue
│   └── uview-v1
│       └── ...
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
├── pages
│   ├── ai
│   │   └── ai.vue
│   ├── index
│   │   └── index.vue
│   └── map
│       └── map.vue
├── pages.json
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

## 如何使用

1. 克隆项目到本地。
2. 使用 HBuilderX 打开项目。
3. 配置 API 接口的密钥和参数。
4. 运行项目，开始使用。

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

## 注意事项

- 请确保在使用 API 接口时，已经正确配置了密钥和参数。
- 项目中的某些功能可能需要网络连接才能正常使用。
