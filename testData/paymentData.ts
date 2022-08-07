interface TestPaymentData {
  email: string;
  paymentAmount: string;
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
}

export const testData: TestPaymentData = {
  email: 'chibukhashviligiorgi@gmail.com',
  paymentAmount: '0.01',
  clientId: process.env.CLIENT_ID ? process.env.CLIENT_ID : '',
  clientSecret: process.env.CLIENT_SECRET ? process.env.CLIENT_SECRET : '',
  redirectUrl: 'https://yourapp.com/callback'
}