<template>
  <view class="aimap-container">
    <map
      id="map"
      class="map"
      :latitude="latitude"
      :longitude="longitude"
      :markers="markers"
      :polyline="polylines"
      show-location
      :scale="14"
    ></map>
    
    <!-- 悬浮按钮 -->
    <view class="float-button" @click="showPopup = true">
      <image src="/static/icons/map.svg" class="icon-image"></image>
    </view>

    <!-- 弹窗 -->
    <view class="custom-popup" v-if="showPopup">
      <view class="popup-mask" @click="showPopup = false"></view>
      <view class="popup-content">
        <view class="popup-title">智能路线规划</view>
        <view class="input-box">
          <textarea
            v-model="userDescription"
            placeholder="请描述您今天想去哪里玩（例如：想去附近的公园散步）"
        class="destination-input"
            auto-height
          />
      </view>
        <button class="submit-btn" @click="handlePlan" :loading="loading">开始规划路线</button>
    </view>
    </view>

    <!-- 添加路线介绍按钮 -->
    <view class="route-info-button" v-if="routeDescription" @click="showRouteInfo = true">
      <image src="/static/icons/info.svg" class="icon-image"></image>
    </view>

    <!-- 路线介绍弹窗 -->
    <view class="custom-popup" v-if="showRouteInfo">
      <view class="popup-mask" @click="showRouteInfo = false"></view>
      <view class="popup-content route-info">
        <view class="popup-title">路线介绍</view>
        <scroll-view class="route-description" scroll-y>
          <text>{{routeDescription}}</text>
        </scroll-view>
        <button class="close-btn" @click="showRouteInfo = false">关闭</button>
      </view>
    </view>

    <!-- 添加历史记录按钮 -->
    <view class="history-button" @click="showHistory = true" v-if="historyRoutes.length > 0">
      <image src="/static/icons/history.svg" class="icon-image"></image>
    </view>

    <!-- 历史记录弹窗 -->
    <view class="custom-popup" v-if="showHistory">
      <view class="popup-mask" @click="showHistory = false"></view>
      <view class="popup-content history-content">
        <view class="popup-header">
          <text class="popup-title">历史路线</text>
          <text class="popup-subtitle">共 {{historyRoutes.length}} 条记录</text>
        </view>
        <view class="history-list">
          <view 
            class="history-item" 
            v-for="(item, index) in historyRoutes" 
            :key="item.id"
          >
            <view class="history-header">
              <view class="header-left">
                <text class="history-index">#{{historyRoutes.length - index}}</text>
                <text class="history-date">{{item.date}}</text>
              </view>
              <view class="history-actions">
                <button class="action-btn reuse" @click="reuseRoute(item)">
                  <text class="btn-icon">↺</text>
                  <text>重新规划</text>
                </button>
                <button class="action-btn delete" @click="deleteHistory(index)">
                  <text class="btn-icon">×</text>
                  <text>删除</text>
                </button>
              </view>
            </view>
            <view class="history-content-box">
              <view class="history-description">
                <text class="label">旅行想法：</text>
                <text>{{item.description}}</text>
              </view>
              <view class="history-route">
                <text class="label">规划路线：</text>
                <text>{{item.route}}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="history-footer">
          <button class="close-btn" @click="showHistory = false">关闭</button>
        </view>
      </view>
    </view>

    <!-- 路线图例 -->
    <view class="route-legend">
      <view class="legend-item">
        <view class="color-block" style="background: #2196F3;"></view>
        <text>步行</text>
      </view>
      <view class="legend-item">
        <view class="color-block" style="background: #4CAF50;"></view>
        <text>公交</text>
      </view>
      <view class="legend-item">
        <view class="color-block" style="background: #FF5722;"></view>
        <text>驾车</text>
      </view>
    </view>

    <u-tabbar
      style="position: absolute; bottom: 0; width: 750rpx"
      :value="tabbar"
      :fixed="false"
      @change="changeTabbar"
      :safeAreaInsetBottom="false"
      :placeholder="false"
    >
      <u-tabbar-item
        :text="item.text"
        :icon="item.icon"
        v-for="item in tabbarList"
        :key="item.index"
      ></u-tabbar-item>
    </u-tabbar>

    <!-- 添加自定义loading组件 -->
    <view class="custom-loading" v-if="loading">
      <view class="loading-mask"></view>
      <view class="loading-content">
        <view class="loading-spinner">
          <view class="loading-circle"></view>
        </view>
        <text class="loading-text">正在规划路线...</text>
      </view>
    </view>
  </view>
</template>

<script>
import { doubaosendai, wenxinsendai, getass_token } from "../../api/ai";
import keys from '../../config/keys'

export default {
  data() {
    return {
      latitude: 39.909,
      longitude: 116.397,
      markers: [],
      polylines: [],
      locations: [],
      userDescription: '',
      loading: false,
      showPopup: false,
      amapKey: keys.AMAP.API_KEY,
      travelMode: 'walking',
      tabbarList: [
        {
          text: "校园地图",
          icon: "map-fill",
          index: 0,
          url: "/pages/map/map",
        },
        {
          text: "AI助手",
          icon: "server-fill",
          index: 1,
          url: "/pages/index/index",
        },
        {
          text: "AI旅游",
          icon: "car-fill",
          index: 2,
          url: "/pages/aimap/aimap",
        },
      ],
      tabbar: 2,
      // 更新文心一言配置
      aiConfig: {
        client_id: keys.WENXIN.CLIENT_ID,
        client_secret: keys.WENXIN.CLIENT_SECRET,
        accessToken: ''
      },
      // 添加当前城市信息
      currentCity: '',
      currentProvince: '',
      showRouteInfo: false,
      routeDescription: '',
      errorMessage: '',
      loadingStates: {
        location: false,
        planning: false,
        routing: false
      },
      // 添加历史路线数组
      historyRoutes: [],
      showHistory: false,
      currentHistoryIndex: 0, // 添加当前历史记录索引
    }
  },
  async created() {
    // 获取文心一言的access token
    try {
      const accessToken = await getass_token(this.aiConfig.client_id, this.aiConfig.client_secret)
      if (accessToken) {
        this.aiConfig.accessToken = accessToken
        console.log('获取access token成功')
      } else {
        console.error('获取access token失败')
      }
    } catch (error) {
      console.error('获取access token出错:', error)
    }

    // 从本地存储加载历史路线
    try {
      const savedRoutes = uni.getStorageSync('route_history')
      if (savedRoutes) {
        this.historyRoutes = savedRoutes
      }
    } catch (error) {
      console.error('加载历史路线失败:', error)
    }
  },
  onLoad() {
    // 获取当前位置
    uni.getLocation({
      type: 'gcj02',
      success: async (res) => {
        this.latitude = res.latitude
        this.longitude = res.longitude
        
        // 获取当前位置的城市信息
        try {
          const locationInfo = await this.getLocationInfo(res.latitude, res.longitude)
          if (locationInfo && locationInfo.addressComponent) {
            this.currentCity = locationInfo.addressComponent.city
            this.currentProvince = locationInfo.addressComponent.province
          }
        } catch (error) {
          console.error('获取城市信息失败:', error)
        }

        // 添加起点标记
        this.addMarker({
          latitude: res.latitude,
          longitude: res.longitude,
          title: '当前位置',
          iconPath: '/static/icons/start.svg',
        })
      }
    })
  },
  methods: {
    radioChange(e) {
      this.travelMode = e.detail.value
    },
    addMarker(markerInfo) {
      const marker = {
        id: this.markers.length,
        latitude: markerInfo.latitude,
        longitude: markerInfo.longitude,
        title: markerInfo.title,
        iconPath: markerInfo.iconPath || '/static/icons/destination.svg',
        width: 40,
        height: 40,
        anchor: {
          x: 0.5,
          y: 1
        },
        callout: {
          content: markerInfo.title,
          color: '#333333',
          fontSize: 14,
          borderRadius: 8,
          bgColor: '#ffffff',
          padding: 12,
          display: 'ALWAYS',
          textAlign: 'center',
          borderWidth: 1,
          borderColor: '#e0e0e0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }
      }
      this.markers.push(marker)
    },
    calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // 地球半径，单位公里
      const dLat = this.toRad(lat2 - lat1);
      const dLon = this.toRad(lon2 - lon1);
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
               Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
               Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    },
    toRad(value) {
      return value * Math.PI / 180;
    },
    // 去重并优化路线顺序
    async optimizeRoute(locations) {
      // 去重，保留每个地点第一次出现的时间
      const uniqueLocations = new Map()
      for (const loc of locations) {
        if (!uniqueLocations.has(loc.address)) {
          uniqueLocations.set(loc.address, loc)
        }
      }

      // 转换为数组
      let points = Array.from(uniqueLocations.values())

      // 获取所有地点的坐标
      const coordsPromises = points.map(async point => {
        const coords = await this.getLocationByAddress(point.address)
        return {
          ...point,
          coords
        }
      })

      points = await Promise.all(coordsPromises)

      // 按照距离排序（贪心算法）
      let sortedPoints = []
      let currentPoint = {
        coords: {
          latitude: this.latitude,
          longitude: this.longitude
        }
      }

      while (points.length > 0) {
        // 找到距离当前点最近的下一个点
        let minDistance = Infinity
        let nextPointIndex = -1

        for (let i = 0; i < points.length; i++) {
          if (!points[i].coords) continue
          const distance = this.calculateDistance(
            currentPoint.coords.latitude,
            currentPoint.coords.longitude,
            points[i].coords.latitude,
            points[i].coords.longitude
          )

          if (distance < minDistance) {
            minDistance = distance
            nextPointIndex = i
          }
        }

        if (nextPointIndex !== -1) {
          const nextPoint = points[nextPointIndex]
          sortedPoints.push({
            time: nextPoint.time,
            address: nextPoint.address
          })
          currentPoint = nextPoint
          points.splice(nextPointIndex, 1)
        } else {
          break
        }
      }

      // 重新分配时间
      if (sortedPoints.length > 0) {
        let currentTime = sortedPoints[0].time
        for (let i = 0; i < sortedPoints.length; i++) {
          sortedPoints[i].time = currentTime
          // 增加1.5小时
          const [hours, minutes] = currentTime.split(':')
          let newMinutes = parseInt(minutes) + 90
          let newHours = parseInt(hours)
          while (newMinutes >= 60) {
            newMinutes -= 60
            newHours++
          }
          currentTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
        }
      }

      return sortedPoints
    },
    async analyzeAndPlan() {
      if (!this.userDescription) {
        uni.showToast({
          title: '请输入您想去的地方描述',
          icon: 'none'
        })
        return
      }

      this.loadingStates.planning = true
      this.errorMessage = ''
      try {
        const aiResponse = await this.getAIResponse(this.userDescription)
        if (!aiResponse) {
          throw new Error('AI分析失败')
        }

        console.log('完整的AI响应:', aiResponse)
        
        // 保存路线描述
        this.routeDescription = aiResponse.text

        if (!aiResponse.structure || aiResponse.structure.length === 0) {
          const extractedLocations = this.extractLocationsFromText(aiResponse.text)
          if (extractedLocations.length === 0) {
            throw new Error('无法从AI回复中提取目的地')
          }
          aiResponse.structure = extractedLocations
        }

        // 清除之前的标记和路线
        this.markers = []
        this.polylines = []

        // 添加起点标记
        this.addMarker({
          latitude: this.latitude,
          longitude: this.longitude,
          title: '当前位置',
          iconPath: '/static/icons/start.svg',
        })

        // 处理有效地点
        let allRoutePoints = []
        let routeSegments = []

        // 获取所有地点的坐标
        let validLocations = []
        for (const location of aiResponse.structure) {
          try {
            const coords = await this.getLocationByAddress(location.address)
            if (coords) {
              validLocations.push({
                ...location,
                coords
              })
            }
          } catch (error) {
            console.warn(`跳过无效地点: ${location.address}`, error)
            continue
          }
        }

        // 如果没有任何有效地点
        if (validLocations.length === 0) {
          throw new Error('没有找到任何有效地点')
        }

        for (let i = 0; i < validLocations.length; i++) {
          const location = validLocations[i]
          // 添加地点标记
          this.addMarker({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            title: `${location.time} ${location.address}`,
            iconPath: '/static/icons/destination.svg',
          })

          // 规划到这个地点的路线
          const origin = i === 0 ? `${this.longitude},${this.latitude}`
            : `${validLocations[i-1].coords.longitude},${validLocations[i-1].coords.latitude}`
          const dest = `${location.coords.longitude},${location.coords.latitude}`
          
          try {
            const { points, mode, distance, steps, duration } = await this.getRoutes(origin, dest)
            if (points && points.length > 0) {
              routeSegments.push({
                from: i === 0 ? '当前位置' : validLocations[i-1].address,
                to: location.address,
                mode,
                distance,
                steps,
                duration
              })
              allRoutePoints = allRoutePoints.concat(points)
            }
          } catch (error) {
            console.warn(`路线规划失败: ${location.address}`, error)
            continue
          }
        }

        // 绘制完整的路线
        if (allRoutePoints.length > 0 && routeSegments.length > 0) {
          this.drawRoute(allRoutePoints, routeSegments)
        }

        // 更新路线描述，添加交通方式和时间信息
        this.routeDescription = this.routeDescription + '\n\n交通方式详情：\n' + 
          routeSegments.map(segment => 
            `${segment.from} → ${segment.to}：${this.getTransportMode(segment.mode)}（${segment.distance}公里，预计${this.formatDuration(segment.duration)}）`
          ).join('\n')

        // 调整地图视野
        this.updateMapView()

        // 显示路线介绍弹窗
        this.showRouteInfo = true

        // 在规划成功后保存到历史记录
        const historyItem = {
          id: Date.now(),
          date: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          description: this.userDescription,
          route: this.routeDescription
        }

        // 添加新记录到历史记录数组开头
        this.historyRoutes.unshift(historyItem)
        
        // 只保留最近10条记录
        if (this.historyRoutes.length > 10) {
          this.historyRoutes = this.historyRoutes.slice(0, 10)
        }

        // 保存到本地存储
        try {
          uni.setStorageSync('route_history', this.historyRoutes)
        } catch (error) {
          console.error('保存历史记录失败:', error)
        }

      } catch (error) {
        this.errorMessage = error.message || '规划失败，请重试'
        uni.showToast({
          title: this.errorMessage,
          icon: 'none',
          duration: 3000
        })
      } finally {
        this.loadingStates.planning = false
      }
    },
    async getAIResponse(userDescription) {
      try {
        // 获取当前位置的地理信息
        const locationInfo = await this.getLocationInfo(this.latitude, this.longitude)
        const currentLocation = locationInfo?.formatted || '当前位置'

        // 第一次调用文心一言获取文本格式的行程规划
        const data = {
          messages: [{
            role: 'user',
            content: `我现在在${currentLocation}，这是我的旅游想法：${userDescription}。
请帮我规划一条合理的旅游路线，要求：
1. 每个地点必须使用标准地址格式（例如：上海市黄浦区外滩）
2. 所有地点必须在${this.currentCity || '当前城市'}范围内
3. 按照以下格式回复：
- 建议出发时间
- 地点列表（每个地点包含名称和游玩时长）
- 简要路线说明（100字以内）`
          }]
        }

        const textReply = await wenxinsendai(data, this.aiConfig.accessToken)
        console.log('AI文本回复:', textReply)

        // 第二次调用文心一言，获取结构化数据
        const structureData = {
          messages: [{
            role: 'user',
            content: `请将以下行程安排转换为JSON数组，要求：
1. 格式为[{"time":"HH:mm","address":"标准地址"}]
2. 时间格式必须是24小时制，如"09:00"
3. 地址必须使用标准格式，如"${this.currentCity || '上海市'}黄浦区外滩"
4. 所有地点必须在${this.currentCity || '当前城市'}范围内
5. 只返回JSON数组，不要包含任何其他说明文字：\n${textReply}`
          }]
        }

        const jsonReply = await wenxinsendai(structureData, this.aiConfig.accessToken)
        console.log('AI结构化回复:', jsonReply)

        // 尝试提取JSON部分
        const jsonMatch = jsonReply.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0])
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            // 验证数据格式
            const isValidFormat = parsedData.every(item => 
              item.time && 
              typeof item.time === 'string' && 
              item.address && 
              typeof item.address === 'string'
            )
            if (isValidFormat) {
              return {
                text: textReply,
                structure: parsedData
              }
            }
          }
        }
        return null
      } catch (error) {
        console.error('AI请求失败:', error)
        return null
      }
    },
    // 获取位置信息
    getLocationInfo(latitude, longitude) {
      return new Promise((resolve, reject) => {
        uni.request({
          url: `https://restapi.amap.com/v3/geocode/regeo?key=${this.amapKey}&location=${longitude},${latitude}`,
          success: (res) => {
            if (res.data.status === '1' && res.data.regeocode) {
              resolve({
                formatted: res.data.regeocode.formatted_address,
                addressComponent: res.data.regeocode.addressComponent
              })
            } else {
              reject(new Error('获取位置信息失败'))
            }
          },
          fail: () => {
            reject(new Error('位置信息请求失败'))
          }
        })
      })
    },
    extractDestination(aiResponse) {
      try {
        // 尝试从AI回复中提取推荐地点
        const lines = aiResponse.split('\n')
        for (const line of lines) {
          if (line.includes('推荐地点') || line.includes('地点名称')) {
            const destination = line.split('：')[1]?.trim()
            if (destination) {
              return destination
            }
          }
        }
        // 如果没有找到格式化的内容，返回整个响应
        return aiResponse.trim()
      } catch (error) {
        console.error('提取目的地失败:', error)
        return aiResponse.trim()
      }
    },
    async planRoute(destination) {
      try {
        // 获取目的地坐标
        const location = await this.getLocationByAddress(destination)
        if (!location) {
          throw new Error('无法获取目的地坐标')
        }

        // 检查距离限制
        const distance = this.calculateDistance(
          this.latitude,
          this.longitude,
          location.latitude,
          location.longitude
        )

        // 根据不同出行方式检查距离限制
        switch (this.travelMode) {
          case 'walking':
            if (distance > 10) {
              throw new Error('步行路线规划距离不能超过10公里')
            }
            break
          case 'driving':
            if (distance > 500) {
              throw new Error('驾车路线规划距离不能超过500公里')
            }
            break
          case 'transit':
            if (distance > 200) {
              throw new Error('公交路线仅支持200公里以内的规划')
            }
            break
        }

        // 添加终点标记
        this.addMarker({
          latitude: location.latitude,
          longitude: location.longitude,
          title: destination,
          iconPath: '/static/icons/destination.svg',
        })

        // 规划路线
        const origin = `${this.longitude.toFixed(6)},${this.latitude.toFixed(6)}`
        const dest = `${location.longitude.toFixed(6)},${location.latitude.toFixed(6)}`
        
        const routes = await this.getRoutes(origin, dest)
        
        if (routes && routes.length > 0) {
          this.drawRoute(routes)
        } else {
          throw new Error('未找到合适的路线')
        }

        // 调整地图视野
        this.updateMapView()

      } catch (error) {
        throw error
      }
    },
    getLocationByAddress(address) {
      return new Promise((resolve, reject) => {
        // 处理地址
        let processedAddress = address
          .replace(/\([^)]*\)/g, '') // 移除英文括号及其内容
          .replace(/（[^）]*）/g, '') // 移除中文括号及其内容
          .replace(/\s+/g, '') // 移除空格
          .trim()

        // 验证处理后的地址是否为空
        if (!processedAddress) {
          reject(new Error(`无效的地址: ${address}`))
          return
        }

        // 发送请求
        uni.request({
          url: `https://restapi.amap.com/v3/geocode/geo`,
          method: 'GET',
          data: {
            key: this.amapKey,
            address: processedAddress,
            city: this.currentCity || ''
          },
          success: async (res) => {
            if (res.data.status === '1' && res.data.geocodes && res.data.geocodes.length > 0) {
              const location = res.data.geocodes[0].location.split(',')
              resolve({
                longitude: parseFloat(location[0]),
                latitude: parseFloat(location[1])
              })
            } else if (res.data.infocode === '10021') {
              // API 配额超限，尝试使用备用密钥
              try {
                const backupKey = '28627de34b2c0c5f6f9ad1b36fd0c927'
                const backupRes = await uni.request({
                  url: `https://restapi.amap.com/v3/geocode/geo`,
                  method: 'GET',
                  data: {
                    key: backupKey,
                    address: processedAddress,
                    city: this.currentCity || ''
                  }
                })
                
                if (backupRes.data.status === '1' && backupRes.data.geocodes && backupRes.data.geocodes.length > 0) {
                  const location = backupRes.data.geocodes[0].location.split(',')
              resolve({
                longitude: parseFloat(location[0]),
                latitude: parseFloat(location[1])
              })
            } else {
                  reject(new Error(`无法解析地址: ${address}`))
                }
              } catch (error) {
                reject(new Error(`备用密钥请求失败: ${address}`))
              }
            } else {
              reject(new Error(`无法解析地址: ${address}`))
            }
          },
          fail: () => {
            reject(new Error(`地址解析请求失败: ${address}`))
          }
        })
      })
    },
    // 添加延迟重试机制
    async retryRequest(fn, retries = 3, delay = 1000) {
      for (let i = 0; i < retries; i++) {
        try {
          return await fn()
        } catch (error) {
          if (i === retries - 1) throw error
          await new Promise(resolve => setTimeout(resolve, delay))
          console.log(`重试第 ${i + 1} 次...`)
        }
      }
    },
    // 修改 getRoutes 方法，添加重试机制
    async getRoutes(origin, destination) {
      const getRoutesRequest = () => {
      return new Promise((resolve, reject) => {
          // 计算两点之间的直线距离
          const [originLng, originLat] = origin.split(',').map(Number)
          const [destLng, destLat] = destination.split(',').map(Number)
          const distance = this.calculateDistance(originLat, originLng, destLat, destLng)
          
          // 根据距离自动选择出行方式
          let mode = 'driving'
          if (distance <= 2) {
            mode = 'walking'
          } else if (distance <= 10) {
            mode = 'transit'
          }

        let url = ''
        const baseParams = `key=${this.amapKey}&origin=${origin}&destination=${destination}`
        
          switch (mode) {
          case 'walking':
            url = `https://restapi.amap.com/v3/direction/walking?${baseParams}`
            break
          case 'transit':
              url = `https://restapi.amap.com/v3/direction/transit/integrated?${baseParams}&city=${this.currentCity || '上海'}&strategy=0`
            break
          case 'driving':
            url = `https://restapi.amap.com/v3/direction/driving?${baseParams}&show_fields=cost`
            break
        }

        uni.request({
          url: url,
          success: (res) => {
            if (res.data.status === '1') {
                let allPoints = []
                let steps = []
                let routeFound = false
                let duration = 0
              
                if (mode === 'walking' && res.data.route?.paths?.[0]) {
                  routeFound = true
                  const path = res.data.route.paths[0]
                  path.steps.forEach(step => {
                    const polyline = step.polyline.split(';')
                    const points = polyline.map(point => {
                      const [lng, lat] = point.split(',')
                      return {
                        longitude: parseFloat(lng),
                        latitude: parseFloat(lat)
                      }
                    })
                    steps.push({ points })
                    allPoints = allPoints.concat(points)
                  })
                  duration = parseInt(path.duration) || 0
                } else if (mode === 'transit' && res.data.route?.transits?.[0]) {
                  routeFound = true
                  const transit = res.data.route.transits[0]
                  let segmentPoints = []
                  
                  transit.segments.forEach(segment => {
                    // 处理步行部分
                    if (segment.walking?.steps) {
                      segment.walking.steps.forEach(step => {
                        const polyline = step.polyline.split(';')
                        const points = polyline.map(point => {
                          const [lng, lat] = point.split(',')
                          return {
                            longitude: parseFloat(lng),
                            latitude: parseFloat(lat)
                          }
                        })
                        segmentPoints = segmentPoints.concat(points)
                      })
                    }
                    
                    // 处理公交部分
                    if (segment.bus?.buslines?.[0]) {
                      const busline = segment.bus.buslines[0]
                      const polyline = busline.polyline.split(';')
                      const points = polyline.map(point => {
                        const [lng, lat] = point.split(',')
                        return {
                          longitude: parseFloat(lng),
                          latitude: parseFloat(lat)
                        }
                      })
                      segmentPoints = segmentPoints.concat(points)
                    }
                    
                    // 如果有足够的点，添加为一个步骤
                    if (segmentPoints.length > 0) {
                      steps.push({ points: segmentPoints })
                      allPoints = allPoints.concat(segmentPoints)
                      segmentPoints = []
                    }
                  })
                  duration = parseInt(transit.duration) || 0
                } else if (mode === 'driving' && res.data.route?.paths?.[0]) {
                  routeFound = true
                  const path = res.data.route.paths[0]
                  path.steps.forEach(step => {
                    if (step.polyline) {
                    const polyline = step.polyline.split(';')
                      const points = polyline.map(point => {
                      const [lng, lat] = point.split(',')
                        return {
                        longitude: parseFloat(lng),
                        latitude: parseFloat(lat)
                        }
                      })
                      steps.push({ points })
                      allPoints = allPoints.concat(points)
                    }
                  })
                  duration = parseInt(path.duration) || 0
                }
                
                if (!routeFound || allPoints.length === 0) {
                  // 如果没有找到路线或点数据为空，使用直线连接
                  const points = [{
                    longitude: parseFloat(originLng),
                    latitude: parseFloat(originLat)
                  }, {
                    longitude: parseFloat(destLng),
                    latitude: parseFloat(destLat)
                  }]
                  steps = [{ points }]
                  allPoints = points
                  // 使用直线距离估算时间
                  duration = Math.round(distance * 12 * 60) // 假设平均速度为12km/h
                }
                
                resolve({
                  points: allPoints,
                  mode,
                  distance: distance.toFixed(1),
                  steps,
                  duration
                })
              } else if (res.data.infocode === '10021') {
                reject(new Error('API配额超限'))
            } else {
              reject(new Error(res.data.info || '路线规划失败'))
            }
          },
          fail: () => {
            reject(new Error('路线规划请求失败'))
          }
        })
      })
      }

      try {
        const result = await this.retryRequest(getRoutesRequest)
        // 确保返回的点数据是有效的
        if (!result.points || result.points.length === 0) {
          throw new Error('路线点数据无效')
        }
        return result
      } catch (error) {
        console.error('路线规划失败:', error)
        // 如果API调用失败，返回直线连接
        const [originLng, originLat] = origin.split(',')
        const [destLng, destLat] = destination.split(',')
        const points = [{
          longitude: parseFloat(originLng),
          latitude: parseFloat(originLat)
        }, {
          longitude: parseFloat(destLng),
          latitude: parseFloat(destLat)
        }]
        const distance = this.calculateDistance(
          parseFloat(originLat),
          parseFloat(originLng),
          parseFloat(destLat),
          parseFloat(destLng)
        )
        return {
          points,
          mode: 'driving',
          distance: distance.toFixed(1),
          steps: [{ points }],
          duration: Math.round(distance * 12 * 60) // 使用直线距离估算时间
        }
      }
    },
    drawRoute(points, segments) {
      // 为每种交通方式使用不同的样式
      const styles = {
        walking: {
          color: '#2196F3',  // 蓝色
          width: 8,
          dottedLine: false,
          arrowWidth: 6
        },
        transit: {
          color: '#4CAF50',  // 绿色
          width: 8,
          dottedLine: false,
          arrowWidth: 6
        },
        driving: {
          color: '#FF5722',  // 橙色
          width: 8,
          dottedLine: false,
          arrowWidth: 6
        }
      }

      // 计算每段路线的点
      let startIndex = 0
      this.polylines = segments.map((segment, index) => {
        // 计算当前段的点数
        const pointCount = segment.steps?.reduce((sum, step) => sum + step.points.length, 0) || 0
        const segmentPoints = points.slice(startIndex, startIndex + pointCount)
        startIndex += pointCount

        // 如果是最后一段，并且还有剩余的点，则全部加入
        if (index === segments.length - 1 && startIndex < points.length) {
          segmentPoints.push(...points.slice(startIndex))
        }

        // 计算路段中点位置，用于显示时间标签
        const midPointIndex = Math.floor(segmentPoints.length / 2)
        const midPoint = segmentPoints[midPointIndex]
        
        // 添加时间标签标记
        if (segment.duration) {
          this.markers.push({
            id: `time_${index}`,
            latitude: midPoint.latitude,
            longitude: midPoint.longitude,
            width: 0,
            height: 0,
            anchor: { x: 0.5, y: 0.5 },
            callout: {
              content: this.formatDuration(segment.duration),
              color: '#ffffff',
              fontSize: 12,
              borderRadius: 8,
              bgColor: styles[segment.mode].color,
              padding: '6rpx 12rpx',
              display: 'ALWAYS',
              textAlign: 'center',
              borderWidth: 0,
              anchorY: 0
            }
          })
        }

        return {
          points: segmentPoints,
          ...styles[segment.mode],
          arrowLine: true,
          borderWidth: 2.5,
          borderColor: '#ffffff',
          level: 'aboveroads',
          strokeStyle: 'solid',
          lineCap: 'round',
          lineJoin: 'round',
          arrowIconPath: '/static/icons/arrow.svg',
          colorList: [styles[segment.mode].color, styles[segment.mode].color], // 纯色
          zIndex: 100
        }
      })
    },
    updateMapView() {
      const mapContext = uni.createMapContext('map')
      mapContext.includePoints({
        points: this.markers,
        padding: [80, 80, 80, 80]
      })
    },
    changeTabbar(row) {
      if (row === 0) {
        uni.switchTab({
          url: `/pages/map/map`,
        });
      } else if (row === 1) {
        uni.switchTab({
          url: `/pages/index/index`,
        });
      } else if (row === 2) {
        uni.switchTab({
          url: `/pages/aimap/aimap`,
        });
      }
    },
    // 获取当前城市
    getCurrentCity() {
      // 这里可以根据实际需求获取城市编码
      // 可以通过高德地图逆地理编码接口获取
      // 暂时返回默认值
      return '全国'
    },
    async handlePlan() {
      if (this.loading) return // 防止重复点击
      if (!this.userDescription) {
        uni.showToast({
          title: '请输入您想去的地方描述',
          icon: 'none'
        })
        return
      }
      
      try {
        this.loading = true
        await this.analyzeAndPlan()
        // 规划成功后再关闭输入弹窗
        this.showPopup = false
      } catch (error) {
        this.errorMessage = error.message || '规划失败，请重试'
        uni.showToast({
          title: this.errorMessage,
          icon: 'none',
          duration: 3000
        })
      } finally {
        this.loading = false
      }
    },
    // 从文本中提取地点信息
    extractLocationsFromText(text) {
      const locations = []
      const lines = text.split('\n')
      let currentTime = '09:00' // 默认起始时间

      for (const line of lines) {
        // 匹配地点名称，通常在冒号后面
        const locationMatch = line.match(/[:：](.*?)(?:，|。|（|\(|$)/)
        if (locationMatch) {
          const address = locationMatch[1].trim()
          if (address && !address.includes('时间')) {
            locations.push({
              time: currentTime,
              address: address
            })
            // 递增时间，假设每个地点间隔1.5小时
            const [hours, minutes] = currentTime.split(':')
            let newMinutes = parseInt(minutes) + 90 // 增加90分钟
            let newHours = parseInt(hours)
            while (newMinutes >= 60) {
              newMinutes -= 60
              newHours++
            }
            currentTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
          }
        }
      }
      return locations
    },
    getTransportMode(mode) {
      switch(mode) {
        case 'walking':
          return '步行'
        case 'transit':
          return '公交'
        case 'driving':
          return '驾车'
        default:
          return '未知方式'
      }
    },
    // 格式化时间显示
    formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      
      if (hours > 0) {
        return `${hours}小时${minutes}分钟`
      }
      return `${minutes}分钟`
    },
    async reuseRoute(item) {
      this.userDescription = item.description
      await this.handlePlan()
    },
    async deleteHistory(index) {
      this.historyRoutes.splice(index, 1)
      uni.setStorageSync('route_history', this.historyRoutes)
    },
    // 添加轮播图切换事件处理
    onSwiperChange(e) {
      this.currentHistoryIndex = e.detail.current;
    }
  }
}
</script>

<style lang="scss" scoped>
.aimap-container {
  width: 100%;
  height: 100vh;
  position: relative;
  
  .map {
    width: 100%;
    height: calc(100% - 52px);
  }
  
  .float-button {
    position: fixed;
    right: 30rpx;
    bottom: 140rpx;
    width: 110rpx;
    height: 110rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 20px rgba(79, 172, 254, 0.3);
    z-index: 100;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    animation: float 3s ease-in-out infinite;

    .icon-image {
      width: 60rpx;
      height: 60rpx;
      transition: transform 0.3s ease;
    }

    &:active {
      transform: scale(0.92);
      box-shadow: 0 3px 10px rgba(79, 172, 254, 0.2);
      
      .icon-image {
        transform: scale(0.9);
      }
    }
  }

  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  .custom-popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;

    .popup-mask {
    position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    }

    .popup-content {
      position: relative;
      width: 600rpx;
      padding: 40rpx;
      background: rgba(255, 255, 255, 0.98);
      border-radius: 24rpx;
      z-index: 1000;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
      animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: center bottom;

      .popup-title {
        font-size: 38rpx;
        font-weight: 600;
        color: #333;
        text-align: center;
        margin-bottom: 40rpx;
        position: relative;
        padding-bottom: 20rpx;
        letter-spacing: 2rpx;

        &::after {
          content: '';
    position: absolute;
          bottom: 0;
    left: 50%;
    transform: translateX(-50%);
          width: 60rpx;
          height: 4rpx;
          background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
          border-radius: 4rpx;
          transition: width 0.3s ease;
        }

        &:hover::after {
          width: 100rpx;
        }
      }

      .input-box {
        margin-bottom: 20rpx;
        border: 2rpx solid #eef2ff;
        border-radius: 16rpx;
    padding: 20rpx;
        background: #f8faff;
        transition: all 0.3s ease;
        
        &:focus-within {
          border-color: #4facfe;
          box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
        }

    .destination-input {
          width: 100%;
          min-height: 120rpx;
          font-size: 28rpx;
          line-height: 1.6;
          color: #333;
          padding: 10rpx;

          &::placeholder {
            color: #a0aec0;
          }
        }
    }

      .submit-btn {
        width: 100%;
        height: 88rpx;
        line-height: 88rpx;
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: #fff;
        font-size: 32rpx;
        font-weight: 500;
        border-radius: 16rpx;
        border: none;
        margin-top: 20rpx;
        letter-spacing: 2rpx;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(79, 172, 254, 0.2);

        &:active {
          transform: translateY(2rpx);
          box-shadow: 0 2px 8px rgba(79, 172, 254, 0.15);
          opacity: 0.95;
        }
      }
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40rpx);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .route-info-button {
    position: fixed;
    right: 30rpx;
    bottom: 280rpx;
    width: 110rpx;
    height: 110rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 20px rgba(238, 82, 83, 0.3);
    z-index: 100;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    animation: float 3s ease-in-out infinite;

    .icon-image {
      width: 60rpx;
      height: 60rpx;
      transition: transform 0.3s ease;
    }

    &:active {
      transform: scale(0.92);
      box-shadow: 0 3px 10px rgba(238, 82, 83, 0.2);
      
      .icon-image {
        transform: scale(0.9);
      }
    }
  }

  .route-info {
    .route-description {
      max-height: 60vh;
      margin: 20rpx 0 40rpx;
      padding: 30rpx;
      background: #f8faff;
      border-radius: 16rpx;
      font-size: 28rpx;
      line-height: 1.8;
      color: #4a5568;
      white-space: pre-wrap;
    }

    .close-btn {
      width: 100%;
      height: 88rpx;
      line-height: 88rpx;
      background: #f1f5f9;
      color: #64748b;
      font-size: 32rpx;
      font-weight: 500;
      border-radius: 16rpx;
      border: none;
      transition: all 0.3s ease;

      &:active {
        background: #e2e8f0;
        transform: translateY(2rpx);
      }
    }
  }

  .route-legend {
    position: fixed;
    left: 30rpx;
    bottom: 140rpx;
    background: rgba(255, 255, 255, 0.9);
    padding: 16rpx 24rpx;
    border-radius: 16rpx;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .color-block {
        width: 40rpx;
        height: 8rpx;
        border-radius: 4rpx;
      }

      text {
        font-size: 24rpx;
        color: #333;
      }
    }
  }

  .custom-loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;

    .loading-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
    }

    .loading-content {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20rpx;
      padding: 40rpx;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20rpx;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      animation: fadeInScale 0.3s ease;
    }

    .loading-spinner {
      width: 80rpx;
      height: 80rpx;
      position: relative;
    }

    .loading-circle {
      width: 100%;
      height: 100%;
      border: 6rpx solid #f3f3f3;
      border-top: 6rpx solid #4facfe;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-text {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .history-button {
    position: fixed;
    right: 30rpx;
    bottom: 420rpx;
    width: 110rpx;
    height: 110rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #A8E6CF 0%, #3BB78F 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 20px rgba(59, 183, 143, 0.3);
    z-index: 100;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    animation: float 3s ease-in-out infinite;

    .icon-image {
      width: 60rpx;
      height: 60rpx;
      transition: transform 0.3s ease;
    }

    &:active {
      transform: scale(0.92);
      box-shadow: 0 3px 10px rgba(59, 183, 143, 0.2);
      
      .icon-image {
        transform: scale(0.9);
      }
    }
  }

  .history-content {
    width: 680rpx;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    padding: 0;
    background: #ffffff;
    border-radius: 24rpx;
    overflow: hidden;

    .popup-header {
      padding: 40rpx 40rpx 30rpx;
      text-align: center;
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

      .popup-title {
        font-size: 36rpx;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 12rpx;
        letter-spacing: 2rpx;
      }

      .popup-subtitle {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.9);
      }
    }

    .history-list {
      flex: 1;
      padding: 40rpx;
      overflow-y: auto;
      max-height: calc(85vh - 200rpx);
      background: #f8faff;
    }

    .history-item {
      background: #ffffff;
      border-radius: 20rpx;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      border: none;
      padding: 40rpx;
      margin-bottom: 40rpx;
      transition: all 0.3s ease;

      &:last-child {
        margin-bottom: 0;
      }

      &:hover {
        transform: translateY(-2rpx);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }

      .history-header {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        gap: 20rpx;
        margin-bottom: 30rpx;
        padding-bottom: 30rpx;
        border-bottom: 2rpx solid #f0f0f0;

        .header-left {
          display: flex;
          align-items: center;
          gap: 20rpx;

          .history-index {
            font-size: 32rpx;
            color: #4facfe;
            font-weight: 600;
            background: rgba(79, 172, 254, 0.1);
            padding: 10rpx 24rpx;
            border-radius: 30rpx;
          }

          .history-date {
            font-size: 28rpx;
            color: #666;
            background: #f8faff;
            padding: 10rpx 24rpx;
            border-radius: 30rpx;
            border: 2rpx solid #eef2ff;
          }
        }

        .history-actions {
          display: flex;
          gap: 20rpx;

          .action-btn {
            display: flex;
            align-items: center;
            gap: 8rpx;
            font-size: 28rpx;
            padding: 16rpx 28rpx;
            border-radius: 30rpx;
            border: none;
            line-height: 1.5;
            margin: 0;
            transition: all 0.3s ease;

            .btn-icon {
              font-size: 32rpx;
            }

            &.reuse {
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
              color: #ffffff;
              box-shadow: 0 4px 12px rgba(79, 172, 254, 0.2);
              
              &:active {
                transform: translateY(2rpx);
                box-shadow: 0 2px 6px rgba(79, 172, 254, 0.15);
              }
            }

            &.delete {
              background: #fef2f2;
              color: #dc2626;
              border: 2rpx solid #fee2e2;
              
              &:active {
                background: #fee2e2;
                transform: translateY(2rpx);
              }
            }
          }
        }
      }

      .history-content-box {
        .history-description, .history-route {
          margin-bottom: 30rpx;

          .label {
            display: inline-block;
            font-size: 30rpx;
            color: #4b5563;
            margin-bottom: 16rpx;
            font-weight: 500;
            background: #f8faff;
            padding: 8rpx 20rpx;
            border-radius: 8rpx;
          }

          text {
            display: block;
            font-size: 28rpx;
            color: #1f2937;
            line-height: 1.8;
            padding: 0 20rpx;
          }
        }

        .history-route {
          margin-top: 20rpx;
          padding-top: 30rpx;
          border-top: 2rpx dashed #e5e7eb;
          white-space: pre-wrap;
        }
      }
    }

    .history-footer {
      padding: 40rpx;
      background: #ffffff;
      border-top: none;
      box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.03);

      .close-btn {
        width: 100%;
        height: 88rpx;
        line-height: 88rpx;
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: #ffffff;
        font-size: 32rpx;
        font-weight: 500;
        border-radius: 16rpx;
        border: none;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(79, 172, 254, 0.2);

        &:active {
          transform: translateY(2rpx);
          box-shadow: 0 2px 6px rgba(79, 172, 254, 0.15);
          opacity: 0.95;
        }
      }
    }
  }

  // 添加指示点样式
  :deep(.uni-swiper-dots) {
    bottom: 20rpx;
  }

  :deep(.uni-swiper-dot) {
    width: 16rpx;
    height: 16rpx;
    border-radius: 8rpx;
    margin: 0 8rpx;
    background: rgba(0, 0, 0, 0.2);
    
    &.uni-swiper-dot-active {
      width: 24rpx;
      background: #4facfe;
    }
  }
}
</style> 