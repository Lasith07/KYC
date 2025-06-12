<template>
    <footer class="footer">
      <div class="footer-top">
        <div class="footer-logo">PayMedia EKYC</div>
        
        <div class="footer-contact-center">
          <h3>Contact Us</h3>
          <div class="contact-item">
            <img :src="phoneIcon" alt="Phone" class="contact-icon">
            <p>+94 11 2461461</p>
          </div>
          <div class="contact-item">
            <img :src="emailIcon" alt="Email" class="contact-icon">
            <p>care@paymedia.lk</p>
          </div>
          <div class="contact-item">
            <img :src="mapIcon" alt="Location" class="contact-icon">
            <p>PayMedia Limited, 106 Havelock Road, Colombo 5.</p>
            
          </div>
        </div>
        
        <div class="footer-social">
          <p class="social-title">Social Media</p>
          <div class="social-icons-container">
            <a href="https://www.youtube.com/channel/UCgeK1QtajrklqOrVEBTu8pQ/search" class="social-icon" target="_blank" rel="noopener noreferrer">
              <img :src="youtubeIcon" alt="YouTube" class="social-icon-img">
            </a>
            <a href="https://www.instagram.com/paymedia.lk/" class="social-icon" target="_blank" rel="noopener noreferrer">
              <img :src="instagramIcon" alt="Instagram" class="social-icon-img">
            </a>
            <a href="https://x.com/paymedialk?t=4kn61NxC3jfXI1BeTbu5QQ&s=09" class="social-icon" target="_blank" rel="noopener noreferrer">
              <img :src="twitterIcon" alt="Twitter" class="social-icon-img">
            </a>
            <a href="https://www.facebook.com/paymedia.lk/" class="social-icon" target="_blank" rel="noopener noreferrer">
              <img :src="facebookIcon" alt="Facebook" class="social-icon-img">
            </a>
            <a href="https://lk.linkedin.com/company/paymedia-pvt-ltd" class="social-icon" target="_blank" rel="noopener noreferrer">
              <img :src="linkedinIcon" alt="LinkedIn" class="social-icon-img">
            </a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
       
        <p>Copyright ©{{ currentYear }} PayMedia. All Rights Reserved</p>
      </div>
    </footer>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'FooterCompo',
    data() {
      return {
        phoneIcon: new URL('@/assets/phone.png', import.meta.url).href,
        emailIcon: new URL('@/assets/email.png', import.meta.url).href,
        mapIcon: new URL('@/assets/map.png', import.meta.url).href,
        youtubeIcon: new URL('@/assets/youtube.jpg', import.meta.url).href,
        instagramIcon: new URL('@/assets/instagram.jpg', import.meta.url).href,
        twitterIcon: new URL('@/assets/twitter.jpg', import.meta.url).href,
        facebookIcon: new URL('@/assets/facebook.jpg', import.meta.url).href,
        linkedinIcon: new URL('@/assets/linkedin.jpg', import.meta.url).href,
        currentYear: new Date().getFullYear()
      };
    }
  });
  </script>
  
  <style scoped>
  .footer {
    background-color: #ec4b4b;
    color: white;
    padding: 2rem;
  }
  
  .footer-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
  }
  
  .footer-logo {
    font-size: 40px;
    margin-top: 120px;
    flex: 0 0 auto;
  }
  
  .footer-contact-center {
    text-align: center;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .contact-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 9px;
  }
  
  .contact-icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
  
  .footer-social {
    text-align: right;
    flex: 0 0 auto;
    margin-top: 50px;
  }
  
  .social-title {
    margin-bottom: 10px;
    font-weight: 500;
  }
  
  .social-icons-container {
    display: flex;
    justify-content: center;
    gap: 12px;
  }
  
  .social-icon {
    display: inline-block;
    transition: transform 0.3s ease;
  }
  
  .social-icon:hover {
    transform: scale(1.2);
  }
  
  .social-icon-img {
    width: 32px;
    height: 32px;
    object-fit: contain;
    border-radius: 50%;
  }
  
  .footer-bottom {
    text-align: center;
    margin-top: 90px;

  }
  
  @media (max-width: 768px) {
    .detail-row {
      flex-direction: column;
    }
    
    .detail-label {
      width: 100%;
      margin-bottom: 0.2rem;
    }
    
    .document-grid {
      grid-template-columns: 1fr;
    }
    
    .action-buttons {
      flex-direction: column;
      gap: 1rem;
    }
    
    .footer-top {
      flex-direction: column;
      align-items: center;
    }
    
    .footer-contact-center {
      position: static;
      transform: none;
      margin: 1rem 0;
    }
    
    .footer-logo, .footer-social {
      margin-top: 1rem;
      text-align: center;
    }
    
    .contact-item {
      justify-content: center;
    }
  }
  </style>