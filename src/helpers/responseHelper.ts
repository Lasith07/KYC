export class ApiResponse {
    status: number;
  success?: boolean | undefined;
  data?: string;
  message?: string;
    
      constructor() {
        this.status = 0; 
        this.success = undefined;
        this.data = '';
        this.message = '';
      }
    }