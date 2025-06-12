// src/services/NetworkManager.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class NetworkManager {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Makes a POST request to the specified endpoint with the provided data.
   * @param endpoint The API endpoint to send the request to.
   * @param data The data to send in the request body.
   * @param config Optional Axios configuration (e.g., headers).
   * @returns A promise that resolves to the response data.
   */
  async post<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(endpoint, data, config);
      return response.data;
    } catch (error: any) {
      console.error(`Network error in POST ${endpoint}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error; // Let the caller handle the error
    }
  }
}

// Create a singleton instance with your .NET backend's base URL
const networkManager = new NetworkManager('https://localhost:7251');

export default networkManager;