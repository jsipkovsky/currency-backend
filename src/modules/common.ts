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


  export async function getFirstNetwork(currencies: { [x: string]: any; }, coin: string | number) {
    try {

        // Check if the coin exists in the fetched data
        if (currencies[coin]) {
            const coinInfo = currencies[coin];

            // Extract network information
            const networks = coinInfo.networks || {};

            // Get the first network details
            const firstNetwork = Object.keys(networks)[0];
            const erc = networks['ERC20'];
            if (erc) {
                return 'ERC20';
            }
            if (firstNetwork) {
                return networks[firstNetwork].network;
            } else {
                return '';  
            }
        } else {
          return ''; 
        }
    } catch (error) {
        console.error('Error fetching currencies:', error);
    }
}