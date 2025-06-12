// src/helpers/vueHelper.ts
export class KycFormData {
  title: string | null;
  fullName: string | null;
  mobileNumber: number;
  email: string | null;
  nicNumber: string | null;
  nationality: string | null;
  nicFrontImage: string | null;  // Changed from File to string
  nicBackImage: string | null;   // Changed from File to string
  selfieImage: string | null;    // Changed from File to string
  id: number | null;

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
  }
}