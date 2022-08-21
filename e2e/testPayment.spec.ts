import { test, expect } from '@playwright/test';
import { testData } from '../testData/paymentData'
require('dotenv').config();

if (!process.env.BASE_URL) {
  throw new Error('BASE_URL is undefined!')
}

const demoUrl: string = process.env.BASE_URL.replace('www.', 'demo.')
const companyName: string = process.env.BASE_URL.split('.')[1]

test('Visit the home-page and make a test payment on demo page', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(`Payment infrastructure for online & in-store sales | ${companyName}.`)  

  await test.step('Ensure that the cookie banner is visible and can be closed', async () => {
    const cookieHeaderTxt = page.locator('[aria-label="Cookies & Privacy"]')
    await expect(cookieHeaderTxt).toBeVisible()
    await page.locator('text="Accept all"').click()
    await expect(cookieHeaderTxt).toBeHidden()
  })

  await test.step('Go to the demo page fill the form with the necessary data', async () => {
    const demoBtn = page.locator('[data-testid="navbar-demo"]')
    await demoBtn.click()
    expect(page.url()).toEqual(process.env.BASE_URL + '/bank-payment-flows/')
    await page.goto(demoUrl)
    await page.locator('text="Redirect payment flow"').click()
    expect(page.url()).toEqual(demoUrl + '/donate/LT')
    await page.locator('#amount').type(testData.paymentAmount)
    await page.locator('#email').type(testData.email)
    await page.locator('label[for="SWEDBANK_LT"]').click()
  })

  await test.step('Pay without agreeing to T&C, ensure that error message shows up correctly', async () => {
    let errorMsg = page.locator('text="You have to agree to the terms and conditions and privacy policy"')
    expect(await errorMsg.count()).toEqual(0)
    await page.locator('text="Pay"').click()
    errorMsg = page.locator('text="You have to agree to the terms and conditions and privacy policy"')
    expect(await errorMsg.count()).toEqual(1)
    await expect(errorMsg).toHaveCSS('color', 'rgb(255, 59, 48)')
  })

  await test.step('Pay after agreeing to T&C', async() => {
    const terms = page.locator('label[for="terms"]')
    expect(await terms.count()).toEqual(1)
    expect(await terms.allInnerTexts()).toContain('I have read and agree with terms and conditions and privacy policy')
    const checkbox = terms.locator('span')
    expect(checkbox).not.toBeChecked()
    await checkbox.click()
    expect(checkbox).toBeChecked()
    await page.locator('text="Pay"').click()
  })

  await test.step('Go back to the homepage and assert the presence of previously accepted cookies', async () => {
    await page.goto('/')
    // Ensure that the cookie banner doesn't show up:
    const cookieHeaderTxt = page.locator('[aria-label="Cookies & Privacy"]')
    await expect(cookieHeaderTxt).toBeHidden()
    // Check that the cookie is actually saved:
    const cookies = await page.context().cookies()
    let foundCookie = false
    cookies.forEach((cookie) => {
      if (cookie.name === `${companyName}-user-has-interacted-with-cookies` && cookie.value === 'true') {
        foundCookie = true
      }
    })
    expect(foundCookie).toEqual(true)
  })
})
