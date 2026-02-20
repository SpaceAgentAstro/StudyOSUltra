from playwright.sync_api import sync_playwright
import json

def verify_sidebar():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        print("Navigating to http://localhost:3000")
        page.goto("http://localhost:3000")

        # Inject localStorage to bypass onboarding
        print("Injecting localStorage...")
        profile_data = {
            "name": "Test User",
            "subjects": ["Math"],
            "goal": "Testing",
            "hasCompletedOnboarding": True,
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

        # Pass the data safely to evaluate
        page.evaluate("""(data) => {
            localStorage.setItem('study_os_profile::guest', JSON.stringify(data));
        }""", profile_data)

        # Click "Continue as Guest" if present
        try:
            guest_button = page.get_by_role("button", name="Continue as Guest")
            if guest_button.is_visible():
                print("Clicking 'Continue as Guest'...")
                guest_button.click()
        except Exception as e:
            print(f"Guest button interaction failed or not needed: {e}")

        # Wait for the sidebar to load
        print("Waiting for sidebar...")
        # Sidebar nav
        page.wait_for_selector('nav', timeout=10000)

        # Find the dashboard button
        dashboard_button = page.get_by_role("button", name="Dashboard")

        # Verify attributes
        aria_label = dashboard_button.get_attribute("aria-label")
        title = dashboard_button.get_attribute("title")

        print(f"Dashboard Button - aria-label: {aria_label}")
        print(f"Dashboard Button - title: {title}")

        if aria_label == "Dashboard" and title == "Dashboard":
            print("SUCCESS: Attributes verified correctly.")
        else:
            print("FAILURE: Attributes are incorrect.")

        # Hover to trigger potential tooltip
        try:
            dashboard_button.hover(timeout=2000)
        except Exception as e:
            print(f"Hover failed: {e}")

        # Take a screenshot of the sidebar area
        # We need to target the sidebar container more reliably
        # The sidebar is the parent div of the nav
        sidebar = page.locator("nav").locator("..")
        sidebar.screenshot(path="verification/sidebar_verification.png")

        # Also take a full page screenshot just in case
        page.screenshot(path="verification/full_page.png")

        browser.close()

if __name__ == "__main__":
    verify_sidebar()
