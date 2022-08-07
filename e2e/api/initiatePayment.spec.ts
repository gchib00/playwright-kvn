import { test, expect } from '@playwright/test';
import { testData } from '../../testData/paymentData'
import { InvalidPaymentRes, ValidPaymentRes } from './resTypes';

if (!process.env.API_BASE_URL) {
  throw new Error('API_BASE_URL is undefined!')
}

const api: string = process.env.API_BASE_URL
const reqBody = {
  'amount': testData.paymentAmount,
  'currencyCode': 'EUR',
  'description': 'test',
  'bankPaymentMethod': {
    'creditorName': 'Padėk gatvės vaikams',
    'endToEndId': '1234567890',
    'informationStructured': {
      'reference': 'test'
    },
    'creditorAccount': {
      'iban': 'LT177300010119765165'
    }
  }
}
const headers = {
  'Content-Type': 'application/json',
  'Redirect-URL': testData.redirectUrl,
  'Client-Id': testData.clientId,
  'Client-Secret': testData.clientSecret,
}

test.describe('Initiate payment tests', async () => {

  test('Initiate payment with valid data', async ({ request }) => {
    const res = await request.post(api + '/pis/payment', { data: reqBody, headers: headers })
    const resData: ValidPaymentRes = await res.json()
    expect(res.status()).toEqual(200)
    expect(resData.bankStatus).toEqual('STRD')
    expect(resData.statusGroup).toEqual('started')
    expect(resData.confirmLink).toContain(resData.id)  
  })

  test('Initiate payment with invalid client ID', async ({ request }) => {
    const res = await request.post(api + '/pis/payment', {
      data: reqBody,
      headers: {
        ...headers,
        'Client-Id': testData.clientId.split('').reverse().join('')
      }
    })
    expect(res.status()).toEqual(401)
  })

  test('Initiate payment with a missing client secret value', async ({ request }) => {
    const res = await request.post(api + '/pis/payment', {
      data: reqBody,
      headers: { ...headers, 'Client-Secret': '' }
    })
    expect(res.status()).toEqual(401)
  })

  // Ensure that the redirect url validator works
  test('Initiate payment with an invalid redirect url value', async ({ request }) => {
    const res = await request.post(api + '/pis/payment', {
      data: reqBody,
      headers: { ...headers, 'Redirect-URL': 'invalid url' }
    })
    const resData: InvalidPaymentRes = await res.json()
    expect(res.status()).toEqual(400)
    expect(resData.error.name).toEqual('InvalidRedirect')
  })

  // Ensure that the payment amount format is correct, as defined in documentation.
  // It shouldn't accept any other separators, other than a decimal '.' separator.
  // The amount can have max 2 decimal digits.
  test('Payment cannot be initiated if amount value is of wrong foramt', async ({ request }) => {
    const res1 = await request.post(api + '/pis/payment', {
      data: { ...reqBody, 'amount': '1,230' },
      headers: headers
    })
    const resData1: InvalidPaymentRes = await res1.json()
    expect(res1.status()).toEqual(400)
    expect(resData1.data).toEqual('"amount" must be a number')

    const res2 = await request.post(api + '/pis/payment', {
      data: { ...reqBody, 'amount': '0.011' },
      headers: headers
    })
    const resData2: InvalidPaymentRes = await res2.json()
    expect(res2.status()).toEqual(400)
    expect(resData2.data).toEqual('"amount" contains an invalid value')
  })

  // If payment initiation is successful, the payment details should
  // be saved in the DB and can be retrieved with the payment ID
  test.only('Successfully initiated payments are saved in DB and can be accessed with a payment ID', async ({ request }) => {
    const res1 = await request.post(api + '/pis/payment', { data: reqBody, headers: headers })
    const resData1: ValidPaymentRes = await res1.json()
    expect(res1.status()).toEqual(200)

    const res2 = await request.get(api + '/pis/payment/' + resData1.id, { headers: headers })
    const resData2 = await res2.json()
    expect(res2.status()).toEqual(200)
    expect(resData2.id).toEqual(resData1.id)
    expect(resData2.amount).toEqual(reqBody.amount)
    expect(resData2.bankPaymentMethod.endToEndId).toEqual(reqBody.bankPaymentMethod.endToEndId)
  })
})
