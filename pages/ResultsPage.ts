import { Page, BrowserContext, expect } from '@playwright/test';

export class ResultsPage {
    constructor(private readonly page: Page) {}

    /**
     * Booking.com shows a CAPTCHA challenge during automated (Playwright)
     * runs right after Search. There is no legitimate
     * way to solve/bypass a CAPTCHA programmatically, so this pauses the test
     * and waits for a human to solve it manually in the opened browser window,
     * then click "Resume" in the Playwright Inspector.
     *
     * This only works with `--headed`; it will hang until timeout in headless
     * mode, since there is no visible window to solve the CAPTCHA in.
     */
    // async pauseForCaptcha(): Promise<void> {
    //     await this.page.pause();
    // }

    async dismissSignInModalIfPresent(): Promise<void> {
        // Confirmed against the live site: real data-testid. The modal appears
        // with an unpredictable delay after Search, so it's optional (wrapped in
        // try/catch) rather than a hard requirement.
        const closeModalButton = this.page.getByTestId('signin-modal-close');
        try {
            await closeModalButton.waitFor({ state: 'visible', timeout: 15000 });
            await closeModalButton.click();
        } catch {

        }
    }

    async waitForResultsUrl(): Promise<void> {

        await expect(this.page).toHaveURL(/^https:\/\/cars\.booking\.com\/search-results.*/);
    }

    /**
     * Reads the car name from the first real result card.
     */
    async getFirstCarName(): Promise<string> {
        return this.page
            .getByRole('group')
            .filter({ has: this.page.getByRole('heading', { level: 2 }) })
            .filter({ has: this.page.getByRole('link', { name: /view deal/i }) })
            .first()
            .getByRole('heading', { level: 2 })
            .innerText();
    }


    async openFirstCarDetails(context: BrowserContext): Promise<Page> {
        const dealButton = this.page.getByRole('link', { name: /view deal/i }).first();

        const popupPromise = context.waitForEvent('page', { timeout: 5000 }).catch(() => null);
        await dealButton.click();

        const newPage = await popupPromise;
        const detailsPage = newPage ?? this.page;

        if (newPage) {
            await newPage.waitForLoadState('domcontentloaded');
        }

        return detailsPage;
    }
}