<template>
  <div class="kyc-wrapper">
    <TopBanner />

    <section class="confirmation-section">
      <h2 class="form-title">Confirm Your Details</h2>
      <p class="form-subtitle">Please review all information before submission</p>

      <div class="confirmation-container">
        <div class="details-card">
          <h3 class="section-title">Personal Information</h3>
          <div v-for="(label, key) in fields" :key="key" class="detail-row">
            <span class="detail-label">{{ label }}:</span>
            <span class="detail-value">{{ formData[key] || 'Not provided' }}</span>
          </div>
        </div>

        <div class="documents-card">
          <h3 class="section-title">Uploaded Documents</h3>
          <div class="document-grid">
            <div v-for="type in ['nicFront', 'nicBack', 'selfie']" :key="type" class="document-preview">
              <h4>{{ labels[type as 'nicFront' | 'nicBack' | 'selfie'] }}</h4>
              <img
                v-if="previewUri(type as 'nicFront' | 'nicBack' | 'selfie')"
                :src="previewUri(type as 'nicFront' | 'nicBack' | 'selfie')"
                :alt="`${labels[type as 'nicFront' | 'nicBack' | 'selfie']} Preview`"
                class="document-image"
              />
              <p v-else>No image uploaded</p>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="goBack" class="btn-secondary">Back</button>
          <button @click="submitForm" class="btn-primary" :disabled="isLoading">
            <span v-if="isLoading">Submitting...</span>
            <span v-else>Submit Verification</span>
          </button>
        </div>
      </div>
    </section>

    <FooterCompo />

    <div v-if="showSuccessDialog" class="success-popup-overlay">
      <div class="success-popup">
        <img src="@/assets/check.jpg" alt="Success Check" width="80" height="80" class="success-icon" />
        <h2 class="popup-title">🎉 CONGRATULATIONS!</h2>
        <p class="popup-message">Your KYC data has been submitted successfully.</p>
        <button @click="closeDialog" class="popup-continue-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import TopBanner from '../components/banner.vue';
import FooterCompo from '../components/footer.vue';
import { useKycStore } from '@/helpers/kycStore';
import type { KycFormData } from '@/helpers/vueHelper';
import networkManager from '@/NetworkManager';

export default defineComponent({
  name: 'KycConfirmation',
  components: { TopBanner, FooterCompo },
  setup() {
    const router = useRouter();
    const store = useKycStore();
    const formData = store.kycFormData as KycFormData;

    // Only include personal info fields (exclude images and ID)
    const fields = {
      title: 'Title',
      fullName: 'Full Name',
      mobileNumber: 'Mobile Number',
      email: 'Email',
      nicNumber: 'NIC Number',
      nationality: 'Nationality',
    };

    const labels = {
      nicFront: 'NIC Front',
      nicBack: 'NIC Back',
      selfie: 'Selfie'
    };

    function previewUri(type: 'nicFront'|'nicBack'|'selfie'): string | null {
      const b64 = (formData as any)[`${type}Image`];
      return b64 ? `data:image/jpeg;base64,${b64}` : null;
    }

    return { router, store, formData, fields, labels, previewUri };
  },

  data() {
    return {
      isLoading: false,
      showSuccessDialog: false
    };
  },

  methods: {
    goBack() {
      this.router.back();
    },

    async submitForm() {
      this.isLoading = true;
      try {
        const detailsPayload = {
          title: this.formData.title,
          fullName: this.formData.fullName,
          mobileNumber: this.formData.mobileNumber,
          email: this.formData.email,
          nicNumber: this.formData.nicNumber,
          nationality: this.formData.nationality
        };

        const detailsResp = await networkManager.post<{ success: boolean; data?: { id: number; message?: string } }>(
          '/api/Detail/save',
          detailsPayload
        );

        if (!detailsResp.success || !detailsResp.data?.id) {
          throw new Error(detailsResp.data?.message || 'Failed to save personal details');
        }

        const newId = detailsResp.data.id;
        this.store.setFormData({ id: newId });

        const imagesPayload = {
          id: newId,
          nicFrontImage: (this.formData as any).nicFrontImage,
          nicBackImage: (this.formData as any).nicBackImage,
          selfieImage: (this.formData as any).selfieImage
        };

        const imageResp = await networkManager.post<{ success: boolean; data?: { message?: string } }>(
          '/api/Image/save',
          imagesPayload
        );

        if (!imageResp.success) {
          throw new Error(imageResp.data?.message || 'Failed to save images');
        }

        this.showSuccessDialog = true;

      } catch (err: any) {
        alert(`Submission failed: ${err.message}`);
      } finally {
        this.isLoading = false;
      }
    },

    closeDialog() {
      this.showSuccessDialog = false;
      this.store.clearData();
      this.router.push('/');
    }
  }
});
</script>

<style scoped>
.kyc-wrapper {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f9f9f9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.confirmation-section {
  padding: 2rem;
  text-align: center;
  flex: 1;
}

.form-title {
  color: #ec4b4b;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  color: #666;
  margin-bottom: 2rem;
}

.confirmation-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.details-card,
.documents-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-title {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: left;
  font-size: 1.2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.detail-row {
  display: flex;
  margin-bottom: 1rem;
  text-align: left;
}

.detail-label {
  font-weight: 500;
  color: #555;
  width: 150px;
  flex-shrink: 0;
}

.detail-value {
  color: #333;
}

.document-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.document-preview {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
}

.document-preview h4 {
  margin: 0 0 0.5rem 0;
  color: #555;
  font-size: 0.9rem;
}

.document-image {
  width: 100%;
  height: 150px;
  object-fit: contain;
  border: 1px solid #eee;
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.btn-primary {
  background-color: #ec4b4b;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #d43c3c;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: white;
  color: #ec4b4b;
  border: 1px solid #ec4b4b;
  padding: 0.8rem 2rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background-color: #f8f8f8;
}

/* Success Popup Styles (matches your login popup) */
.success-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  backdrop-filter: blur(5px);
}

.success-popup {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
  z-index: 1000;
}

.success-icon {
  margin-bottom: 1rem;
}

.popup-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #ec4b4b;
}

.popup-message {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.popup-continue-btn {
  background-color: #ec4b4b;
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
  width: 100%;
  max-width: 200px;
  margin: 0 auto;
}

.popup-continue-btn:hover {
  background-color: #d43c3c;
}
</style>