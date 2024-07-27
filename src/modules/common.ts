import axios from "axios";

export async function getPublicIP(): Promise<string> {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      return response.data.ip;
    } catch (error) {
      console.error('Error fetching public IP:', error);
      throw error;
    }
  }