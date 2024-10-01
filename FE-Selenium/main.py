# main.py
from utils.web_test import WebTest
from utils.report_generator import ReportGenerator
from tests.test1_registration import run_tests as run_registration_tests
from tests.test2_login import run_tests as run_login_tests

def run_all_tests():
    """
    This function initializes the browser, runs all test cases, and generates the final report.
    """
    chrome_test = WebTest(browser='chrome', executable_path=r"FE-Selenium\exec\chromedriver.exe")
    driver = chrome_test.initialize_driver()

    report_generator = ReportGenerator()

    if driver:
        print("Running registration tests...")
        run_registration_tests(driver, report_generator)

        print("Running login tests...")
        run_login_tests(driver, report_generator)

        report = report_generator.generate_report("final_test_report.csv")
        print("Final Test Report:")
        print(report)

        # Close the browser after all tests are done
        chrome_test.quit_driver()

if __name__ == "__main__":
    run_all_tests()
