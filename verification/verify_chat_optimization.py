
import time
from playwright.sync_api import sync_playwright

def verify_chat_optimization():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000")

            # Wait for loading or AuthGate
            print("Waiting for AuthGate...")
            # Might take a moment to load
            page.wait_for_timeout(5000)

            # Handle AuthGate "Continue as Guest"
            try:
                guest_btn = page.get_by_role("button", name="Continue as Guest")
                if guest_btn.is_visible():
                    print("Clicking Continue as Guest...")
                    guest_btn.click()
                    page.wait_for_timeout(2000)
            except Exception as e:
                print(f"AuthGate step skipped or failed: {e}")

            # Verify Chat Interface
            print("Verifying Chat Interface...")
            # The welcome message
            welcome_text = page.get_by_text("Welcome to your Study Universe")
            welcome_text.wait_for(state="visible", timeout=10000)

            print("Chat Interface is visible.")

            # Count instances of the chat interface container to ensure only one exists?
            # It's hard to count components in compiled react, but we can check if there are multiple texts.
            # verify_chat.py existed before, maybe I can reuse logic?

            # Take screenshot
            screenshot_path = "verification/chat_optimization.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_chat_optimization()
