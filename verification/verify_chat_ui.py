import json
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        profile = {
            "name": "Test User",
            "subjects": [],
            "goal": "Test",
            "hasCompletedOnboarding": True,
            "digitalTwin": {
                "examSkills": {"precision": 50, "timeManagement": 50, "reasoning": 50},
                "knowledgeMap": {},
                "weaknesses": [],
                "recentMood": "focused"
            },
            "lifeMode": "STUDENT",
            "knowledgeGraph": [],
            "metaInsights": []
        }

        page = context.new_page()
        page.goto("http://localhost:3000")

        # Set localStorage
        profile_json = json.dumps(profile)
        page.evaluate(f"localStorage.setItem('study_os_profile', '{profile_json}')")

        page.reload()

        try:
            page.wait_for_selector("text=Welcome to your Study Universe", timeout=10000)
            print("Chat found.")
        except:
            print("Chat not found.")

        page.screenshot(path="verification/chat_interface.png")
        browser.close()

if __name__ == "__main__":
    run()
