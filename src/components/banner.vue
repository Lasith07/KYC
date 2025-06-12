<template>
    <div class="banner-wrapper">
      <img :src="bannerImage" alt="Banner" class="banner-image" />
      <div class="overlay-header">
        <div class="logo">PayMedia <span class="ekyc">EKYC</span></div>
        <div class="contact-number">📞 +94 11 2461461</div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'TopBanner',
    data() {
      return {
        bannerImage: new URL('@/assets/banner.jpg', import.meta.url).href,
        
      };
    }
  });
  </script>
  
  <style scoped>
  .banner-wrapper {
    position: relative;
    width: 100%;
    height: 400px;
    overflow: hidden;
  }
  
  .banner-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  
  .overlay-header {
    position: absolute;
    top: 20px;
    left: 0;
    right: 0;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 2;
  }
  
  .logo {
    font-weight: bold;
    font-size: 1.8rem;
    color: white;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
  }
  
  .ekyc {
    color: #f8f8f8;
  }
  
  .contact-number {
    background-color: #ec4b4b;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    white-space: nowrap;
  }
  </style>