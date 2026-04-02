AI Testing ProjectGroupc
========================


Overview
--------
This repository contains a small Python script, `main.py`, which uses an Ollama-backed LLM (via the `langchain_community` Ollama wrapper) to generate QA test cases from an SRS text and writes them into an Excel workbook (`test_cases.xlsx`) using `openpyxl`.

The script generates test cases module-by-module (Authentication, Payment, Quiz, Submission, AI Scoring, API, Database, Security, Error Handling) and saves them in a single Excel file.

This README explains prerequisites, installation steps (Windows / cmd.exe), how to run the script, expected outputs, and common troubleshooting steps.


Quick checklist
---------------
- Python 3.8+ installed
- Ollama engine installed and models available (or Ollama host configured)
- Create & activate a virtual environment
- Install Python dependencies from `requirements.txt`
- Run `main.py` to produce `test_cases.xlsx`


Prerequisites
-------------
- Windows with cmd.exe (instructions below use cmd syntax)
- Python 3.8 or newer (3.10+ recommended)
- Git (optional)
- Ollama: the script uses the Ollama LLM client. You must have an Ollama service available locally (recommended) or accessible via an endpoint. See "Ollama notes" below.


Files of interest
-----------------
- `main.py` — main script that generates test cases and writes `test_cases.xlsx`.
- `test_cases.xlsx` — generated output (created after running the script).
- `requirements.txt` — Python dependencies (created alongside this README).


Installation (Windows, cmd.exe)
-------------------------------
1. Open a command prompt (cmd.exe).

2. Create and activate a virtual environment (recommended):

```cmd
python -m venv .venv
.\.venv\Scripts\activate
```

3. Upgrade pip and install dependencies:

```cmd
python -m pip install --upgrade pip
pip install -r requirements.txt
```


Ollama notes (important)
------------------------
The script uses `langchain_community.llms.Ollama`. That wrapper expects an Ollama host/service where models are available. There are two typical ways to satisfy this:

1. Install Ollama locally (recommended):
   - Install the Ollama app/CLI from https://ollama.ai and follow their instructions for running the Ollama service and installing a model (for example `phi3` or `mistral`).
   - Ensure the Ollama daemon is running locally and the model name in `main.py` (currently `phi3`) is available.

2. Use a remote Ollama endpoint (advanced):
   - Configure the appropriate environment variables or connection settings the `langchain_community` Ollama wrapper supports (consult the wrapper docs). You may need to set `OLLAMA_HOST` or equivalent.

Common issues:
- If the client cannot find the model, you will see a connection or model-not-found error.
- If you don't have Ollama available, the script cannot invoke the model and will fail early.


Configuration
-------------
- `main.py` currently sets the model via:

```text
llm = Ollama(model="phi3")
# llm = Ollama(model="mistral")  # optional upgrade
```

Change the model name to one installed/available on your Ollama host.

If you need to configure a custom host or API settings, set environment variables before running the script (example for Windows cmd):

```cmd
set OLLAMA_HOST=http://127.0.0.1:11434
set OLLAMA_API_KEY=your_api_key_if_applicable
```

(Adjust the names according to your Ollama client/wrapper configuration.)


Running the script
------------------
From the repository root with the virtual environment active:

```cmd
python main.py
```

Expected behavior:
- The script will print progress for each module as it generates test cases.
- It will write `test_cases.xlsx` to the current working directory.
- The Excel workbook will have a sheet named "Test Cases" and columns: `TestCaseID`, `Type`, `Module`, `Steps`, `ExpectedResult`.


Excel output format
-------------------
Each row in `test_cases.xlsx` corresponds to a single test case, following the strict format the generator expects:

TestCaseID | Type | Module | Steps | ExpectedResult

Only lines containing exactly 5 pipe-separated fields are written to the workbook. If the model returns lines in a different format, they will be ignored by the current parser.


Extending or modifying
----------------------
- To change which modules are generated, edit the `modules` list in `main.py`.
- To change the SRS, edit the `srs_text` block in `main.py`.
- The output parsing in `save_to_excel` is intentionally simple; if you need a more robust parser (e.g., multi-line expected results or additional fields), consider enhancing `save_to_excel` to use a regex or a small state machine.


Troubleshooting
---------------
- "Connection refused" / "Failed to connect to Ollama": ensure Ollama daemon is running and reachable at the configured host/port.
- "Model not found": install the model on Ollama or change the `model=` value to one you have.
- No rows written to Excel: open `main.py` and check the parsing logic. The model output is filtered; only lines containing `|` and producing exactly 5 columns are written.
- Encoding/Unicode issues: your SRS contains special characters. If you see encoding errors when opening the Excel file, upgrade `openpyxl` and ensure your environment is using UTF-8.


Next steps / Suggestions
-----------------------
- Add a small wrapper or CLI to allow selecting individual modules to generate.
- Add a `--dry-run` mode to preview model output before writing to Excel.
- Add unit tests for `save_to_excel` using a mocked LLM output.
- Add better error handling around the LLM call (timeouts, retries, rate limits).


License
-------
Choose a license appropriate for your project (MIT, Apache-2.0, etc.).


Contact / Help
--------------
If you want, I can:
- Add a `requirements.txt` (I included a minimal one in this repo).
- Add a small CLI wrapper to select modules and output file path.
- Improve parsing so multi-line expected results are supported.


Generated on: 2026-04-02
