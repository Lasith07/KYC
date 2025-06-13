// src/helpers/vueHelper.ts
export class KycFormData {
  title: string | null;
  fullName: string | null;
  mobileNumber: number;
  email: string | null;
  nicNumber: string | null;
  nationality: string | null;
  nicFrontImage: FormData | null;  
  nicBackImage: FormData | null;   
  selfieImage: FormData | null;    
  id: number | null;
  nicFrontPreview: string;
  nicBackPreview: string;
  selfiePreview: string;

  constructor() {
    this.title = null;
    this.fullName = null;
    this.mobileNumber = 0;
    this.email = null;
    this.nicNumber = null;
    this.nationality = null;
    this.nicFrontImage = null;
    this.nicBackImage = null;
    this.selfieImage = null;
    this.id = null;
    this.nicFrontPreview = '';
    this.nicBackPreview = '';
    this.selfiePreview = '';
  }
}