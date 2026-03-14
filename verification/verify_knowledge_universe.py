from playwright.sync_api import sync_playwright
import time

def verify_knowledge_universe():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Inject Guest Profile to bypass onboarding
        page.add_init_script("""
            localStorage.setItem('study_os_profile', JSON.stringify({ hasCompletedOnboarding: true }));
        """)

        page.goto('http://localhost:3000')

        # Click "Continue as Guest" if it appears
        try:
             page.get_by_role('button', name='Continue as Guest').click(timeout=3000)
             page.wait_for_timeout(1000)
        except:
             pass

        # Wait for the dashboard to load
        page.wait_for_selector('text=Galactic Maestro')

        # Click the 'Knowledge Universe' button from the sidebar
        page.get_by_role('button', name='Knowledge Universe').click()

        # Take screenshot of the knowledge universe page
        page.screenshot(path='/app/verification/knowledge_universe_accessible.png')

        browser.close()

if __name__ == '__main__':
    verify_knowledge_universe()
