import { loadScript } from '@paypal/paypal-js';

const clientID = '';
const enableFunding = 'card,venmo';
const components = 'buttons,hosted-fields,funding-eligibility';
const intent = 'authorize';
const currency = 'USD';

(async () => {
  const clientToken = await generateClientToken();
  const paypal = await loadScript({
    'client-id': clientID,
    'data-client-token': clientToken,
    'enable-funding': enableFunding,
    components,
    intent,
    currency,
  });

  if (paypal.HostedFields.isEligible()) {
    const hostedFields = await paypal.HostedFields.render({
      createOrder,

      styles: {
        input: {
          width: '100%',
          'font-size': '16px',
          'font-family': 'Verdana',
          'line-height': '30px',
          padding: '10px 20px',
        },
        '.number': {
          padding: '10px',
        },
        '.valid': {
          color: 'green',
        },
        '.invalid': {
          color: 'red',
        },
      },
      fields: {
        number: {
          selector: '#card-number',
          placeholder: 'Card Number',
        },
        cvv: {
          selector: '#card-cvv',
          placeholder: 'CVV',
        },
        expirationDate: {
          selector: '#card-expiration-date',
          placeholder: 'Expiration',
        },
      },
    }).catch(err => {
      console.error(err);
    });

    document.querySelector('#app button')
      .addEventListener('click', async function () {
        const submitResponse = await hostedFields.submit({
          cardholderName: 'Sandbox Client',
          billingAddress: {
            streetAddress: '42 Sanctuary',
            extendedAddress: '',
            region: 'CA',
            locality: 'Irvine',
            postalCode: '92620',
            countryCodeAlpha2: 'US',
          },
          contingencies: ['SCA_WHEN_REQUIRED'],
        });

        console.log(submitResponse);
      });
  } else {
    document.write('Not eligible for hosted fields');
  }
})()

async function generateClientToken () {
  const response = await fetch('http://localhost:6011/token');
  const { clientToken } = await response.json();

  return clientToken;
}

async function createOrder () {
  const response = await fetch('http://localhost:6011/order', {
    method: 'POST',
  });

  const { orderID } = await response.json();

  return orderID;
}
