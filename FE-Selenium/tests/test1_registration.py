# test1_registration.py
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import time

class RegistrationTests:
    def __init__(self, driver, report_generator):
        self.driver = driver
        self.report_generator = report_generator

    def open_signup_page(self):
        try:
            self.driver.get("http://localhost:3000")
            wait = WebDriverWait(self.driver, 10)
            get_started_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[span[text()='Get Started']]")))
            get_started_button.click()
            sign_up_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[@href='/signup' and contains(@class, 'text-primary')]")))
            sign_up_button.click()
            time.sleep(2)
        except Exception as e:
            print(f"Error occurred while navigating to the sign-up page: {e}")
            self.report_generator.add_test_result("Open Signup Page", "Fail", str(e))

    def fill_signup_form(self, username, email, first_name, last_name, password, security_question, security_answer):
        try:
            wait = WebDriverWait(self.driver, 10)
            username_field = wait.until(EC.presence_of_element_located((By.ID, "username")))
            email_field = wait.until(EC.presence_of_element_located((By.ID, "email")))
            first_name_field = wait.until(EC.presence_of_element_located((By.ID, "firstName")))
            last_name_field = wait.until(EC.presence_of_element_located((By.ID, "lastName")))
            password_field = wait.until(EC.presence_of_element_located((By.ID, "password")))
            security_answer_field = wait.until(EC.presence_of_element_located((By.ID, "securityAnswer")))

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

            security_question_combobox = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@role='combobox']")))
            security_question_combobox.click()
            dropdown_options = wait.until(EC.presence_of_all_elements_located((By.XPATH, "//div[@role='option']")))

            for option in dropdown_options:
                if option.text == security_question:
                    option.click()
                    break

            submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            submit_button.click()

            time.sleep(3)
        except Exception as e:
            print(f"Error occurred while filling the form: {e}")
            self.report_generator.add_test_result("Fill Signup Form", "Fail", str(e))

    def check_for_error_message(self, test_desc = None):
        try:
            error_message = self.driver.find_element(By.CLASS_NAME, "error-message")
            print(f"Error message: {error_message.text}")
            self.report_generator.add_test_result(f"Check for Error Message {test_desc}", "Pass", error_message.text)
            return True
        except:
            self.report_generator.add_test_result(f"Check for Error Message {test_desc}", "Fail", "No error message found")
            return False

    def check_for_redirect_to_home(self):
        try:
            wait = WebDriverWait(self.driver, 10)
            wait.until(EC.url_contains("/home"))
            current_url = self.driver.current_url
            if "/home" in current_url:
                self.report_generator.add_test_result("Signup Redirect to Home", "Pass")
                return True
            else:
                self.report_generator.add_test_result("Signup Redirect to Home", "Fail", f"Current URL: {current_url}")
                return False
        except Exception as e:
            self.report_generator.add_test_result("Signup Redirect to Home", "Fail", str(e))
            return False

def run_tests(driver, report_generator):
    """
    This function runs the registration tests using the shared driver and report generator.
    """
    tests = RegistrationTests(driver, report_generator)

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
    if tests.check_for_error_message(test_desc="Try invalid email and weak password"):
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
    if tests.check_for_error_message(test_desc="Try valid email but weak password"):
        print("Error message displayed as expected for weak password.")

    # Test 4: Valid inputs
    print("Running test with valid inputs...")
    tests.fill_signup_form(
        username="johnlol12345",
        email="johnlol12345@example.com",
        first_name="Test",
        last_name="User",
        password="StrongPassword123!",  # Valid password
        security_question="What was your childhood nickname?",  
        security_answer="Red"
    )
    if tests.check_for_redirect_to_home():
        print("User successfully registered and redirected to home page!")
