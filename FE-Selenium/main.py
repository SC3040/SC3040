import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

class WebTest:
    def __init__(self, browser, executable_path, url):
        self.browser = browser
        self.executable_path = executable_path
        self.url = url
        self.driver = self._initialize_driver()

    def _initialize_driver(self):
        """
        Initializes the browser driver based on the specified browser.
        Returns:
            WebDriver: An instance of the selected WebDriver.
        """
        if self.browser.lower() == 'chrome':
            chrome_options = ChromeOptions()
            chrome_options.add_argument("--remote-debugging-port=9222")
            service = ChromeService(executable_path=self.executable_path)
            driver = webdriver.Chrome(service=service, options=chrome_options)

        elif self.browser.lower() == 'firefox':
            firefox_options = FirefoxOptions()
            service = FirefoxService(executable_path=self.executable_path)
            driver = webdriver.Firefox(service=service, options=firefox_options)

        else:
            raise ValueError("Unsupported browser. Please choose either 'chrome' or 'firefox'.")
        
        return driver

    def run_test(self):
        """
        Runs the test by opening the URL, waiting for the button, clicking it, and closing the browser.
        """
        try:
            # Open the web page
            self.driver.get(self.url)

            # Wait for the "Get Started" button to be clickable, with a timeout of 10 seconds
            wait = WebDriverWait(self.driver, 10)
            get_started_button = wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[span[text()='Get Started']]"))
            )

            # Click the button
            get_started_button.click()

            time.sleep(5)

        except Exception as e:
            print(f"Error occurred: {e}")

        finally:
            self.driver.quit()



# Test case 1: Chrome on Windows
chrome_test = WebTest(
    browser='chrome',
    executable_path=r"FE-Selenium\chromedriver.exe",
    url="http://localhost:3000"
)
chrome_test.run_test()

'''
# Test case 2: Firefox on Linux
firefox_test = WebTest(
    browser='firefox',
    executable_path="/path/to/geckodriver",
    url="http://localhost:3000"
)
firefox_test.run_test()
'''