# test2_login.py

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import time

class LoginTests:
    def __init__(self, driver, report_generator):
        self.driver = driver
        self.report_generator = report_generator

    def open_login_page(self):
        """
        Navigates to the login page.
        """
        try:
            self.driver.get("http://localhost:3000/signin")
            time.sleep(2)
        except Exception as e:
            print(f"Error occurred while navigating to the login page: {e}")
            self.report_generator.add_test_result("Open Login Page", "Fail", str(e))

    def fill_login_form(self, username, password):
        """
        Fills in the login form with provided username and password, then submits the form.
        """
        try:
            wait = WebDriverWait(self.driver, 10)
            # Wait for the username and password fields
            username_field = wait.until(EC.presence_of_element_located((By.ID, "username")))
            password_field = wait.until(EC.presence_of_element_located((By.ID, "password")))

            # Clear any pre-filled values and input the credentials
            username_field.clear()
            username_field.send_keys(username)
            password_field.clear()
            password_field.send_keys(password)

            # Find and click the submit button
            submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            submit_button.click()

            time.sleep(3)  # Adjust this based on form submission speed
        except Exception as e:
            print(f"Error occurred while filling the login form: {e}")
            self.report_generator.add_test_result("Fill Login Form", "Fail", str(e))

    def check_for_login_success(self):
        """
        Checks if the user was successfully logged in by verifying the URL or presence of an element on the homepage.
        """
        try:
            wait = WebDriverWait(self.driver, 10)
            wait.until(EC.url_contains("/home"))
            current_url = self.driver.current_url
            if "/home" in current_url:
                self.report_generator.add_test_result("Login Success", "Pass")
                return True
            else:
                self.report_generator.add_test_result("Login Success", "Fail", f"Current URL: {current_url}")
                return False
        except Exception as e:
            print(f"Error occurred while checking login success: {e}")
            self.report_generator.add_test_result("Login Success", "Fail", str(e))
            return False

    def check_for_error_message(self):
        """
        Checks for an error message on failed login attempts.
        """
        try:
            error_message = self.driver.find_element(By.CLASS_NAME, "error-message")
            print(f"Error message: {error_message.text}")
            self.report_generator.add_test_result("Check for Error Message", "Pass", error_message.text)
            return True
        except:
            self.report_generator.add_test_result("Check for Error Message", "Fail", "No error message found")
            return False

def run_tests(driver, report_generator):
    """
    This function runs the login tests using the shared driver and report generator.
    """
    tests = LoginTests(driver, report_generator)

    # Test 1: Navigate to login page
    tests.open_login_page()

    # Test 2: Try invalid credentials
    print("Running test with invalid credentials...")
    tests.fill_login_form(
        username="invalid_user",
        password="wrong_password"
    )
    if tests.check_for_error_message():
        print("Error message displayed as expected for invalid login.")

    # Test 3: Try valid credentials
    print("Running test with valid credentials...")
    tests.fill_login_form(
        username="johnlol12345",
        password="StrongPassword123!"
    )
    if tests.check_for_login_success():
        print("Login successful and redirected to the home page.")
