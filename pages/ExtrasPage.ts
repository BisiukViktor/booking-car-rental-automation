import { Page, expect } from '@playwright/test';

export class ExtrasPage {
    constructor(private readonly page: Page) {}

    async waitForExtrasUrl(): Promise<void> {
        await expect(this.page).toHaveURL(/^https:\/\/cars\.booking\.com\/package\/extras.*/);
    }

    async proceedToCheckout(): Promise<void> {
        // Confirmed against the live site: real data-testid.
        const checkoutButton = this.page.getByTestId('checkoutButton');
        await checkoutButton.scrollIntoViewIfNeeded();
        await expect(checkoutButton).toBeVisible();
        await checkoutButton.click();
    }
}