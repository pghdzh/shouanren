<template>
  <div class="ack-page">
    <div class="ack-container">
      <h1 class="page-title">鸣谢名单</h1>
      <ul class="ack-list">
        <li v-for="(item, index) in acknowledgements" :key="index" class="ack-item"
          :style="{ animationDelay: index * 0.15 + 's' }">
          <span class="nickname">{{ item.nickname }}:</span>

          <span class="suggestion">{{ item.suggestion }}</span>
        </li>
      </ul>
      <div v-if="acknowledgements.length === 0" class="empty">
        暂无鸣谢内容
      </div>
    </div>
    <footer class="ack-footer">
      © 2025 守岸人电子设定集 · 感谢所有支持者
    </footer>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
const acknowledgements = reactive([
  { nickname: 'SnowMeteor丶', suggestion: '添加bgm播放器' },
])
</script>

<style lang="scss" scoped>
.ack-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: 64px;
  background: linear-gradient(135deg, #0d0f17, #1a1c29, #0d0f17);
  background-size: 400% 400%;
  animation: bgGradient 20s ease infinite;
}

.ack-container {
  flex: 1;
  padding: 2rem;
  max-width: 600px;
  margin: auto;
  position: relative;
  color: #fff;
  overflow: hidden;


}

@keyframes bgGradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}



.page-title {
  font-size: 2.2rem;
  text-align: center;
  margin-bottom: 1.5rem;
  background: linear-gradient(90deg, #4fe9df 0%, #66c8ff 80%);
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 0 0 8px rgba(140, 240, 255, 0.6);
}

.ack-list {
  list-style: none;
  padding: 0;
  margin: 0;

  .ack-item {
    display: flex;
    align-items: baseline;
    margin-bottom: 0.8rem;
    padding: 0.8rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(4px);
    border-radius: 8px;
    opacity: 0;
    transform: translateY(10px);
    animation: itemIn 0.6s forwards;

    &:hover .nickname {
      transform: scale(1.1);
    }

    .nickname {
      font-weight: bold;
      margin-right: 0.5rem;
       background: linear-gradient(90deg, #4fe9df 0%, #66c8ff 80%);
      -webkit-background-clip: text;
      color: transparent;
      text-shadow: 0 0 6px rgba(255, 140, 240, 0.5);
      transition: transform 0.3s ease;
    }

    .suggestion {
      flex: 1;
      color: #ddd;
    }
  }
}

@keyframes itemIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty {
  text-align: center;
  color: #aaa;
  margin-top: 2rem;
}

.ack-footer {
  text-align: center;
  padding: 1rem 0;
  color: #999;
  font-size: 0.9rem;
  background: rgba(0, 0, 0, 0.3);
}
</style>