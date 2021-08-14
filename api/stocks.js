const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID)

const axios = require('axios');
const alpha = require('alphavantage')({ key: '25HJBHQR119ETNYT' })
const redis = require('redis');

const client = redis.createClient(process.env.REDIS_URL);  

module.exports = (req, res) => {
    //get the ticker
    const { ticker = 'shop' } = req.query;
    const hashname = 'stockshash';
    console.log(ticker);

    //Build the stock URL
    let base = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='; 
    let keystring = '&apikey=25HJBHQR119ETNYT';
    let alphaurl = base + ticker + keystring;
    console.log(alphaurl);

    const getPrice = async () => {
        try {
                const response = await axios.get(alphaurl);
                //console.log(response.data)
                const stocks = response.data['Global Quote']['05. price'];
                console.log("Returned price data from alphavantage: " + stocks);
                return stocks
            } catch (err) {
                console.log(err)
            }
        }
    
    const sendEmail = async() => {
        try {
            const datatosend = await getPrice();
            const logged = await logData(datatosend);
            //console.log(datatosend)

            const msg = {
                to: 'eytans@gmail.com',
                from: 'eytans@gmail.com',
                subject: 'Hello from Eytan',
                text: 'and easy to do anywhere, even with Node.js',
                html: "The price of " + ticker + " is: " + datatosend,
            }

            sgMail
                .send(msg)
                .then((response) => {
                console.log(response[0].statusCode)
                //console.log(response[0].headers)
            })
            .catch((error) => {
                console.error(error)
            })

            res.status(200).send("The price of " + ticker + " is: " + datatosend);

        } catch (err) {
            console.log(err)
        }
    }

    const logData = async price => {
 
        // Cache the ticker data in redis and set an expiration date of 60 seconds from when it was added
        try {
            console.log("Trying to log data" + price)
            client.hmset(ticker,["price", price], function(err, res) {
                console.log(res);
              });
            
            client.expire(ticker,120);

            client.hgetall(ticker, function(err, result2) {
                console.log(result2)
              });

            client.hlen(ticker, function(err, result3) {
                console.log("Number of elements in Redis set:" + result3)
              });

              return true;
        } catch (err) {
            console.log(err)
        }
    }

    sendEmail()
};