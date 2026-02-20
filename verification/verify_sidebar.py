import os
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to app
        print("Navigating to http://localhost:3000")
        page.goto("http://localhost:3000")

        # Wait for sidebar
        print("Waiting for sidebar...")
        # The Dashboard button should have aria-label='Dashboard'
        dashboard_btn = page.locator("button[aria-label='Dashboard']")

        # Verify Dashboard button exists and has correct attributes
        expect(dashboard_btn).to_be_visible()
        expect(dashboard_btn).to_have_attribute("title", "Dashboard")
        print("Verified Dashboard button attributes")

        # Verify another button, e.g. Game Center
        game_center = page.locator("button[aria-label='Game Center']")
        expect(game_center).to_be_visible()
        expect(game_center).to_have_attribute("title", "Game Center")
        print("Verified Game Center button attributes")

        # Check aria-current (should be on Council Chat by default in App.tsx)
        # const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);
        chat_btn = page.locator("button[aria-label='Council Chat']")
        expect(chat_btn).to_have_attribute("aria-current", "page")
        print("Verified aria-current on active item")

        # Focus on Dashboard button to show focus ring in screenshot
        dashboard_btn.focus()

        # Take screenshot
        screenshot_path = os.path.abspath("verification/sidebar_accessibility.png")
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    run()
