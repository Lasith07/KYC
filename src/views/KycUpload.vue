
<template>
  <div class="kyc-wrapper">
    <TopBanner />
    <section class="form-section">
      <h2 class="form-title">KYC Verification</h2>
      <p class="form-subtitle">Please upload the required documents for verification</p>

      <div class="upload-container">
        <div v-for="type in ['nicFront', 'nicBack', 'selfie'] as Array<'nicFront' | 'nicBack' | 'selfie'>" :key="type" class="upload-group">
          <label :for="`${type}Input`">{{ labels[type] }} <span class="required">*</span></label>
          <div
            class="upload-area"
            @click="triggerUpload(type as 'nicFront' | 'nicBack' | 'selfie')"
            @dragover.prevent="dragOver(type)"
            @dragleave="dragLeave(type)"
            @drop.prevent="handleDrop($event,type)"
            :class="{ 'is-dragging': isDragging[type] }"
            :aria-label="`Upload ${labels[type]}`"
            tabindex="0"
            @keydown.enter="triggerUpload(type)"
          >
            <img
              v-if="formPreview[type]"
              :src="formPreview[type]"
              class="preview-image"
              :alt="`${labels[type]} Preview`"
            />
            <div v-else class="upload-placeholder">
              <span class="upload-icon">+</span>
              <p>Click or drag to upload</p>
              <p class="file-requirements">(JPG/PNG, max 2MB)</p>
            </div>
            <input
              :id="`${type}Input`"
              type="file"
              :ref="`${type}Input`"
              accept="image/jpeg,image/png"
              hidden
              @change="handleFileUpload($event,type)"
              autocomplete="off"
            />
          </div>
          <div v-if="errors[type]" class="error-message" role="alert" aria-live="assertive">
            {{ errors[type] }}
          </div>
          <button
            v-if="formBase64[type]"
            class="remove-btn"
            @click.stop="removeImage(type)"
            :aria-label="`Remove ${labels[type]}`"
          >
            Remove Image
          </button>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="goBack">Back</button>
          <button
            type="button"
            class="btn-primary"
            @click="submitImages"
            :disabled="!canProceed || isSubmitting"
          >
            <span v-if="isSubmitting">Processing...</span>
            <span v-else>Proceed to Confirmation</span>
          </button>
        </div>
      </div>
    </section>
    <FooterCompo />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { useRouter } from 'vue-router';
import TopBanner from '../components/banner.vue';
import FooterCompo from '../components/footer.vue';
import { useKycStore } from '@/helpers/kycStore';
import type { KycFormData } from '@/helpers/vueHelper';

export default defineComponent({
  name: 'KycUpload',
  components: { TopBanner, FooterCompo },
  setup() {
    const router = useRouter();
    const kyc = useKycStore();
    return { router, kyc };
  },
  data() {
    return {
      isSubmitting: false,
      isDragging: reactive({ nicFront: false, nicBack: false, selfie: false }),
      labels: {
        nicFront: 'NIC Front Image',
        nicBack: 'NIC Back Image',
        selfie: 'Selfie with NIC',
      } as Record<string,string>,
      formBase64: {
        nicFront: null,
        nicBack: null,
        selfie: null,
      } as Record<string,string|null>,
      formPreview: {
        nicFront: null,
        nicBack: null,
        selfie: null,
      } as Record<string,string|null>,
      errors: { nicFront: '', nicBack: '', selfie: '' } as Record<string,string>,
    };
  },
  computed: {
    canProceed(): boolean {
      return !!(this.formBase64.nicFront && this.formBase64.nicBack && this.formBase64.selfie);
    },
  },
  mounted() {
    window.addEventListener('keydown', this.handleEnterKey);
    if (!this.kyc.kycFormData.fullName) {
      console.warn('No form data found. Redirecting to KYC form.');
      this.router.push('/kyc-form');
    }
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleEnterKey);
  },
  methods: {
    triggerUpload(type: 'nicFront' | 'nicBack' | 'selfie') {
      const input = this.$refs[`${type}Input`];
      if (Array.isArray(input)) {
        input[0].click();
      } else {
        (input as HTMLInputElement).click();
      }
    },
    dragOver(type: 'nicFront' | 'nicBack' | 'selfie') {
      this.isDragging[type] = true;
    },
    dragLeave(type: 'nicFront' | 'nicBack' | 'selfie') {
      this.isDragging[type] = false;
    },
    handleDrop(event: DragEvent, type: 'nicFront' | 'nicBack' | 'selfie') {
      this.isDragging[type] = false;
      const files = event.dataTransfer?.files;
      if (files?.length) {
        const input = this.$refs[`${type}Input`];
        const fileInput = Array.isArray(input) ? input[0] : input;
        fileInput.files = files;
        this.handleFileUpload({ target: fileInput } as unknown as Event, type);
      }
    },
    handleFileUpload(event: Event, type: 'nicFront' | 'nicBack' | 'selfie') {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      this.errors[type] = '';
      if (!file) return;
      if (!file.type.match('image/(jpeg|png)')) {
        this.errors[type] = 'Only JPG or PNG images are allowed';
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.errors[type] = 'Image must be smaller than 2MB';
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        this.formPreview[type] = dataUrl;
        this.formBase64[type] = dataUrl.split(',')[1];
        this.kyc.setFormData({ [`${type}Image`]: this.formBase64[type] } as Partial<KycFormData>);
      };
      reader.readAsDataURL(file);
    },
    removeImage(type: string) {
      this.formBase64[type] = null;
      this.formPreview[type] = null;
      const input = this.$refs[`${type}Input`];
      const fileInput = Array.isArray(input) ? input[0] : input;
      fileInput.value = '';
      this.errors[type] = '';
      this.kyc.setFormData({ [`${type}Image`]: null } as Partial<KycFormData>);
    },
    async submitImages() {
      if (!this.canProceed) {
        Object.keys(this.errors).forEach(k => {
          if (!this.formBase64[k]) this.errors[k] = `${this.labels[k]} is required`;
        });
        return;
      }
      this.isSubmitting = true;
      try {
        this.router.push('/kyc-confirmation');
      } catch (e) {
        alert('Unable to proceed to confirmation');
      } finally {
        this.isSubmitting = false;
      }
    },
    goBack() { this.router.push('/'); },
    handleEnterKey(e: KeyboardEvent) {
      if (e.key === 'Enter' && this.canProceed && !this.isSubmitting) this.submitImages();
    },
  },
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

.form-section {
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

.upload-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 1rem;
}

.upload-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.upload-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.required {
  color: #ec4b4b;
  margin-left: 0.2rem;
}

.upload-area {
  width: 100%;
  height: 200px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.upload-area:hover,
.is-dragging {
  border-color: #ec4b4b;
  background-color: #f5f5f5;
}

.upload-area:focus {
  outline: 2px solid #ec4b4b;
  outline-offset: 2px;
}

.upload-placeholder {
  text-align: center;
  z-index: 1;
}

.upload-icon {
  font-size: 2.5rem;
  color: #ec4b4b;
  margin-bottom: 0.5rem;
}

.file-requirements {
  font-size: 0.8rem;
  color: #777;
  margin-top: 0.3rem;
}

.preview-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #fff;
}

.error-message {
  color: #ec4b4b;
  font-size: 0.8rem;
  margin-top: 0.3rem;
  text-align: left;
}

.remove-btn {
  background: none;
  border: none;
  color: #ec4b4b;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0.2rem 0;
}

.remove-btn:hover {
  color: #d43c3c;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.btn-primary {
  background-color: #ec4b4b;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
  min-width: 180px;
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
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  min-width: 180px;
}

.btn-secondary:hover {
  background-color: #f8f8f8;
}
</style>
