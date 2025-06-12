// src/helpers/kycStore.ts
import { defineStore } from 'pinia';
import { KycFormData } from '@/helpers/vueHelper';
import { FormErrors } from './errorHelper';
import { ApiResponse } from './responseHelper'; // Assuming you have an ApiResponse class defined

export const useKycStore = defineStore('kycStore', {
  state: () => ({
    kycFormData: new KycFormData(),
    errors: new FormErrors(),
    responses: new ApiResponse(), 
  }),
  actions: {
    setFormData(formData: Partial<KycFormData>) {
      this.kycFormData = { ...this.kycFormData, ...formData };
      
    },
    setFormErrors(errors: Partial<FormErrors>) {
      this.errors = { ...this.errors, ...errors };
    },

    setApiResponses(responses: Partial<ApiResponse>) {
      this.responses = { ...this.responses, ...this.responses };
    },

    clearData() {
      this.kycFormData = new KycFormData();
      this.errors = new FormErrors();
      this.responses = new ApiResponse();
    }
  },

 
});