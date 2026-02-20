
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

        # Inject guest profile to bypass onboarding if needed,
        # BUT we want to test "Continue as Guest" flow.
        # However, Onboarding might show up if we don't have profile.
        # Let's clean state first.
        page.goto("http://localhost:3000/")
        page.evaluate("window.localStorage.clear()")
        page.reload()

        print("Navigated to home")

        # 1. AuthGate
        print("Checking AuthGate...")
        page.wait_for_selector("text=Continue as Guest", timeout=10000)
        page.screenshot(path="verification/1_authgate.png")

        # 2. Click Guest
        print("Clicking Continue as Guest...")
        page.click("text=Continue as Guest")

        # 3. Onboarding might appear
        # Check for "Welcome to Study OS" or similar onboarding text
        try:
            print("Checking for Onboarding...")
            page.wait_for_selector("text=Welcome to Study OS", timeout=5000)
            page.screenshot(path="verification/2_onboarding.png")

            # Fill onboarding
            print("Filling Onboarding...")
            page.fill("input[placeholder*='Your Name']", "Test User")
            page.click("button:has-text('Next')")
            time.sleep(1)
            # Step 2: Goal
            page.fill("textarea", "Pass exams")
            page.click("button:has-text('Next')")
            time.sleep(1)
            # Step 3: Subjects (skip or select)
            # Assuming there is a Next button
            page.click("button:has-text('Complete Setup')")
            time.sleep(2)
        except Exception as e:
            print(f"Onboarding not found or error: {e}")
            # Maybe we are already in dashboard/chat?

        # 4. Main App - Chat Interface
        print("Checking Chat Interface...")
        page.wait_for_selector("text=The Council", timeout=10000)
        page.screenshot(path="verification/3_chat_interface.png")

        # 5. Check Sidebar accessibility
        print("Checking Sidebar...")
        # Verify aria-label
        dashboard_btn = page.locator("button[aria-label='Dashboard']")
        if dashboard_btn.count() > 0:
            print("Sidebar 'Dashboard' button has aria-label")
        else:
            print("Sidebar 'Dashboard' button MISSING aria-label")

        # 6. Navigate to Sources
        print("Navigating to Sources...")
        page.click("button[aria-label='Sources']")
        time.sleep(1)
        page.screenshot(path="verification/4_sources.png")

        # 7. Check FileUploader state
        # Just visual check via screenshot

        browser.close()

if __name__ == "__main__":
    os.makedirs("verification", exist_ok=True)
    run_verification()
