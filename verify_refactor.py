from playwright.sync_api import sync_playwright
import json

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1920, 'height': 1080})

    # Inject localStorage before navigation? No, usually after context creation but before page load.
    # Actually, verify instruction says "add_init_script".

    profile_data = {
        "hasCompletedOnboarding": True,
        "name": "Guest User",
        "subjects": ["Math", "Science"],
        "goal": "Pass exams",
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

    # Escaping for JS injection
    profile_json = json.dumps(profile_data).replace("'", "\'")

    init_script = f"""
    localStorage.setItem('study_os_profile::guest', '{profile_json}');
    """

    context.add_init_script(init_script)

    page = context.new_page()

    # Go to app
    print("Navigating to app...")
    page.goto("http://localhost:3000/")

    # Wait for loading
    page.wait_for_timeout(5000)

    # Click "Continue as Guest" if present
    print("Looking for 'Continue as Guest' button...")
    try:
        guest_btn = page.get_by_role("button", name="Continue as Guest")
        if guest_btn.count() > 0:
            guest_btn.click()
            print("Clicked 'Continue as Guest'")
            page.wait_for_timeout(3000)
        else:
            print("Guest button not found - likely already bypassed or error")
    except Exception as e:
        print(f"Error clicking guest button: {e}")

    # Now we should be on the dashboard or chat (default view might be CHAT)
    print("Taking initial screenshot...")
    page.screenshot(path="verification_initial.png")

    # Navigate to Dashboard
    print("Navigating to Dashboard...")
    try:
        # Check if onboarding is still present
        if page.locator("text=Welcome to Study OS").count() > 0:
             print("Onboarding still visible!")

        dashboard_btn = page.get_by_role("button", name="Dashboard")
        if dashboard_btn.count() > 0:
            dashboard_btn.click()
            page.wait_for_timeout(2000)
            page.screenshot(path="verification_dashboard.png")
            print("Dashboard screenshot taken")
        else:
            print("Dashboard button not found")

    except Exception as e:
        print(f"Error navigating to Dashboard: {e}")

    # Navigate to Syllabus
    print("Navigating to Syllabus...")
    try:
        syllabus_btn = page.get_by_role("button", name="Syllabus")
        if syllabus_btn.count() > 0:
            syllabus_btn.click()
            page.wait_for_timeout(2000)
            page.screenshot(path="verification_syllabus.png")
            print("Syllabus screenshot taken")
        else:
             print("Syllabus button not found")

    except Exception as e:
        print(f"Error navigating to Syllabus: {e}")

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
