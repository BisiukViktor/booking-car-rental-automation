import { Page, expect } from '@playwright/test';

export class CheckoutPage {
    constructor(private readonly page: Page) {}

    async waitForCheckoutUrl(): Promise<void> {
        await expect(this.page).toHaveURL(/^https:\/\/cars\.booking\.com\/checkout.*/);
    }

    /**
     * The car name on checkout has no stable attribute/role - just a div with
     * a generated CSS class. Since the expected name is already known from the
     * results page, we check that the text appears anywhere on the page
     * rather than targeting that specific div - more resilient to markup
     * changes than a CSS-class selector.
     */
    async verifyCarName(expectedName: string): Promise<void> {
        await expect(this.page.getByText(expectedName)).toBeVisible();
    }

    /**
     * This button submits the real booking/payment form (type="submit",
     * form="checkout-form") - intentionally NOT clicked to avoid triggering
     * an actual booking/payment on the live site. Verifying it's visible and
     * enabled is treated as sufficient coverage: it confirms the checkout
     * form reached a valid, submittable state with the correct data.
     */
    async verifyBookNowButtonReady(): Promise<void> {
        const bookNowButton = this.page.getByTestId('checkout-form-submit-button');
        await bookNowButton.scrollIntoViewIfNeeded();
        await expect(bookNowButton).toBeVisible();
        await expect(bookNowButton).toBeEnabled();
    }
}