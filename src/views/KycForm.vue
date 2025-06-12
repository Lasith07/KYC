<template>
  <div class="kyc-wrapper">
    <!-- Login/Register Popup -->
    <div v-if="showLoginPopup" class="login-popup-overlay">
      <div class="login-popup">
        <h2 class="popup-title">Login or Register</h2>
        <div class="phone-input-group">
          <select v-model="selectedCountryCode" class="country-code-select" aria-label="Select country code">
            <option value="+94">+94</option>
            <option value="+1">+1</option>
            <option value="+44">+44</option>
            <option value="+61">+61</option>
            <option value="+91">+91</option>
          </select>
          <input
            type="tel"
            v-model="phoneNumber"
            placeholder="Enter phone number"
            class="phone-input"
            @keyup.enter="sendOtp"
            aria-label="Phone number"
            :aria-invalid="!!kyc.errors.otp"
            :aria-describedby="kyc.errors.otp ? 'phone-error' : undefined"
          />
        </div>
        <span v-if="kyc.errors.otp" id="phone-error" class="error-message">{{ kyc.errors.otp }}</span>
        <button @click="sendOtp" class="popup-continue-btn" :disabled="isSendingOtp">
          {{ isSendingOtp ? 'Sending OTP...' : 'Send OTP' }}
          <span v-if="isSendingOtp" class="spinner"></span>
        </button>
      </div>
    </div>

    <!-- OTP Verification Popup -->
    <div v-if="showOtpPopup" class="login-popup-overlay">
      <div class="login-popup">
        <h2 class="popup-title">Verify OTP</h2>
        <p class="otp-subtitle">Enter the OTP sent to {{ fullPhoneNumber }}</p>
        <input
          type="text"
          v-model="otpInput"
          placeholder="Enter OTP"
          class="otp-input"
          @keyup.enter="verifyOtp"
          aria-label="OTP code"
          :aria-invalid="!!kyc.errors.otp"
          :aria-describedby="kyc.errors.otp ? 'otp-error' : undefined"
        />
        <span v-if="kyc.errors.otp" id="otp-error" class="error-message">{{ kyc.errors.otp }}</span>
        <div class="otp-actions">
          <button @click="resendOtp" class="btn-secondary" :disabled="isSendingOtp">
            {{ isSendingOtp ? 'Resending...' : 'Resend OTP' }}
            <span v-if="isSendingOtp" class="spinner"></span>
          </button>
          <button @click="verifyOtp" class="popup-continue-btn" :disabled="isVerifyingOtp">
            {{ isVerifyingOtp ? 'Verifying...' : 'Verify OTP' }}
            <span v-if="isVerifyingOtp" class="spinner"></span>
          </button>
        </div>
      </div>
    </div>

    <div :class="['main-content', { blurred: showLoginPopup || showOtpPopup }]">
      <TopBanner />

      <section class="form-section">
        <h2 class="form-title">KYC Form</h2>
        <p class="form-subtitle">
          Please enter your valid Name & email address to use all of our features.
        </p>

        <form @submit.prevent="submitForm" class="form-box">
          <!-- Title -->
          <div class="form-group">
            <label for="title">Title<span class="required-star">*</span></label>
            <select
              id="title"
              v-model="kyc.kycFormData.title"
              required
              @input="validateTitle"
              @blur="validateTitle"
              aria-label="Title"
              :aria-invalid="!!kyc.errors.title"
              :aria-describedby="kyc.errors.title ? 'title-error' : undefined"
            >
              <option value="">Select Title</option>
              <option>Mr</option>
              <option>Mrs</option>
              <option>Miss</option>
            </select>
            <span v-if="kyc.errors.title" id="title-error" class="error-message">{{ kyc.errors.title }}</span>
          </div>

          <!-- Full Name -->
          <div class="form-group">
            <label for="fullName">Full Name<span class="required-star">*</span></label>
            <input
              id="fullName"
              v-model.trim="kyc.kycFormData.fullName"
              type="text"
              placeholder="Enter full name"
              @input="validateFullName"
              @blur="validateFullName"
              required
              aria-label="Full name"
              :aria-invalid="!!kyc.errors.fullName"
              :aria-describedby="kyc.errors.fullName ? 'fullName-error' : undefined"
            />
            <span v-if="kyc.errors.fullName" id="fullName-error" class="error-message">{{ kyc.errors.fullName }}</span>
          </div>

          <!-- Mobile Number -->
          <div class="form-group">
            <label for="mobileNumber">Mobile Number<span class="required-star">*</span></label>
            <input
              id="mobileNumber"
              v-model="mobileNumberDisplay"
              type="tel"
              placeholder="Enter 10 digit number"
              @input="formatPhoneNumber"
              required
              aria-label="Mobile number"
              :aria-invalid="!!kyc.errors.mobileNumber"
              :aria-describedby="kyc.errors.mobileNumber ? 'mobileNumber-error' : undefined"
            />
            <span v-if="kyc.errors.mobileNumber" id="mobileNumber-error" class="error-message">{{ kyc.errors.mobileNumber }}</span>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email">Email<span class="required-star">*</span></label>
            <input
              id="email"
              v-model="kyc.kycFormData.email"
              type="email"
              placeholder="Enter email"
              @input="validateEmail"
              @blur="validateEmail"
              required
              aria-label="Email address"
              :aria-invalid="!!kyc.errors.email"
              :aria-describedby="kyc.errors.email ? 'email-error' : undefined"
            />
            <span v-if="kyc.errors.email" id="email-error" class="error-message">{{ kyc.errors.email }}</span>
          </div>

          <!-- NIC Number -->
          <div class="form-group">
            <label for="nicNumber">NIC Number<span class="required-star">*</span></label>
            <input
              id="nicNumber"
              v-model="kyc.kycFormData.nicNumber"
              type="text"
              placeholder="Enter NIC number"
              @input="validateNicNumber"
              @blur="validateNicNumber"
              required
              aria-label="NIC number"
              :aria-invalid="!!kyc.errors.nicNumber"
              :aria-describedby="kyc.errors.nicNumber ? 'nicNumber-error' : undefined"
            />
            <span v-if="kyc.errors.nicNumber" id="nicNumber-error" class="error-message">{{ kyc.errors.nicNumber }}</span>
          </div>

          <!-- Nationality -->
          <div class="form-group">
            <label for="nationality">Nationality<span class="required-star">*</span></label>
            <input
              id="nationality"
              v-model="kyc.kycFormData.nationality"
              type="text"
              placeholder="Enter nationality"
              @input="validateNationality"
              @blur="validateNationality"
              required
              aria-label="Nationality"
              :aria-invalid="!!kyc.errors.nationality"
              :aria-describedby="kyc.errors.nationality ? 'nationality-error' : undefined"
            />
            <span v-if="kyc.errors.nationality" id="nationality-error" class="error-message">{{ kyc.errors.nationality }}</span>
          </div>

          <span v-if="kyc.errors.form" class="error-message">{{ kyc.errors.form }}</span>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="goBack">Back</button>
            <button type="submit" class="btn-primary" :disabled="!isFormValid || isSubmitting">
              {{ isSubmitting ? 'Submitting...' : 'Let\'s Continue' }}
              <span v-if="isSubmitting" class="spinner"></span>
            </button>
          </div>
        </form>
      </section>
      <FooterCompo />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import TopBanner from '@/components/banner.vue';
import FooterCompo from '@/components/footer.vue';
import { useKycStore } from '@/helpers/kycStore';
import networkManager from '@/NetworkManager';


// interface KycFormData {
//   title: string;
//   fullName: string;
//   mobileNumber: number;
//   email: string;
//   nicNumber: string;
//   nationality: string;
// }

// interface FormErrors {
//   title: string;
//   fullName: string;
//   mobileNumber: string;
//   email: string;
//   nicNumber: string;
//   nationality: string;
//   otp: string;
//   form?: string;
// }

interface ApiResponse {
  status: number;
  success?: boolean;
  data?: string;
  message?: string;
}

export default defineComponent({
  name: 'KycForm',
  components: {
    TopBanner,
    FooterCompo,
  },
  setup() {
    const router = useRouter();
    const kyc = useKycStore();
    return { router, kyc };
  },
  data() {
    return {
      showLoginPopup: true,
      showOtpPopup: false,
      selectedCountryCode: '+94',
      phoneNumber: '',
      otpInput: '',
      mobileNumberDisplay: '',
      isSendingOtp: false,
      isVerifyingOtp: false,
      // kycFormData: {
      //   title: '',
      //   fullName: '',
      //   mobileNumber: 0,
      //   email: '',
      //   nicNumber: '',
      //   nationality: ''
      // } as KycFormData,
      // errors: {
      //   title: '',
      //   fullName: '',
      //   mobileNumber: '',
      //   email: '',
      //   nicNumber: '',
      //   nationality: '',
      //   otp: '',
      //   form: ''
      // } as FormErrors,
      isSubmitting: false,
    };
  },
  computed: {
    isFormValid(): boolean {
      return (
        !!this.kyc.kycFormData.title &&
        !!this.kyc.kycFormData.fullName &&
        !this.kyc.errors.fullName &&
        this.kyc.kycFormData.mobileNumber > 0 &&
        this.kyc.kycFormData.mobileNumber.toString().length === 9 &&
        !this.kyc.errors.mobileNumber &&
        !!this.kyc.kycFormData.email &&
        !this.kyc.errors.email &&
        !!this.kyc.kycFormData.nicNumber &&
        (this.kyc.kycFormData.nicNumber.length === 10 || this.kyc.kycFormData.nicNumber.length === 12) &&
        !this.kyc.errors.nicNumber &&
        !!this.kyc.kycFormData.nationality &&
        !this.kyc.errors.nationality
      );
    },
    fullPhoneNumber(): string {
      if (this.selectedCountryCode === '+94') {
        return this.selectedCountryCode + this.kyc.kycFormData.mobileNumber.toString();
      } else {
        return this.selectedCountryCode + this.mobileNumberDisplay;
      }
    },
  },
  mounted() {
    if (this.kyc.kycFormData.mobileNumber) {
      this.mobileNumberDisplay = `0${this.kyc.kycFormData.mobileNumber}`;
    }
  },
  methods: {
    async sendOtp() {
  const cleanedNumber = this.phoneNumber.replace(/\D/g, '');
  let localNumber = cleanedNumber;

  if (this.selectedCountryCode === '+94') {
    if (localNumber.startsWith('0')) {
      localNumber = localNumber.substring(1);
    }
    if (localNumber.length !== 9) {
      this.kyc.errors.otp = 'For +94, please enter a 9-digit number (without leading 0)';
      return;
    }
  } else {
    if (!localNumber) {
      this.kyc.errors.otp = 'Please enter a valid phone number';
      return;
    }
  }

  this.kyc.kycFormData.mobileNumber = parseInt(localNumber, 10);
  this.mobileNumberDisplay = this.selectedCountryCode === '+94' ? `0${localNumber}` : localNumber;

  this.isSendingOtp = true;
  try {
    const response = await networkManager.post<ApiResponse>('/api/Otp/send', {
      phoneNumber: this.fullPhoneNumber
    });
    console.log('API Response:', response);
    if (response.success === true) {
      this.showLoginPopup = false;
      this.showOtpPopup = true;
      this.kyc.errors.otp = '';
    } else {
      this.kyc.errors.otp = response.message || 'Failed to send OTP. Please try again.';
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.title || error.response?.data?.message || error.message || 'Failed to send OTP. Please try again.';
    this.kyc.errors.otp = errorMessage;
  } finally {
    this.isSendingOtp = false;
  }
},

async resendOtp() {
  this.isSendingOtp = true;
  try {
    const response = await networkManager.post<ApiResponse>('/api/Otp/send', {
      phoneNumber: this.fullPhoneNumber
    });
    if (response.success === true) {
      this.kyc.errors.otp = 'OTP resent successfully';
    } else {
      this.kyc.errors.otp = response.message || 'Failed to resend OTP. Please try again.';
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.title || error.response?.data?.message || error.message || 'Failed to resend OTP. Please try again.';
    this.kyc.errors.otp = errorMessage;
  } finally {
    this.isSendingOtp = false;
  }
},
    async verifyOtp() {
      if (!this.otpInput.trim()) {
        this.kyc.errors.otp = 'OTP is required';
        return;
      } else if (!/^\d{6}$/.test(this.otpInput)) {
        this.kyc.errors.otp = 'OTP must be 6 digits';
        return;
      }

      this.isVerifyingOtp = true;
      try {
        const response = await networkManager.post<ApiResponse>('/api/Otp/verify', {
          phoneNumber: this.fullPhoneNumber,
          otpCode: this.otpInput
        });
        if (response.success === true) {
          this.showOtpPopup = false;
          this.kyc.errors.otp = '';
        } else {
          this.kyc.errors.otp = response.message || response.data || 'Invalid OTP. Please try again.';
        }
      } catch (error: any) {
        this.kyc.errors.otp = error.response?.data?.message || error.message || 'OTP verification failed. Please try again.';
      } finally {
        this.isVerifyingOtp = false;
      }
    },
    validateTitle() {
      this.kyc.errors.title = this.kyc.kycFormData.title ? '' : 'Title is required';
    },
    validateFullName() {
      this.kyc.errors.fullName = '';
      const name = this.kyc.kycFormData.fullName ? this.kyc.kycFormData.fullName.trim() : '';
      if (!name) {
        this.kyc.errors.fullName = 'Full name is required';
      } else if (/^\s|\s$/.test(name)) {
        this.kyc.errors.fullName = 'Cannot start or end with spaces';
        this.kyc.kycFormData.fullName = name;
      }
    },
    formatPhoneNumber(event: Event) {
      const input = event.target as HTMLInputElement;
      let number = input.value.replace(/\D/g, '');

      if (number.length > 10) {
        number = number.slice(0, 10);
      }

      this.mobileNumberDisplay = number;

      if (number.length === 10 && number.startsWith('0')) {
        this.kyc.kycFormData.mobileNumber = parseInt(number.substring(1), 10);
      } else {
        this.kyc.kycFormData.mobileNumber = parseInt(number, 10) || 0;
      }

      this.validatePhoneNumber();
    },
    validatePhoneNumber() {
      this.kyc.errors.mobileNumber = '';
      const number = this.kyc.kycFormData.mobileNumber;
      if (!number) {
        this.kyc.errors.mobileNumber = 'Mobile number is required';
      } else if (isNaN(number) || number.toString().length !== 9) {
        this.kyc.errors.mobileNumber = 'Mobile number must be 9 digits';
      }
    },
    validateEmail() {
      this.kyc.errors.email = '';
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.kyc.kycFormData.email) {
        this.kyc.errors.email = 'Email is required';
      } else if (!re.test(this.kyc.kycFormData.email)) {
        this.kyc.errors.email = 'Please enter a valid email';
      }
    },
    validateNicNumber() {
      this.kyc.errors.nicNumber = '';
      const oldNic = /^\d{9}[vVxX]$/;
      const newNic = /^\d{12}$/;
      if (!this.kyc.kycFormData.nicNumber) {
        this.kyc.errors.nicNumber = 'NIC number is required';
      } else if (!oldNic.test(this.kyc.kycFormData.nicNumber) && !newNic.test(this.kyc.kycFormData.nicNumber)) {
        this.kyc.errors.nicNumber = 'NIC must be 10 characters (9 digits + V/X) or 12 digits';
      }
    },
    validateNationality() {
      this.kyc.errors.nationality = '';
      if (this.kyc.kycFormData.nationality) {
        this.kyc.kycFormData.nationality = this.kyc.kycFormData.nationality.replace(/[0-9]/g, '');
      }
      if (!this.kyc.kycFormData.nationality || !this.kyc.kycFormData.nationality.trim()) {
        this.kyc.errors.nationality = 'Nationality is required';
      } else {
        this.kyc.errors.nationality = '';
      }
    },
    async submitForm() {
      this.validateTitle();
      this.validateFullName();
      this.validatePhoneNumber();
      this.validateEmail();
      this.validateNicNumber();
      this.validateNationality();

      if (this.isFormValid) {
        this.isSubmitting = true;
        try {
          this.kyc.setFormData(this.kyc.kycFormData);
          await this.router.push('/kyc-upload');
        } catch (error: any) {
          this.kyc.errors.form = error.message || 'Failed to submit form. Please try again.';
        } finally {
          this.isSubmitting = false;
        }
      }
    },
    goBack() {
      this.showOtpPopup = false;
      this.showLoginPopup = true;
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

.main-content.blurred {
  filter: blur(5px);
  pointer-events: none;
  user-select: none;
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

.form-box {
  max-width: 600px;
  margin: auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: white;
  display: grid;
  gap: 1rem;
}

.form-group {
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 500;
}

input,
select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.login-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.login-popup {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
  z-index: 1000;
}

.popup-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.otp-subtitle {
  color: #666;
  margin-bottom: 1rem;
}

.phone-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.country-code-select {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 30%;
  max-width: 100px;
}

.phone-input,
.otp-input {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 5px;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-continue-btn:hover:not(:disabled) {
  background-color: #d43c3c;
}

.popup-continue-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.otp-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.btn-primary {
  background-color: #ec4b4b;
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  background-color: #d43c3c;
}

.btn-primary:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-secondary {
  background-color: white;
  color: #ec4b4b;
  border: 1px solid #ec4b4b;
  padding: 0.7rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f8f8f8;
}

.btn-secondary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.required-star {
  color: #ec4b4b;
  margin-left: 4px;
}

.error-message {
  color: #ec4b4b;
  font-size: 0.8rem;
  margin-top: 0.2rem;
  display: block;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .form-box {
    padding: 1rem;
  }
  .login-popup {
    width: 95%;
    padding: 1rem;
  }
}
</style>