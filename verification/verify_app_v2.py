
from playwright.sync_api import sync_playwright
import time
import os

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 720}
        )
        page = context.new_page()

        page.goto("http://localhost:3000/")
        page.evaluate("window.localStorage.clear()")
        page.reload()

        # 1. AuthGate
        print("Waiting for AuthGate...")
        page.wait_for_selector("text=Continue as Guest", timeout=10000)

        # 2. Click Guest
        print("Clicking Continue as Guest...")
        page.click("text=Continue as Guest")

        time.sleep(2)
        page.screenshot(path="verification/2_after_click.png")

        # Check if we are on Onboarding
        # Look for "Let's personalize your Study OS" or "Your Name"
        if page.locator("text=Study OS").count() > 0:
             print("Found Study OS text")

        # Try to find input for name
        if page.locator("input[placeholder*='Your Name']").count() > 0:
            print("Found Onboarding Name Input. Filling...")
            page.fill("input[placeholder*='Your Name']", "Test User")

            # Look for Next button
            # It might be an arrow or text "Next"
            # Let's try to find a button
            next_btn = page.locator("button").filter(has_text="Next")
            if next_btn.count() > 0:
                next_btn.click()
                time.sleep(1)

                # Step 2: Goal
                page.fill("textarea", "Pass exams")
                next_btn.click()
                time.sleep(1)

                # Step 3
                complete_btn = page.locator("button").filter(has_text="Complete Setup")
                if complete_btn.count() > 0:
                    complete_btn.click()
                else:
                    next_btn.click() # maybe just next?

                time.sleep(2)
            else:
                print("Could not find Next button")

        # Now check for Chat Interface
        page.screenshot(path="verification/3_post_onboarding.png")

        # Look for "The Council" or "Sidebar"
        if page.locator("text=The Council").count() > 0:
            print("Chat Interface Visible")
        else:
            print("Chat Interface NOT found")

        # Check Sidebar
        dashboard_btn = page.locator("button[aria-label='Dashboard']")
        if dashboard_btn.count() > 0:
            print("Sidebar 'Dashboard' button has aria-label")

        browser.close()

if __name__ == "__main__":
    run_verification()
