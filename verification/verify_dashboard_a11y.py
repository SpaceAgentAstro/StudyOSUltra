import json
import time
from playwright.sync_api import Page, expect, sync_playwright

def test_dashboard_a11y(page: Page):
    # Setup Guest User Profile
    study_os_profile = {
        "hasCompletedOnboarding": True,
        "name": "Guest Test",
        "digitalTwin": {
            "examSkills": {"precision": 75}
        }
    }

    page.goto("http://localhost:3000")

    # Wait for React to load
    time.sleep(1)

    # Bypass Auth/Onboarding
    page.evaluate(f"window.localStorage.setItem('study_os_profile', '{json.dumps(study_os_profile)}')")

    # Reload to apply profile
    page.goto("http://localhost:3000")
    time.sleep(2)

    # Navigate to Dashboard via Sidebar
    page.get_by_role("button", name="Dashboard").click()

    # Take screenshot before tab navigation
    page.screenshot(path="verification/dashboard_before_tab.png")

    # Focus the Knowledge Universe card using Keyboard Tab
    page.keyboard.press("Tab")
    page.keyboard.press("Tab")
    page.keyboard.press("Tab")
    page.keyboard.press("Tab")
    page.keyboard.press("Tab")
    page.keyboard.press("Tab")
    page.keyboard.press("Tab")
    page.keyboard.press("Tab")
    page.keyboard.press("Tab")
    page.keyboard.press("Tab")
    page.keyboard.press("Tab")
    page.keyboard.press("Tab")
    page.keyboard.press("Tab")

    # Take screenshot to show focus ring
    page.screenshot(path="verification/dashboard_focused.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_dashboard_a11y(page)
            print("Dashboard accessibility verification complete.")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_dashboard_a11y.png")
        finally:
            browser.close()
