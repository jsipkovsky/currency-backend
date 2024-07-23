import axios from 'axios';
import * as crypto from 'crypto-js';

export async function testBB() {
    let timestamp = Date.now(); // 1. Current timestamp

    let param = {
        pair:'BIX_USDT',
        account_type: 0,
        order_side: 2,
        order_type: 2,
        price: 0.05458,
        amount: 100
    };

    let strParam = JSON.stringify(param); // 2. Formatting parameters

    let strToSign ='' + timestamp + strParam; // 3. This is the string that needs to be signed

    let apikey = "00625568558820892a8c833c33ebc8fd2701efe"; 
    let secret = "c708ac3e70d115ec29efbee197330627d7edf842"
    let sign = crypto.HmacMD5(strToSign, secret).toString();//4. Signed result

    let url = "https://api.bibox.com/v3.1/orderpending/trade";

    try {
        const response = await axios.post(url, strParam, {
            headers: {
                'content-type': 'application/json',
                // 'bibox-api-key': null,
                // 'bibox-api-sign': sign,
                'bibox-timestamp': timestamp.toString()
            }
        });
        console.log(response.data);
    } catch (error: Error | any
    ) {
       console.error(`Error: ${error.response ? error.response.data : error.message}`);
    }
}