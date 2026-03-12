from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        print("Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")

        # Handle Onboarding
        if page.is_visible("text=Welcome to the Future of Studying"):
            print("Onboarding detected. Completing onboarding...")
            page.fill("input[placeholder='e.g. Alex']", "Test User")
            page.fill("input[placeholder='e.g. Ace my Biology Finals']", "Testing")
            page.click("text=Next Step")
            page.wait_for_timeout(500)

            # Step 2: Upload Your Brain
            if page.is_visible("text=Upload Your Brain"):
                print("Step 2 detected. Clicking Next Step...")
                page.click("text=Next Step") # or "Skip"? The screenshot shows "Next Step"
                page.wait_for_timeout(500)

            # Step 3: Ready?
            if page.is_visible("text=Ready"):
                print("Step 3 detected. Clicking Launch Galactic Maestro...")
                page.click("text=Launch Galactic Maestro")

        elif page.is_visible("text=Galactic Maestro"):
            print("AuthGate detected.")
            page.click("text=Continue as Guest")

        # Wait for ChatInterface
        print("Waiting for ChatInterface...")
        page.wait_for_selector("text=Welcome to your Study Universe", timeout=10000)

        # Ensure Onboarding is gone (not visible)
        if page.is_visible("text=Upload Your Brain"):
             print("Warning: Onboarding still visible?")

        # Check for aria-pressed
        print("Checking for aria-pressed attributes...")
        thinking_button = page.get_by_label("Toggle Thinking Mode")
        expect_pressed = thinking_button.get_attribute("aria-pressed")
        print(f"Thinking Mode aria-pressed: {expect_pressed}")

        if expect_pressed != "false":
            print("ERROR: Thinking Mode aria-pressed should be 'false' initially")

        # Take screenshot
        screenshot_path = "verification/merge_verification.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error_merge.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
