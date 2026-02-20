from playwright.sync_api import sync_playwright
import json
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Inject guest profile to bypass onboarding
        guest_profile = {
            "hasCompletedOnboarding": True,
            "name": "Guest",
            "subjects": [],
            "goal": "Verify",
            "digitalTwin": {
                "knowledgeMap": {},
                "examSkills": {"timeManagement": 50, "precision": 50, "reasoning": 50},
                "weaknesses": [],
                "recentMood": "focused"
            },
            # Phase 8 additions
            "lifeMode": "STUDENT",
            "knowledgeGraph": [],
            "metaInsights": []
        }

        # We need to set this before navigating
        context.add_init_script(f"""
            localStorage.setItem('study_os_profile::guest', '{json.dumps(guest_profile)}');
        """)

        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000")

        # Wait for potential AuthGate / Onboarding
        try:
            guest_btn = page.get_by_role("button", name="Continue as Guest")
            if guest_btn.is_visible():
                print("Clicking Continue as Guest...")
                guest_btn.click()
        except:
            pass

        print("Waiting for Sidebar...")
        page.wait_for_selector("nav", timeout=5000)

        print("Navigating to Chat...")
        # Use exact label from Sidebar.tsx
        try:
            chat_btn = page.get_by_text("Council Chat", exact=False)
            chat_btn.click()
            print("Clicked Council Chat")
        except Exception as e:
            print(f"Failed to click Chat: {e}")
            page.screenshot(path="verification/error_nav.png")
            raise e

        # Wait for Chat Interface
        print("Waiting for welcome message...")
        try:
            expect_text = page.get_by_text("Welcome to your Study Universe")
            expect_text.wait_for(state="visible", timeout=10000)
            print("Welcome message found!")
        except Exception as e:
            print(f"Error finding welcome message: {e}")
            page.screenshot(path="verification/error.png")
            raise e

        # Take screenshot of the chat
        time.sleep(1) # Wait for animations
        page.screenshot(path="verification/chat_verified.png")
        print("Screenshot saved to verification/chat_verified.png")

        browser.close()

if __name__ == "__main__":
    run()
