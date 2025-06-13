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
            @click="triggerUpload(type)"
            @dragover.prevent="dragOver(type)"
            @dragleave="dragLeave(type)"
            @drop.prevent="handleDrop($event, type)"
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
              @change="handleFileUpload($event, type)"
              autocomplete="off"
            />
          </div>
          <div v-if="errors[type]" class="error-message" role="alert" aria-live="assertive">
            {{ errors[type] }}
          </div>
          <button
            v-if="formPreview[type]"
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
            <span v-else>Submit Documents</span>
          </button>
        </div>
      </div>
    </section>
    <FooterCompo />
    
    <!-- Error Modal -->
    <div v-if="showErrorModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-icon error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </div>
        <h3>Save Failed</h3>
        <p>{{ errorMessage || 'There was a problem saving your documents. Please try again.' }}</p>
        <button class="btn-primary" @click="showErrorModal = false">Try Again</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { useRouter } from 'vue-router';
import TopBanner from '../components/banner.vue';
import FooterCompo from '../components/footer.vue';
import { useKycStore } from '@/helpers/kycStore';

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
      } as Record<string, string>,
      formFiles: {
        nicFront: null as File | null,
        nicBack: null as File | null,
        selfie: null as File | null,
      },
      formPreview: {
        nicFront: null as string | null,
        nicBack: null as string | null,
        selfie: null as string | null,
      } as Record<string, string | null>,
      errors: { nicFront: '', nicBack: '', selfie: '' } as Record<string, string>,
      showErrorModal: false,
      errorMessage: '',
    };
  },
  computed: {
    canProceed(): boolean {
      return !!(this.formFiles.nicFront && this.formFiles.nicBack && this.formFiles.selfie);
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

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        this.errors[type] = 'Only JPG or PNG images are allowed';
        return;
      }

      // Validate file size
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        this.errors[type] = 'Image must be smaller than 2MB';
        return;
      }

      // Store file object
      this.formFiles[type] = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.formPreview[type] = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    removeImage(type: 'nicFront' | 'nicBack' | 'selfie') {
      this.formFiles[type] = null;
      this.formPreview[type] = null;
      const input = this.$refs[`${type}Input`];
      const fileInput = Array.isArray(input) ? input[0] : input;
      fileInput.value = '';
      this.errors[type] = '';
    },
    async submitImages() {
      if (!this.canProceed) {
        Object.keys(this.errors).forEach(k => {
          if (!this.formFiles[k as keyof typeof this.formFiles]) {
            this.errors[k] = `${this.labels[k]} is required`;
          }
        });
        return;
      }

      this.isSubmitting = true;

      try {
        // Save files and previews to Pinia store
        this.kyc.setFormData({
          nicFrontImage: (() => {
            const formData = new FormData();
            formData.append('nicFrontImage', this.formFiles.nicFront!);
            return formData;
          })(),
          nicBackImage: (() => {
            const formData = new FormData();
            formData.append('nicBackImage', this.formFiles.nicBack!);
            return formData;
          })(),
          selfieImage: (() => {
            const formData = new FormData();
            formData.append('selfieImage', this.formFiles.selfie!);
            return formData;
          })(),
          nicFrontPreview: this.formPreview.nicFront!,
          nicBackPreview: this.formPreview.nicBack!,
          selfiePreview: this.formPreview.selfie!,
        });

        // Navigate directly to confirmation page
        this.router.push('/kyc-confirmation');
      } catch (error: any) {
        console.error('Save error:', error);
        this.errorMessage = 'Failed to save documents to store. Please try again.';
        this.showErrorModal = true;
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
  color: #e74c3c;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-subtitle {
  color: #7f8c8d;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.upload-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.upload-group {
  margin-bottom: 1.5rem;
  text-align: left;
  background: white;
  border-radius: 10px;
  padding: 1.2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.upload-group:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.upload-group label {
  display: block;
  margin-bottom: 0.8rem;
  font-weight: 600;
  color: #e74c3c;
  font-size: 1rem;
}

.required {
  color: #e74c3c;
  margin-left: 0.2rem;
}

.upload-area {
  width: 100%;
  height: 220px;
  border: 2px dashed #bdc3c7;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}

.upload-area:hover,
.is-dragging {
  border-color: #872c22;
  background-color: #f1f8ff;
}

.upload-area:focus {
  outline: 2px solid #872c22;
  outline-offset: 2px;
}

.upload-placeholder {
  text-align: center;
  z-index: 1;
  color: #7f8c8d;
}

.upload-icon {
  font-size: 3rem;
  color: #872c22;
  margin-bottom: 0.5rem;
  font-weight: 200;
}

.file-requirements {
  font-size: 0.85rem;
  color: #95a5a6;
  margin-top: 0.3rem;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  background-color: #fff;
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  text-align: left;
}

.remove-btn {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.8rem;
  cursor: pointer;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
}

.remove-btn:hover {
  background: #fff5f5;
  border-color: #f8d7da;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.btn-primary {
  background: linear-gradient(135deg, #e74c3c, #b93e31);
  color: white;
  border: none;
  padding: 0.9rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  min-width: 200px;
  font-size: 1rem;
  box-shadow: 0 4px 6px rgba(52, 152, 219, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #c44133, #e74c3c);
  transform: translateY(-2px);
  box-shadow: 0 6px 10px rgba(241, 52, 5, 0.3);
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background-color: white;
  color: #df4b3b;
  border: 1px solid #df4b3b;
  padding: 0.9rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  min-width: 200px;
  font-size: 1rem;
}

.btn-secondary:hover {
  background-color: #f1f8ff;
  transform: translateY(-2px);
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.modal-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon svg {
  width: 40px;
  height: 40px;
}

.modal-icon.error {
  background: #fceae9;
  color: #e74c3c;
}

.modal-content h3 {
  font-size: 1.5rem;
  color: #872c22;
  margin-bottom: 1rem;
}

.modal-content p {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .upload-group {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
  }
}
</style>