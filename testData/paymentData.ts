interface TestPaymentData {
  email: string;
  paymentAmount: string;
  clientId: string | undefined;
  clientSecret: string | undefined;
}

export const testData: TestPaymentData = {
  email: 'chibukhashviligiorgi@gmail.com',
  paymentAmount: '0.01',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
}
