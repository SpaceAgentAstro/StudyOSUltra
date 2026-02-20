
import os
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

    page.add_init_script("""
        localStorage.setItem('study_os_profile', JSON.stringify({
            "name": "Test User",
            "subjects": ["Math"],
            "goal": "Pass",
            "hasCompletedOnboarding": true,
            "digitalTwin": { "examSkills": {}, "knowledgeMap": {} },
            "lifeMode": "STUDENT",
            "knowledgeGraph": [],
            "metaInsights": []
        }));
        localStorage.setItem('study_os_profile::guest', JSON.stringify({
            "name": "Test User",
            "subjects": ["Math"],
            "goal": "Pass",
            "hasCompletedOnboarding": true,
            "digitalTwin": { "examSkills": {}, "knowledgeMap": {} },
            "lifeMode": "STUDENT",
            "knowledgeGraph": [],
            "metaInsights": []
        }));
    """)

    try:
        page.goto("http://localhost:3000")

        # Check if AuthGate is present and click Continue as Guest
        try:
            # Wait for either AuthGate or Chat Interface
            # AuthGate has text "Continue as Guest"
            # Chat Interface has "Ask The Council..." or similar input
            # If we see "Preparing Study OS...", we wait.
            page.wait_for_selector("text=Continue as Guest", timeout=5000)
            print("Clicking Continue as Guest...")
            page.click("text=Continue as Guest")
        except:
            print("AuthGate not found or already logged in/bypassed")

        # Wait for input
        print("Waiting for chat input...")
        page.wait_for_selector("input[placeholder*='Ask']", timeout=10000)

        # Type a message with code block
        code_message = "Here is some code:\n```javascript\nconsole.log('test');\n```"
        print("Typing message...")
        page.fill("input[placeholder*='Ask']", code_message)

        print("Sending message...")
        page.press("input[placeholder*='Ask']", "Enter")

        # Wait for the message to appear
        print("Waiting for Code Snippet...")
        page.wait_for_selector("text=Code Snippet", timeout=5000)

        # Take screenshot
        if not os.path.exists("verification"):
            os.makedirs("verification")
        page.screenshot(path="verification/chat_code_block.png")
        print("Screenshot taken: verification/chat_code_block.png")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
