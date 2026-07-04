import { Page, expect } from '@playwright/test';

export class SearchPage {
    constructor(private readonly page: Page) {}

    async open(url: string): Promise<void> {
        await this.page.goto(url);
        await expect(this.page).toHaveURL(url);
    }

    async searchLocation(location: string): Promise<void> {

        const pickupLocation = this.page.locator('input[name="pickup-location"]');
        await pickupLocation.fill(location);

        const firstOption = this.page.getByRole('option').first();
        await expect(firstOption).toBeVisible();
        await firstOption.click();
    }

    async submitSearch(): Promise<void> {
        const searchButton = this.page.getByRole('button', { name: 'Search' });
        await searchButton.click();
    }
}