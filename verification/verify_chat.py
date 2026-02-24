from playwright.sync_api import sync_playwright
import json

def verify_chat():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Inject user profile to bypass onboarding
        profile = {
            "name": "Test User",
            "goal": "Security Testing",
            "lifeMode": "STUDENT",
            "knowledgeGraph": [],
            "metaInsights": [],
            "digitalTwin": {
                "knowledgeMap": {},
                "examSkills": {"precision": 50, "timeManagement": 50, "reasoning": 50},
                "weaknesses": [],
                "recentMood": "focused"
            }
        }

        # We need to set localStorage before loading the page logic that checks it.
        # However, we can't set localStorage on a blank page easily without a domain.
        # Strategy: Go to page, set storage, reload.

        page = context.new_page()
        try:
            page.goto("http://localhost:3000")
        except Exception as e:
            print(f"Error navigating: {e}")
            return

        # Handle AuthGate if present
        # Click "Continue as Guest" if visible
        try:
            guest_btn = page.get_by_role("button", name="Continue as Guest")
            if guest_btn.is_visible(timeout=2000):
                guest_btn.click()
                print("Clicked Continue as Guest")
        except:
            print("Guest button not found or not needed")

        # Inject profile
        page.evaluate(f"localStorage.setItem('study_os_profile', '{json.dumps(profile)}');")
        print("Injected profile")

        # Reload to pick up profile
        page.reload()

        # Wait for ChatInterface
        # Look for the input field
        try:
            chat_input = page.get_by_role("textbox", name="Message input")
            chat_input.wait_for(state="visible", timeout=10000)
            print("Chat input found")

            # Type a message
            chat_input.fill("Hello, is the API key safe?")

            # Click send
            send_btn = page.get_by_role("button", name="Send message")
            send_btn.click()
            print("Message sent")

            # Wait a bit for response (it will likely fail or show thinking)
            page.wait_for_timeout(2000)

            # Take screenshot
            page.screenshot(path="verification/verification.png")
            print("Screenshot taken")

        except Exception as e:
            print(f"Error interacting with chat: {e}")
            page.screenshot(path="verification/error.png")

        browser.close()

if __name__ == "__main__":
    verify_chat()
