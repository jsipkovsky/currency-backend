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

    let apikey = "645b96cddf7a7cad4680e8d5d1942a9a3abb87b4"; 
    let secret = "8d259ce6fc0dc42aa79e5af8b15aa0f901e6b36e";
    let sign = crypto.HmacMD5(strToSign, secret).toString();//4. Signed result

    let url = "https://api.bibox.com/v3.1/transfer/mainAssets";

    let param2 = {
        select: 1
    };
    
    let cmd = JSON.stringify(param2); //format param
    let timestamp2 ='' + (Date.now());
    let sign2 = crypto.HmacMD5(timestamp2 + cmd, secret).toString();//sign cmds

    try {
        const response = await axios.post(url, cmd, {
            headers: {
               'content-type':'application/json',
            'bibox-api-key': apikey,
            'bibox-api-sign': sign2,
            'bibox-timestamp': timestamp2
            }
        });
        console.log(response.data);
    } catch (error: Error | any
    ) {
       console.error(`Error: ${error.response ? error.response.data : error.message}`);
    }
}
