from langchain_community.llms import Ollama
from openpyxl import Workbook

#  Load model (use mistral if system supports, else keep phi3)
llm = Ollama(model="phi3")
# llm = Ollama(model="mistral")  # optional upgrade


#  SRS
srs_text = """
Lucid AI – Big Skill Challenge™ Platform

User Stories & Acceptance Criteria

EPIC 1: User Registration & Authentication
US 1.1 – User Registration
As a participant, I want to register so that I can participate in competitions.
• User enters email and details
• OTP sent to email
• OTP verification required
• Consent checkboxes mandatory
• Error for invalid email

EPIC 2: Competition Entry & Payment
US 2.1 – Make Payment
As a participant, I want to pay entry fee.
• Secure payment processing
• Success confirmation shown
• Failure shows error
• Payment logged

EPIC 3: Quiz Qualification
US 3.1 – Attempt Quiz
As a participant, I want to answer quiz questions.
• Questions shown one by one
• Time limit per question
• Answer required

EPIC 4: Creative Submission
US 4.1 – Submit Creative Entry
As a participant, I want to submit a 25-word response.
• Exactly 25 words required
• Submit enabled only at 25 words
• Entry saved successfully

EPIC 5: AI Adjudication
US 5.1 – AI Evaluation
As a system, I want to evaluate entries using AI.
• Scoring based on rubric
• Deterministic output
• Scores logged
"""


#  STEP 1 — MODULES (IMPORTANT)
modules = [
    "Authentication",
    "Payment",
    "Quiz",
    "Submission",
    "AI Scoring",
    "API",
    "Database",
    "Security",
    "Error Handling"
]


#  Generate test cases per module
def generate_test_cases_for_module(srs, module):
    prompt = f"""
    You are a senior QA engineer.

    Generate test cases ONLY for module: {module}

    REQUIREMENTS:
    - Generate around 12 test cases
    - Include Positive, Negative, Edge, Boundary

    STRICT FORMAT (VERY IMPORTANT):
    Type | Module | Steps | ExpectedResult

    RULES:
    - DO NOT include TestCaseID
    - DO NOT include words like "Steps:" or "ExpectedResult:"
    - Keep sentences short and clear
    - No headings
    - No explanation

    Example:
    Positive | Payment | Enter valid card details | Payment successful
    Negative | Payment | Enter invalid card number | Error message shown

    SRS:
    {srs}
    """
    return llm.invoke(prompt)


#  Save to Excel
def save_to_excel(test_cases_text):
    wb = Workbook()
    ws = wb.active
    ws.title = "Test Cases"

    ws.append(["TestCaseID", "Type", "Module", "Steps", "ExpectedResult"])

    lines = test_cases_text.split("\n")

    tc_counter = 1

    for line in lines:
        if "|" in line:
            parts = [p.strip() for p in line.split("|")]

            if len(parts) >= 4:
                tc_id = f"TC{tc_counter:03}"

                type_ = parts[0]
                module = parts[1]
                steps = parts[2]
                expected = parts[3]

                ws.append([tc_id, type_, module, steps, expected])

                tc_counter += 1

    wb.save("test_cases.xlsx")
    print(" Clean Excel saved")


#  MAIN
if __name__ == "__main__":

    print("🔄 Generating test cases module by module...\n")

    all_test_cases = ""

    for module in modules:
        print(f"👉 Generating for {module}...")
        result = generate_test_cases_for_module(srs_text, module)
        all_test_cases += result + "\n"

     #   counter += 12   # because we generate 12 test cases per module

    print("\n=== FINAL TEST CASES ===")
    print(all_test_cases)

    save_to_excel(all_test_cases)