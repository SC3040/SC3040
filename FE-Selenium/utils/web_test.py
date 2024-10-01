# web_test.py
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions

class WebTest:
    def __init__(self, browser, executable_path):
        self.browser = browser
        self.executable_path = executable_path
        self.driver = None

    def initialize_driver(self):
        """
        Initializes the browser driver (Chrome or Firefox) based on the provided browser type.
        Returns the driver instance.
        """
        try:
            if self.browser.lower() == 'chrome':
                chrome_options = ChromeOptions()
                service = ChromeService(executable_path=self.executable_path)
                self.driver = webdriver.Chrome(service=service, options=chrome_options)

            elif self.browser.lower() == 'firefox':
                firefox_options = FirefoxOptions()
                service = FirefoxService(executable_path=self.executable_path)
                self.driver = webdriver.Firefox(service=service, options=firefox_options)

            else:
                raise ValueError("Unsupported browser. Please choose either 'chrome' or 'firefox'.")

            print(f"{self.browser.capitalize()} driver initialized successfully.")
            return self.driver

        except Exception as e:
            print(f"Error initializing {self.browser} driver: {e}")
            return None

    def quit_driver(self):
        """
        Safely closes the browser driver.
        """
        if self.driver:
            self.driver.quit()
            print(f"{self.browser.capitalize()} driver closed.")
