# test1_registration.py
from web_test import WebTest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import time

class RegistrationTests:
    def __init__(self, web_test_instance):
        self.web_test = web_test_instance
        self.driver = web_test_instance.driver

    def open_signup_page(self):
        """
        Navigates to the sign-up page.
        """
        try:
            # Open the main page
            self.driver.get("http://localhost:3000")

            # Wait for the "Sign Up" button to be clickable and click on it
            wait = WebDriverWait(self.driver, 10)
            get_started_button = wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[span[text()='Get Started']]"))
            )
            get_started_button.click()
           
            sign_up_button = wait.until(
                EC.element_to_be_clickable((By.XPATH, "//a[@href='/signup' and contains(@class, 'text-primary')]"))
            )
            sign_up_button.click()

            # Wait for the signup page to load
            time.sleep(2)

        except Exception as e:
            print(f"Error occurred while navigating to the sign-up page: {e}")

    def fill_signup_form(self, username, email, first_name, last_name, password, security_question, security_answer):
        """
        Fills the sign-up form with provided inputs and submits it.
        """
        try:
            wait = WebDriverWait(self.driver, 10)

            # Fill in the text fields: username, email, first name, last name, password
            username_field = wait.until(EC.presence_of_element_located((By.ID, "username")))
            email_field = wait.until(EC.presence_of_element_located((By.ID, "email")))
            first_name_field = wait.until(EC.presence_of_element_located((By.ID, "firstName")))
            last_name_field = wait.until(EC.presence_of_element_located((By.ID, "lastName")))
            password_field = wait.until(EC.presence_of_element_located((By.ID, "password")))
            security_answer_field = wait.until(EC.presence_of_element_located((By.ID, "securityAnswer")))

            # Input values into the fields
            username_field.clear()
            username_field.send_keys(username)
            email_field.clear()
            email_field.send_keys(email)
            first_name_field.clear()
            first_name_field.send_keys(first_name)
            last_name_field.clear()
            last_name_field.send_keys(last_name)
            password_field.clear()
            password_field.send_keys(password)
            security_answer_field.clear()
            security_answer_field.send_keys(security_answer)

            # Click the dropdown trigger (security question combobox)
            security_question_combobox = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@role='combobox']")))
            security_question_combobox.click()

            # Wait for the dropdown options to appear
            dropdown_options = wait.until(EC.presence_of_all_elements_located((By.XPATH, "//div[@role='option']")))

            # Select the security question by iterating over the options
            for option in dropdown_options:
                if option.text == security_question:
                    option.click()
                    break

            # Submit the form
            submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            submit_button.click()

            time.sleep(3) 

        except Exception as e:
            print(f"Error occurred while filling the form: {e}")



    def check_for_error_message(self):
        """
        Checks for any error message displayed after form submission.
        """
        try:
            error_message = self.driver.find_element(By.CLASS_NAME, "error-message")
            print(f"Error message: {error_message.text}")
            return True
        except:
            return False

    def check_for_redirect_to_home(self):
        """
        Checks if the user is redirected to the /home page after a successful sign-up.
        """
        try:
            # Wait for the URL to change to /home
            wait = WebDriverWait(self.driver, 10)
            wait.until(EC.url_contains("/home"))

            # Check if the current URL is /home
            current_url = self.driver.current_url
            if "/home" in current_url:
                print(f"Successfully redirected to: {current_url}")
                return True
            else:
                print(f"Not redirected to /home, current URL: {current_url}")
                return False
        except Exception as e:
            print(f"Error occurred while waiting for redirect: {e}")
            return False

def run_tests():
    """
    This function will run all the test cases.
    """
    chrome_test = WebTest(browser='chrome', executable_path=r"FE-Selenium\chromedriver.exe")
    
    # Start the browser driver
    driver = chrome_test.initialize_driver()

    if driver:
        # Create an instance of the RegistrationTests with the WebTest driver
        tests = RegistrationTests(chrome_test)

        # Test 1: Navigate to sign-up page
        tests.open_signup_page()

        # Test 2: Try invalid email and weak password
        print("Running test with invalid email and weak password...")
        tests.fill_signup_form(
            username="johnlol12345",
            email="invalid-email",  # Invalid email
            first_name="Test",
            last_name="User",
            password="123",  # Weak password
            security_question="What was your childhood nickname?",  
            security_answer="Red"
        )
        if tests.check_for_error_message():
            print("Error message displayed as expected for invalid inputs.")

        # Test 3: Try valid email but weak password
        print("Running test with valid email but weak password...")
        tests.fill_signup_form(
            username="johnlol12345",
            email="johnlol12345@example.com",  # Valid email
            first_name="Test",
            last_name="User",
            password="123",  # Weak password
            security_question="What was your childhood nickname?",  
            security_answer="Red"
        )
        if tests.check_for_error_message():
            print("Error message displayed as expected for weak password.")

        # Test 4: Valid inputs
        print("Running test with valid inputs...")
        tests.fill_signup_form(
            username="johnlol12345",
            email="johnlol12345@example.com",
            first_name="Test",
            last_name="User",
            password="StrongPassword123!",  # Strong password
            security_question="What was your childhood nickname?",  
            security_answer="Red"
        )
        if tests.check_for_redirect_to_home():
            print("User successfully registered and redirected to home page!")


        # Close the browser at the end of the tests
        time.sleep(10)
        chrome_test.quit_driver()

if __name__ == "__main__":
    run_tests()
