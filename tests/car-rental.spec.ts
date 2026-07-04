import { test } from '@playwright/test';
import { testData } from './testData';
import { SearchPage } from '../pages/SearchPage';
import { ResultsPage } from '../pages/ResultsPage';
import { CarDetailsPage } from '../pages/CarDetailsPage';
import { ExtrasPage } from '../pages/ExtrasPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test('Car booking e2e test', async ({ page, context }) => {
   test.setTimeout(240000);

   const searchPage = new SearchPage(page);
   await searchPage.open(testData.baseUrl);
   await searchPage.searchLocation(testData.location);
   await searchPage.submitSearch();

   const resultsPage = new ResultsPage(page);
   //await resultsPage.pauseForCaptcha(); // ← Pause for manual captcha pass
   await resultsPage.dismissSignInModalIfPresent();
   await resultsPage.waitForResultsUrl();

   const carNameOnResults = await resultsPage.getFirstCarName();

   const detailsPage = await resultsPage.openFirstCarDetails(context);

   const carDetailsPage = new CarDetailsPage(detailsPage);
   await carDetailsPage.waitForDealUrl();
   await carDetailsPage.proceedToExtras();

   const extrasPage = new ExtrasPage(detailsPage);
   await extrasPage.waitForExtrasUrl();
   await extrasPage.proceedToCheckout();

   const checkoutPage = new CheckoutPage(detailsPage);
   await checkoutPage.waitForCheckoutUrl();
   await checkoutPage.verifyCarName(carNameOnResults);
   await checkoutPage.verifyBookNowButtonReady();
});


// import { test, expect } from '@playwright/test';
//
// test('Car booking e2e test', async ({ page, context }) => {
//    test.setTimeout(240000);
//
//    await page.goto('https://www.booking.com/cars/index.html');
//    await expect(page).toHaveURL('https://www.booking.com/cars/index.html');
//
//    const pickupLocation = page.locator('input[name="pickup-location"]');
//    await pickupLocation.fill('New York');
//
//    const firstOption = page.getByRole('option').first();
//    await expect(firstOption).toBeVisible();
//    await firstOption.click();
//
//    const searchButton = page.getByRole('button', { name: 'Search' });
//    await searchButton.click();
//
//    await page.pause(); // ← Pause for the manual captcha pass
//
//    const closeModalButton = page.getByTestId('signin-modal-close');
//    try {
//       await closeModalButton.waitFor({ state: 'visible', timeout: 15000 });
//       await closeModalButton.click();
//    } catch {
//       // модалка не з'явилась - це нормально, продовжуємо
//    }
//
//    await expect(page).toHaveURL(/^https:\/\/cars\.booking\.com\/search-results.*/);
//
//    const carNameOnResults = await page
//        .getByRole('group')
//        .filter({ has: page.getByRole('heading', { level: 2 }) })
//        .filter({ has: page.getByRole('link', { name: /view deal/i }) })
//        .first()
//        .getByRole('heading', { level: 2 })
//        .innerText();
//
//    const dealButton = page.getByRole('link', { name: /view deal/i }).first();
//
//    const popupPromise = context.waitForEvent('page', { timeout: 5000 }).catch(() => null);
//    await dealButton.click();
//
//    const newPage = await popupPromise;
//    const detailsPage = newPage ?? page;
//
//    if (newPage) {
//       await newPage.waitForLoadState('domcontentloaded');
//    }
//
//    await expect(detailsPage).toHaveURL(/^https:\/\/cars\.booking\.com\/package\/deal.*/);
//
//    const continueButton = detailsPage.getByTestId('go-to-extras-button');
//    await continueButton.scrollIntoViewIfNeeded();
//    await expect(continueButton).toBeVisible();
//    await continueButton.click();
//
//    await expect(detailsPage).toHaveURL(/^https:\/\/cars\.booking\.com\/package\/extras.*/);
//
//    const checkoutButton = detailsPage.getByTestId('checkoutButton');
//    await checkoutButton.scrollIntoViewIfNeeded();
//    await expect(checkoutButton).toBeVisible();
//    await checkoutButton.click();
//
//    await expect(detailsPage).toHaveURL(/^https:\/\/cars\.booking\.com\/checkout.*/);
//
//    await expect(detailsPage.getByText(carNameOnResults)).toBeVisible();
//
//    const bookNowButton = detailsPage.getByTestId('checkout-form-submit-button');
//    await bookNowButton.scrollIntoViewIfNeeded();
//    await expect(bookNowButton).toBeVisible();
//    await expect(bookNowButton).toBeEnabled();
//
// });
//
