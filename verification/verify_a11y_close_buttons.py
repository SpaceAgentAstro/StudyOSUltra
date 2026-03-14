from playwright.sync_api import sync_playwright
import time

def test_a11y_close_buttons(page):
    page.goto("http://localhost:3000")

    # Bypass onboarding
    page.evaluate("localStorage.setItem('study_os_profile', JSON.stringify({hasCompletedOnboarding: true}))")
    page.reload()

    page.wait_for_selector("button:has-text('Continue as Guest')")
    page.click("button:has-text('Continue as Guest')")

    page.wait_for_selector("text=Good Afternoon") # Dashboard

    # Go to Knowledge Universe via Dashboard button
    page.wait_for_selector("button:has-text('Enter Universe')")
    page.click("button:has-text('Enter Universe')")

    # In Knowledge Universe
    page.wait_for_selector("text=Lifelong Concept Graph")

    # Click Generate Graph to get a node
    page.wait_for_selector("button:has-text('Generate Graph')")
    page.click("button:has-text('Generate Graph')")

    # Wait for nodes to appear. Click the first node (circle)
    page.wait_for_selector("circle")
    page.locator("circle").first.click()

    # Wait for the detail panel with the close button
    close_btn_ku = page.locator("button[aria-label='Close details']")
    close_btn_ku.wait_for(state="visible")
    print("Found 'Close details' aria-label in KnowledgeUniverse!")
    page.screenshot(path="verification/verification.png")

    close_btn_ku.click()

    # Go to Cognitive Lab
    # Open Sidebar menu, we might need to find the sidebar button
    sidebar_btn = page.locator("button[aria-label='Cognitive Lab']")
    sidebar_btn.click()

    # In Cognitive Lab
    page.wait_for_selector("text=Cognitive Skills Lab")

    # Wait for exercises to load.
    page.wait_for_selector("text=Train abstract reasoning", timeout=10000)

    # Wait for the pulse loading to go away if any
    try:
        page.wait_for_selector("text=Loading Neuro-Training Modules", state="hidden", timeout=10000)
    except:
        pass

    # Click the first exercise
    first_exercise = page.locator(".bg-white.p-6.rounded-2xl.border").first
    first_exercise.wait_for(state="visible")
    first_exercise.click()

    # Verify the close button has the aria-label
    close_btn_cl = page.locator("button[aria-label='Close exercise']")
    close_btn_cl.wait_for(state="visible")
    print("Found 'Close exercise' aria-label in CognitiveLab!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_a11y_close_buttons(page)
        finally:
            browser.close()
