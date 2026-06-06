from playwright.sync_api import sync_playwright
import time
import json

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Profile to bypass onboarding
    profile = {
        "hasCompletedOnboarding": True,
        "name": "Guest User",
        "subjects": [],
        "goal": "Learn",
        "digitalTwin": {
            "knowledgeMap": {},
            "examSkills": {"precision": 50, "timeManagement": 50, "reasoning": 50},
            "weaknesses": [],
            "recentMood": "focused"
        },
        "lifeMode": "STUDENT",
        "knowledgeGraph": [],
        "metaInsights": []
    }

    # We need to set localStorage before loading the page, or load a page then set it then reload.
    # Since we need the domain to set localStorage, we load the page first.
    page.goto("http://localhost:3000")

    # Wait for the page to load enough to have a window object
    page.wait_for_timeout(2000)

    # Set localStorage for user profile
    page.evaluate(f"window.localStorage.setItem('study_os_profile', '{json.dumps(profile)}');")

    # Reload to apply
    page.reload()
    page.wait_for_timeout(3000)

    # Check if we are in the chat interface.
    page.screenshot(path="verification/initial_load.png")

    # Look for the Thinking Mode button. It has title="Thinking Mode".
    thinking_btn = page.locator('button[title="Thinking Mode"]').first

    if thinking_btn.is_visible():
        print("Found Thinking Mode button")

        # Check aria-pressed initially
        initial_pressed = thinking_btn.get_attribute("aria-pressed")
        print(f"Initial aria-pressed: {initial_pressed}")

        # Click it
        thinking_btn.click()
        page.wait_for_timeout(500)

        # Check aria-pressed after click
        after_pressed = thinking_btn.get_attribute("aria-pressed")
        print(f"After click aria-pressed: {after_pressed}")

        # Take screenshot of the button state
        thinking_btn.screenshot(path="verification/button_state.png")

        # Also check Agent selection buttons
        teacher_btn_locator = page.locator("button", has_text="Teacher").first

        if teacher_btn_locator.is_visible():
             print(f"Teacher button aria-pressed: {teacher_btn_locator.get_attribute('aria-pressed')}")
             teacher_btn_locator.click()
             page.wait_for_timeout(500)
             print(f"Teacher button aria-pressed after click: {teacher_btn_locator.get_attribute('aria-pressed')}")

    else:
        print("Thinking Mode button not found. Dumping page content to debug.")
        with open("verification/page_dump.html", "w") as f:
            f.write(page.content())

    page.screenshot(path="verification/ux_verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
