import { Page, expect } from '@playwright/test';

export class CarDetailsPage {
    constructor(private readonly page: Page) {}

    async waitForDealUrl(): Promise<void> {
        await expect(this.page).toHaveURL(/^https:\/\/cars\.booking\.com\/package\/deal.*/);
    }

    /**
     * NOTE: this button is a <button> element but has role="link" explicitly
     * set in the HTML - the accessible role Playwright sees is "link", not
     * "button", regardless of the tag name. Confirmed against the live site
     * via data-testid, which is used here instead of role+name for extra
     * stability (button text wouldn't survive localization; the testid would).
     */
    async proceedToExtras(): Promise<void> {
        const continueButton = this.page.getByTestId('go-to-extras-button');
        await continueButton.scrollIntoViewIfNeeded();
        await expect(continueButton).toBeVisible();
        await continueButton.click();
    }
}