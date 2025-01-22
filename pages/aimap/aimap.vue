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
      <view class="travel-mode">
          <radio-group @change="radioChange">
            <label class="radio-item" v-for="(item, index) in travelModes" :key="index">
              <radio :value="item.value" :checked="travelMode === item.value" />
              <text>{{item.label}}</text>
            </label>
          </radio-group>
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
  </view>
</template>

<script>
import { doubaosendai, wenxinsendai, getass_token } from "../../api/ai";

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
      amapKey: 'ffdbb001fd0b4cc024456334e9aa6567',
      travelMode: 'walking',
      travelModes: [
        { label: '步行', value: 'walking' },
        { label: '公交', value: 'transit' },
        { label: '驾车', value: 'driving' }
      ],
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
        client_id: 'NOmMXwgcqRGLGy6UuqBSvbd8',
        client_secret: 'ALKWzzz2HTGpEn4mOTxqwPQd5WakeCkf',
        accessToken: '' // 将在created中获取
      },
      // 添加当前城市信息
      currentCity: '',
      currentProvince: '',
      showRouteInfo: false,
      routeDescription: ''
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

      this.loading = true
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

        // 规划路线
        let lastPoint = {
          latitude: this.latitude,
          longitude: this.longitude
        }
        let allRoutePoints = []
        let validLocations = []

        // 处理每个地点
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

        // 按照距离排序
        validLocations.sort((a, b) => {
          const distanceA = this.calculateDistance(
            lastPoint.latitude,
            lastPoint.longitude,
            a.coords.latitude,
            a.coords.longitude
          )
          const distanceB = this.calculateDistance(
            lastPoint.latitude,
            lastPoint.longitude,
            b.coords.latitude,
            b.coords.longitude
          )
          return distanceA - distanceB
        })

        // 处理有效地点
        for (const location of validLocations) {
          // 添加地点标记
          this.addMarker({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            title: `${location.time} ${location.address}`,
            iconPath: '/static/icons/destination.svg',
          })

          // 规划到这个地点的路线
          const origin = `${lastPoint.longitude.toFixed(6)},${lastPoint.latitude.toFixed(6)}`
          const dest = `${location.coords.longitude.toFixed(6)},${location.coords.latitude.toFixed(6)}`
          
          try {
            const routes = await this.getRoutes(origin, dest)
            if (routes && routes.length > 0) {
              // 如果不是第一段路线，移除重复的起点
              if (allRoutePoints.length > 0) {
                routes.shift()
              }
              allRoutePoints = allRoutePoints.concat(routes)
            }
          } catch (error) {
            console.warn(`路线规划失败: ${location.address}`, error)
            // 如果路线规划失败，使用直线连接
            if (allRoutePoints.length > 0) {
              allRoutePoints.push(location.coords)
            } else {
              allRoutePoints.push(lastPoint, location.coords)
            }
          }

          lastPoint = location.coords
        }

        // 绘制完整的路线
        if (allRoutePoints.length > 0) {
          this.drawRoute(allRoutePoints)
        }

        // 调整地图视野
        this.updateMapView()

        // 显示路线介绍弹窗
        this.showRouteInfo = true

      } catch (error) {
        uni.showToast({
          title: error.message || 'AI分析失败',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.loading = false
      }
    },
    async getAIResponse(userDescription) {
      try {
        // 获取当前位置的地理信息
        const locationInfo = await this.getLocationInfo(this.latitude, this.longitude)
        const currentLocation = locationInfo || '当前位置'

        // 第一次调用文心一言获取文本格式的行程规划
        const data = {
          messages: [{
            role: 'user',
            content: `我现在在${currentLocation}，这是我的旅游想法：${userDescription}。
请帮我规划一条合理的旅游路线，要求：
1. 每个地点必须使用标准地址格式（例如：上海市黄浦区外滩）
2. 地点必须在上海市范围内，且相邻地点间距不超过30公里
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
3. 地址必须使用标准格式，如"上海市黄浦区外滩"
4. 只返回JSON数组，不要包含任何其他说明文字：\n${textReply}`
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
          let url = ''
          const baseParams = `key=${this.amapKey}&origin=${origin}&destination=${destination}`
          
          switch (this.travelMode) {
            case 'walking':
              url = `https://restapi.amap.com/v3/direction/walking?${baseParams}`
              break
            case 'transit':
              url = `https://restapi.amap.com/v3/direction/transit/integrated?${baseParams}&city=${this.getCurrentCity()}`
              break
            case 'driving':
              url = `https://restapi.amap.com/v3/direction/driving?${baseParams}&show_fields=cost`
              break
          }

          uni.request({
            url: url,
            success: (res) => {
              if (res.data.status === '1') {
                let points = []
                
                if (this.travelMode === 'walking') {
                  if (res.data.route && res.data.route.paths && res.data.route.paths[0]) {
                    const path = res.data.route.paths[0]
                    path.steps.forEach(step => {
                      const polyline = step.polyline.split(';')
                      polyline.forEach(point => {
                        const [lng, lat] = point.split(',')
                        points.push({
                          longitude: parseFloat(lng),
                          latitude: parseFloat(lat)
                        })
                      })
                    })
                  } else {
                    reject(new Error('无法获取步行路线'))
                    return
                  }
                } else if (this.travelMode === 'transit') {
                  if (res.data.route && res.data.route.transits && res.data.route.transits[0]) {
                    const transits = res.data.route.transits[0]
                    transits.segments.forEach(segment => {
                      if (segment.walking && segment.walking.steps) {
                        segment.walking.steps.forEach(step => {
                          const polyline = step.polyline.split(';')
                          polyline.forEach(point => {
                            const [lng, lat] = point.split(',')
                            points.push({
                              longitude: parseFloat(lng),
                              latitude: parseFloat(lat)
                            })
                          })
                        })
                      }
                      if (segment.bus && segment.bus.buslines && segment.bus.buslines[0]) {
                        const polyline = segment.bus.buslines[0].polyline.split(';')
                        polyline.forEach(point => {
                          const [lng, lat] = point.split(',')
                          points.push({
                            longitude: parseFloat(lng),
                            latitude: parseFloat(lat)
                          })
                        })
                      }
                    })
                  } else {
                    reject(new Error('无法获取公交路线'))
                    return
                  }
                } else if (this.travelMode === 'driving') {
                  if (res.data.route && res.data.route.paths && res.data.route.paths[0]) {
                    const path = res.data.route.paths[0]
                    path.steps.forEach(step => {
                      if (step.polyline) {
                        const polyline = step.polyline.split(';')
                        polyline.forEach(point => {
                          const [lng, lat] = point.split(',')
                          points.push({
                            longitude: parseFloat(lng),
                            latitude: parseFloat(lat)
                          })
                        })
                      }
                    })
                  } else {
                    reject(new Error('无法获取驾车路线'))
                    return
                  }
                }
                
                if (points.length === 0) {
                  reject(new Error('路线点数据为空'))
                  return
                }
                
                resolve(points)
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
        const points = await this.retryRequest(getRoutesRequest)
        if (!points || points.length === 0) {
          throw new Error('未获取到有效路线点')
        }
        return points
      } catch (error) {
        console.error('路线规划失败:', error)
        // 如果是配额超限，使用直线连接两点
        if (error.message === 'API配额超限') {
          const [originLng, originLat] = origin.split(',')
          const [destLng, destLat] = destination.split(',')
          return [{
            longitude: parseFloat(originLng),
            latitude: parseFloat(originLat)
          }, {
            longitude: parseFloat(destLng),
            latitude: parseFloat(destLat)
          }]
        }
        throw error
      }
    },
    drawRoute(points) {
      // 使用单一路线，优化样式
      this.polylines = [{
        points: points,
        color: '#4facfe',
        width: 6,
        arrowLine: true,
        borderWidth: 1.5,
        borderColor: '#ffffff',
        level: 'aboveroads',
        colorList: ['#4facfe', '#00f2fe'],
        dottedLine: false,
        arrowIconPath: '/static/icons/arrow.svg',
        strokeStyle: 'solid',
        lineCap: 'round',
        lineJoin: 'round'
      }]
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
      await this.analyzeAndPlan()
      if (!this.loading) {
        this.showPopup = false
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
        margin-bottom: 40rpx;
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

    .travel-mode {
        margin-bottom: 40rpx;
        padding: 10rpx;

        radio-group {
          display: flex;
          justify-content: space-around;
          background: #f8faff;
          border-radius: 16rpx;
          padding: 16rpx;
        }

        .radio-item {
          margin-right: 30rpx;
          font-size: 28rpx;
          display: flex;
          align-items: center;
          padding: 10rpx 20rpx;
          border-radius: 12rpx;
          transition: all 0.3s ease;
          
          &:last-child {
            margin-right: 0;
          }

          radio {
            margin-right: 8rpx;
            transform: scale(0.9);
          }

          text {
            color: #4a5568;
          }

          &:active {
            background: rgba(79, 172, 254, 0.1);
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
}
</style> 