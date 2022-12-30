import express from 'express';
import cors from 'cors';
import axios from 'axios';

const baseURL = 'https://api-m.sandbox.paypal.com';
const clientID = '';
const clientSecret = '';
const client = axios.create({baseURL});

async function generateAccessToken () {
  const authUrl = `/v1/oauth2/token`;
  const data = 'grant_type=client_credentials';
  const response = await client.post(authUrl, data, {
    auth: {
      username: clientID,
      password: clientSecret,
    },
  });

  const { access_token, token_type } = response.data;

  return {
    token: access_token,
    type: token_type,
  };
}

async function generateClientToken () {
  const { token, type } = await generateAccessToken();
  const authorization = `${type} ${token}`;
  const response = await client.post('/v1/identity/generate-token', {}, {
    headers: {
      authorization,
    },
  });

  return response.data.client_token;
}

async function generateClientTokenHandler (req, res) {
  const clientToken = await generateClientToken();

  res.json({ clientToken });
}

async function createPayPalOrderHandler (req, res) {
  const { token, type } = await generateAccessToken();
  const headers = { authorization: `${type} ${token}` };
  const amount = 10.25;
  const currency = 'USD';

  const orderUrl = '/v2/checkout/orders';
  const data = {
    intent: 'AUTHORIZE',
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: amount,
        },
        custom_id: `sandbox-id-${Math.random().toString(36).slice(2)}`,
        shipping: {
          name: {
            full_name: 'Sandbox Card',
          },
          address: {
            country_code: 'US',
            address_line_1: '42 Sanctuary',
            address_line_2: '',
            admin_area_1: 'CA',
            admin_area_2: 'Irvine',
            postal_code: '92620',
          },
        },
      },
    ],
  };

  const response = await client.post(orderUrl, data, { headers });

  console.log(response.data.id);

  res.json({
    orderID: response.data.id,
  });
}

const app = express();
app.use(cors());

app.get('/token', generateClientTokenHandler);
app.post('/order', createPayPalOrderHandler);

app.listen(6011, () => {
  console.log('Server is listening on port: %d', 6011);
});
