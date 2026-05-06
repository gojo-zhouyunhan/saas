<template>
  <div class="min-h-screen bg-background font-inter text-text">
    <!-- 导航栏 -->
    <nav class="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <img src="/static/logo.png" alt="二手车交易平台" class="h-10 w-auto mr-3">
            <h1 class="text-2xl font-bold text-primary">二手车交易平台</h1>
          </div>
          
          <!-- 桌面导航 -->
          <div class="hidden md:flex items-center space-x-6">
            <a href="#" class="text-text hover:text-primary transition-colors duration-200">首页</a>
            <a href="#cars" class="text-text hover:text-primary transition-colors duration-200">车辆列表</a>
            <a href="#features" class="text-text hover:text-primary transition-colors duration-200">特色服务</a>
            <a href="#contact" class="text-text hover:text-primary transition-colors duration-200">联系我们</a>
          </div>
          
          <!-- 登录注册按钮 -->
          <div class="hidden md:flex items-center space-x-4">
            <button class="px-4 py-2 text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors duration-200">登录</button>
            <button class="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors duration-200">注册</button>
          </div>
          
          <!-- 移动端汉堡菜单 -->
          <div class="md:hidden flex items-center">
            <button class="text-text hover:text-primary transition-colors duration-200 text-2xl">
              <i class="fa fa-bars"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main class="pt-16">
      <!-- 英雄区域 -->
      <section class="relative bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div class="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div class="md:w-1/2 mb-10 md:mb-0">
            <h2 class="text-4xl md:text-5xl font-bold mb-4 text-primary">专业二手车交易平台</h2>
            <p class="text-lg mb-8 text-text">提供优质的二手车买卖服务，让您的交易更加安全、便捷</p>
            <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button class="px-6 py-3 bg-primary text-white rounded-md hover:bg-secondary transition-colors duration-200 text-center">立即浏览</button>
              <button class="px-6 py-3 text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors duration-200 text-center">了解更多</button>
            </div>
          </div>
          <div class="md:w-1/2">
            <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20used%20car%20dealership%20showroom%20with%20multiple%20cars%20on%20display%2C%20clean%20white%20interior%2C%20professional%20lighting&image_size=landscape_16_9" alt="二手车展示" class="rounded-lg shadow-lg w-full">
          </div>
        </div>
      </section>

      <!-- 特色功能部分 -->
      <section id="features" class="py-16">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12 text-primary">我们的特色服务</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div class="text-primary text-3xl mb-4"><i class="fa fa-car"></i></div>
              <h3 class="text-xl font-bold mb-3">优质车源</h3>
              <p class="text-text">严格筛选每一辆车，确保车况真实可靠，让您买得放心</p>
            </div>
            <div class="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div class="text-primary text-3xl mb-4"><i class="fa fa-shield"></i></div>
              <h3 class="text-xl font-bold mb-3">安全保障</h3>
              <p class="text-text">专业检测认证，提供详细车况报告，保障交易安全</p>
            </div>
            <div class="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div class="text-primary text-3xl mb-4"><i class="fa fa-handshake-o"></i></div>
              <h3 class="text-xl font-bold mb-3">便捷服务</h3>
              <p class="text-text">一站式服务，从选车到过户，全程无忧</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 车辆列表和搜索功能 -->
      <section id="cars" class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12 text-primary">热门车辆</h2>
          
          <!-- 搜索功能 -->
          <div class="bg-white rounded-lg p-6 shadow-md mb-10">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">品牌</label>
                <select class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>全部品牌</option>
                  <option>丰田</option>
                  <option>本田</option>
                  <option>大众</option>
                  <option>宝马</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">价格区间</label>
                <select class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>全部价格</option>
                  <option>5万以下</option>
                  <option>5-10万</option>
                  <option>10-20万</option>
                  <option>20万以上</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">车龄</label>
                <select class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>全部车龄</option>
                  <option>1年以内</option>
                  <option>1-3年</option>
                  <option>3-5年</option>
                  <option>5年以上</option>
                </select>
              </div>
              <div class="flex items-end">
                <button class="w-full bg-primary text-white rounded-md px-4 py-2 hover:bg-secondary transition-colors duration-200">搜索</button>
              </div>
            </div>
          </div>

          <!-- 车辆列表 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- 车辆卡片 1 -->
            <div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=toyota%20corolla%20sedan%20in%20white%2C%20clean%20condition%2C%20professional%20car%20photography&image_size=landscape_4_3" alt="丰田卡罗拉" class="w-full h-48 object-cover">
              <div class="p-4">
                <h3 class="text-xl font-bold mb-2">丰田卡罗拉 2020款</h3>
                <div class="flex items-center text-gray-600 mb-2">
                  <span class="mr-4"><i class="fa fa-calendar mr-1"></i> 2020年</span>
                  <span class="mr-4"><i class="fa fa-road mr-1"></i> 3万公里</span>
                  <span><i class="fa fa-cog mr-1"></i> 自动</span>
                </div>
                <div class="text-2xl font-bold text-primary mb-4">12.8万</div>
                <button class="w-full bg-primary text-white rounded-md px-4 py-2 hover:bg-secondary transition-colors duration-200">查看详情</button>
              </div>
            </div>
            
            <!-- 车辆卡片 2 -->
            <div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=honda%20civic%20sedan%20in%20blue%2C%20clean%20condition%2C%20professional%20car%20photography&image_size=landscape_4_3" alt="本田思域" class="w-full h-48 object-cover">
              <div class="p-4">
                <h3 class="text-xl font-bold mb-2">本田思域 2019款</h3>
                <div class="flex items-center text-gray-600 mb-2">
                  <span class="mr-4"><i class="fa fa-calendar mr-1"></i> 2019年</span>
                  <span class="mr-4"><i class="fa fa-road mr-1"></i> 4.5万公里</span>
                  <span><i class="fa fa-cog mr-1"></i> 自动</span>
                </div>
                <div class="text-2xl font-bold text-primary mb-4">11.5万</div>
                <button class="w-full bg-primary text-white rounded-md px-4 py-2 hover:bg-secondary transition-colors duration-200">查看详情</button>
              </div>
            </div>
            
            <!-- 车辆卡片 3 -->
            <div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=volkswagen%20passat%20sedan%20in%20black%2C%20clean%20condition%2C%20professional%20car%20photography&image_size=landscape_4_3" alt="大众帕萨特" class="w-full h-48 object-cover">
              <div class="p-4">
                <h3 class="text-xl font-bold mb-2">大众帕萨特 2021款</h3>
                <div class="flex items-center text-gray-600 mb-2">
                  <span class="mr-4"><i class="fa fa-calendar mr-1"></i> 2021年</span>
                  <span class="mr-4"><i class="fa fa-road mr-1"></i> 2万公里</span>
                  <span><i class="fa fa-cog mr-1"></i> 自动</span>
                </div>
                <div class="text-2xl font-bold text-primary mb-4">16.8万</div>
                <button class="w-full bg-primary text-white rounded-md px-4 py-2 hover:bg-secondary transition-colors duration-200">查看详情</button>
              </div>
            </div>
          </div>
          
          <!-- 查看更多按钮 -->
          <div class="text-center mt-10">
            <button class="px-6 py-3 text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors duration-200">查看更多车辆</button>
          </div>
        </div>
      </section>

      <!-- CTA区域 -->
      <section class="py-16 bg-primary text-white">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-3xl font-bold mb-4">准备好开始您的二手车交易了吗？</h2>
          <p class="text-lg mb-8">联系我们，我们将为您提供专业的服务</p>
          <button class="px-6 py-3 bg-white text-primary rounded-md hover:bg-gray-100 transition-colors duration-200">立即联系</button>
        </div>
      </section>

      <!-- 联系信息 -->
      <section id="contact" class="py-16">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12 text-primary">联系我们</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white rounded-lg p-6 shadow-md text-center">
              <div class="text-primary text-3xl mb-4"><i class="fa fa-map-marker"></i></div>
              <h3 class="text-xl font-bold mb-2">地址</h3>
              <p class="text-text">北京市朝阳区建国路88号</p>
            </div>
            <div class="bg-white rounded-lg p-6 shadow-md text-center">
              <div class="text-primary text-3xl mb-4"><i class="fa fa-phone"></i></div>
              <h3 class="text-xl font-bold mb-2">电话</h3>
              <p class="text-text">400-123-4567</p>
            </div>
            <div class="bg-white rounded-lg p-6 shadow-md text-center">
              <div class="text-primary text-3xl mb-4"><i class="fa fa-envelope"></i></div>
              <h3 class="text-xl font-bold mb-2">邮箱</h3>
              <p class="text-text">info@example.com</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="bg-text text-white py-10">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-xl font-bold mb-4">二手车交易平台</h3>
            <p class="text-gray-400">专业的二手车交易服务，让您的交易更加安全、便捷</p>
          </div>
          <div>
            <h3 class="text-lg font-bold mb-4">快速链接</h3>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">首页</a></li>
              <li><a href="#cars" class="text-gray-400 hover:text-white transition-colors duration-200">车辆列表</a></li>
              <li><a href="#features" class="text-gray-400 hover:text-white transition-colors duration-200">特色服务</a></li>
              <li><a href="#contact" class="text-gray-400 hover:text-white transition-colors duration-200">联系我们</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-bold mb-4">服务支持</h3>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">常见问题</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">交易流程</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">隐私政策</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">用户协议</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-bold mb-4">关注我们</h3>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200 text-xl"><i class="fa fa-weixin"></i></a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200 text-xl"><i class="fa fa-weibo"></i></a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200 text-xl"><i class="fa fa-qq"></i></a>
            </div>
          </div>
        </div>
        <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 二手车交易平台 版权所有</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
	
	body {
		font-family: 'Inter', sans-serif;
	}
</style>
