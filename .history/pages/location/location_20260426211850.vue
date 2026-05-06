<template>
  <view class="page">
    <view class="toolbar">
      <text class="title">附近</text>
      <button class="ghost" @click="getLocation">刷新</button>
    </view>

    <view class="card">
      <text class="label">当前位置</text>
      <text class="value">{{ displayLocation }}</text>
      <view class="row">
        <button class="primary" @click="chooseLocation">地图选点</button>
        <button class="ghost" @click="submitLocation">保存</button>
      </view>
    </view>

    <view class="list">
      <view class="item" v-for="car in carList" :key="car.id" @click="viewCarDetail(car)">
        <image class="thumb" :src="car.image" mode="aspectFill"></image>
        <view class="meta">
          <text class="name">{{ car.name }}</text>
          <text class="price">{{ car.price }}万</text>
          <text class="seller">{{ car.seller }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { request } from '../../utils/api'
import { chooseLocationCompat } from '../../utils/platform'

export default {
  data() {
    return {
      carList: [
        {
          id: 1,
          name: '丰田 卡罗拉 2020款',
          price: '12.8',
          seller: '经销商',
          image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400'
        },
        {
          id: 2,
          name: '本田 思域 2019款',
          price: '11.5',
          seller: '个人卖家',
          image: 'https://images.unsplash.com/photo-1605816988066-b0a0ce0a166a?w=400'
        }
      ],
      province: '',
      city: '',
      district: '',
      latitude: null,
      longitude: null,
      userId: 1
    }
  },
  computed: {
    displayLocation() {
      return [this.province, this.city, this.district].filter(Boolean).join(' ') || '暂无定位信息'
    }
  },
  onLoad() {
    this.getLocation()
  },
  methods: {
    viewCarDetail(car) {
      uni.showToast({
        title: car.name,
        icon: 'none'
      })
    },
    getLocation() {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.latitude = res.latitude
          this.longitude = res.longitude
          this.city = '当前位置'
          this.district = `${res.latitude.toFixed(4)}, ${res.longitude.toFixed(4)}`
        },
        fail: () => {
          uni.showToast({
            title: '定位失败',
            icon: 'none'
          })
        }
      })
    },
    chooseLocation() {
      chooseLocationCompat({
        latitude: this.latitude || undefined,
        longitude: this.longitude || undefined,
        success: (res) => {
          this.latitude = res.latitude || this.latitude
          this.longitude = res.longitude || this.longitude
          this.city = res.name || this.city || '地图位置'
          this.district = res.address || res.name || this.district
        },
        fail: () => {
          uni.showToast({
            title: '地图选点不可用',
            icon: 'none'
          })
        }
      })
    },
    submitLocation() {
      if (this.displayLocation === '暂无定位信息') {
        uni.showToast({
          title: '请先获取定位',
          icon: 'none'
        })
        return
      }

      request({
        url: '/api/user/save-location',
        method: 'POST',
        data: {
          userId: this.userId,
          province: this.province,
          city: this.city,
          district: this.district,
          latitude: this.latitude,
          longitude: this.longitude
        },
        success: () => {
          uni.showToast({
            title: '已保存',
            icon: 'success'
          })
        },
        fail: () => {
          uni.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  background: #faf5ff;
}

.toolbar,
.card,
.item {
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(124, 58, 237, 0.08);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}

.card {
  margin-top: 24rpx;
  padding: 24rpx;
}

.label,
.seller {
  color: #64748b;
  font-size: 24rpx;
}

.value {
  display: block;
  margin-top: 12rpx;
  font-size: 30rpx;
  color: #0f172a;
}

.row {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.primary,
.ghost {
  flex: 1;
  border-radius: 14rpx;
}

.primary {
  background: #2563eb;
  color: #ffffff;
}

.ghost {
  background: #eff6ff;
  color: #2563eb;
}

.primary::after,
.ghost::after {
  border: none;
}

.list {
  margin-top: 24rpx;
}

.item {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.thumb {
  width: 180rpx;
  height: 140rpx;
  border-radius: 16rpx;
  background: #f1f5f9;
}

.meta {
  flex: 1;
}

.name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.price {
  display: block;
  margin-top: 12rpx;
  font-size: 30rpx;
  color: #7c3aed;
  font-weight: 600;
}
</style>
