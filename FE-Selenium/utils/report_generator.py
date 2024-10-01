# report_generator.py
import pandas as pd

class ReportGenerator:
    def __init__(self):
        self.report_data = []

    def add_test_result(self, test_name, status, error_message=None):
        """
        Adds a test result to the report.
        :param test_name: Name of the test (e.g., 'Registration Test')
        :param status: Status of the test ('Pass', 'Fail')
        :param error_message: If the test fails, pass the error message
        """
        self.report_data.append({
            "Test Name": test_name,
            "Status": status,
            "Error Message": error_message
        })

    def generate_report(self, output_file=None):
        """
        Generates a report in the form of a Pandas DataFrame.
        :param output_file: Optional CSV file path to save the report
        :return: Pandas DataFrame
        """
        df = pd.DataFrame(self.report_data)
        if output_file:
            df.to_csv(output_file, index=False)
        return df
