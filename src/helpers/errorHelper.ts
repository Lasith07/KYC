export class FormErrors {
  title: string| null;
  fullName: string| null;
  mobileNumber: string;
  email: string| null;
  nicNumber: string| null;
  nationality: string| null;
  otp: string;
  form?: string;
  
    constructor() {
      this.title = null;
      this.fullName = null;
      this.mobileNumber = '';
      this.email = null;
      this.nicNumber = null;
      this.nationality = null;
      this.otp = '';
    }
  }