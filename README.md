# Booking.com Car Rental — Playwright + TypeScript UI Automation

Automation of the core car rental flow on Booking.com:
**open the site → search "New York" → open a car's details page → continue through Extras → proceed to checkout → verify the checkout data matches the car selected earlier.**

Built with Playwright Test + TypeScript, using the Page Object Model pattern.

---

## ⚠️ Known limitation: Booking.com CAPTCHA on automated runs

This is the most important thing to know before running this project.

**Confirmed behavior:** Booking.com shows a CAPTCHA challenge specifically during Playwright-driven runs, right after clicking "Search". The exact same flow performed manually in a regular browser does **not** trigger it. This was verified directly, multiple times, during development:
- Manual search in a normal browser → no CAPTCHA, results load immediately
- The identical flow via Playwright → CAPTCHA appears on the results step

This is deliberate anti-bot protection on Booking.com's side (a production, commercial site), not a bug in this test. Attempting to defeat it programmatically (spoofing `navigator.webdriver`, browser fingerprinting, etc.) would mean actively circumventing a website's security measures rather than testing — that's out of scope here on principle, not just practicality.

### What this means for running the test

- **The test only works in headed mode** (`--headed`), because it includes an intentional `await page.pause()` right after the search is submitted. When the CAPTCHA appears, solve it manually in the opened browser window, then click **"Resume"** in the Playwright Inspector panel to let the test continue.
- **Headless mode will not work** — there's no visible window to solve the CAPTCHA in, so the run will simply time out waiting for the results page.
- Other legitimate options were tried and did **not** help: using `channel: 'chrome'` (real installed Chrome instead of bundled Chromium) still triggers the CAPTCHA in both headed and headless mode. This confirms the detection is based on automation itself (via the CDP protocol Playwright uses to control the browser), not the specific browser binary.

### Why this is documented, not "fixed"

A production site actively defending against automated traffic is expected behavior, not a defect. The value of this project is in demonstrating: correct flow analysis, real (DOM-verified) selectors, resilient handling of the site's inconsistent behavior (see below), and a working, readable Page Object structure — all confirmed to work end-to-end in a manually-assisted headed run.

---

## Project structure

```
project-root/
├── pages/
│   ├── SearchPage.ts       # opens the site, enters location, submits search
│   ├── ResultsPage.ts      # captcha pause, sign-in modal, reads car name, opens details
│   ├── CarDetailsPage.ts   # proceeds from car details to Extras
│   ├── ExtrasPage.ts       # proceeds from Extras to checkout
│   └── CheckoutPage.ts     # verifies checkout data, checks the final submit button
├── tests/
│   ├── testData.ts         # test data (URL, search location)
│   └── car-rental.spec.ts  # orchestrates the full end-to-end flow
├── playwright.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## What each Page Object does

### `SearchPage`
- `open(url)` — navigates to the cars page and confirms the URL
- `searchLocation(location)` — fills the pickup-location field and picks the first autocomplete suggestion
    - **Important detail:** the location input is filled directly with `.fill()`, **without** a preceding `.click()`. This was confirmed empirically during development — clicking the field first breaks the autocomplete (it starts returning "No Results Found" instead of real suggestions). This looks like another anti-automation signal on the site's side, similar in spirit to the CAPTCHA issue above.
- `submitSearch()` — clicks the Search button

### `ResultsPage`
- `pauseForCaptcha()` — pauses execution so a human can solve the CAPTCHA manually (see the limitation section above)
- `dismissSignInModalIfPresent()` — closes the "Sign in, save money" modal if it appears; wrapped in `try/catch` because it shows up with an unpredictable delay and isn't always present
- `waitForResultsUrl()` — confirms navigation to the results page (`cars.booking.com/search-results...`)
- `getFirstCarName()` — reads the name of the first real result card
- `openFirstCarDetails(context)` — clicks "View deal" and returns whichever page the details actually opened on (see "Design decisions" below)

### `CarDetailsPage`
- `waitForDealUrl()` — confirms navigation to the car's details page (`.../package/deal...`)
- `proceedToExtras()` — clicks "Continue" to move to the Extras step

### `ExtrasPage`
- `waitForExtrasUrl()` — confirms navigation to the Extras page (`.../package/extras...`)
- `proceedToCheckout()` — clicks "Go to checkout"

### `CheckoutPage`
- `waitForCheckoutUrl()` — confirms navigation to checkout (`.../checkout...`)
- `verifyCarName(expectedName)` — confirms the car name captured earlier (on the results page) also appears on the checkout page — this is the core "verify form data matches selections" check from the task
- `verifyBookNowButtonReady()` — confirms the final "Book now" button is visible and enabled, **without clicking it**

---

## Design decisions worth knowing

### Selectors are all confirmed against the live DOM
Every selector in this project was verified against the real, rendered site during development (via DevTools inspection and Playwright Inspector's "Pick locator"), not guessed from general Booking.com knowledge. Where the site has a real `data-testid` (`signin-modal-close`, `go-to-extras-button`, `checkoutButton`, `checkout-form-submit-button`), that's used — it's the most stable option. Where there's no stable attribute, role-based selectors (`role="group"`, `role="heading"`, `role="link"`) or text-based matching (`getByText`) are used instead of CSS classes, since the site's CSS classes are auto-generated (CSS Modules) and regenerate on every site build.

### `role="link"` on `<button>` elements
Several buttons on this site (e.g. "Continue", "View deal") are `<button>` tags but have `role="link"` explicitly set in their HTML. Playwright resolves accessible roles from the `role` attribute, not the tag name — so `getByRole('button', ...)` does **not** find them; `getByRole('link', ...)` or `getByTestId(...)` does.

### Handling the results card selector precisely
A result card is identified as a `role="group"` element that contains **both** an `<h2>` heading **and** a "View deal" link. Both conditions are needed together — using only "has an `<h2>`" also matches unrelated elements on the page, like the "Sign in, save money" promo banner, which also happens to use an `<h2>`.

### New tab vs. same tab
Clicking "View deal" was observed to behave inconsistently across runs — sometimes it opens the car's details page in a new browser tab (typical of the affiliate/partner integration behind Booking.com's car rental), sometimes in the same tab. `openFirstCarDetails()` handles both: it waits up to 5 seconds for a new tab to appear, and falls back to the current page if none does.

### The final "Book now" button is never clicked
That button submits a real booking/payment form (`type="submit"`, `form="checkout-form"`) on a live commercial site. Clicking it could trigger an actual booking or payment attempt. The test verifies the button is visible and enabled — confirming the checkout form reached a valid, submittable state with the correct data — and deliberately stops there.

---

## Installation

```bash
npm install
npx playwright install chromium
```

## Running the test

```bash
npx playwright test --headed
```

When the browser pauses (Playwright Inspector window opens):
1. Solve the CAPTCHA manually in the browser window
2. Click **"Resume"** in the Inspector to let the test continue

### Viewing the report

```bash
npx playwright show-report
```

---

## Possible future improvements

- Extend coverage to negative/edge scenarios from the manual test case set (invalid dates, empty location field, no-results state, etc.), following the same Page Object structure
- Add filter interaction (car type, transmission) once the exact accessible name of the filter checkboxes is confirmed against the live site
- Investigate whether a staging/sandbox environment without anti-bot protection is available for fully automated (headless, CI-ready) runs
