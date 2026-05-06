export function chooseLocationCompat(options = {}) {
  const {
    latitude,
    longitude,
    success,
    fail
  } = options

  uni.chooseLocation({
    latitude,
    longitude,
    success,
    fail: (error) => {
      if (typeof fail === 'function') {
        fail(error)
        return
      }

      uni.showToast({
        title: 'Current platform does not support map picking',
        icon: 'none'
      })
    }
  })
}

export function makePhoneCallCompat(phoneNumber) {
  if (!phoneNumber) {
    uni.showToast({
      title: 'Phone number is missing',
      icon: 'none'
    })
    return
  }

  uni.makePhoneCall({
    phoneNumber,
    fail: () => {
      uni.showToast({
        title: 'Phone calls are unavailable here',
        icon: 'none'
      })
    }
  })
}
