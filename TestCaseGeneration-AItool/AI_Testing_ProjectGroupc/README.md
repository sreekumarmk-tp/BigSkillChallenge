# AI Testing ProjectGroupc

A small Python utility that uses an Ollama-backed LLM (via the `langchain_community` Ollama wrapper) to generate QA test cases from an SRS text and write them into an Excel workbook (`test_cases.xlsx`) using `openpyxl`.

This repository includes:
- `main.py` — script that generates test cases module-by-module and writes them to Excel.
- `requirements.txt` — Python dependencies.
- `test_cases.xlsx` — generated output (created after running the script).

---

## Quick summary

The script reads an in-file SRS block, prompts an LLM (Ollama) to generate test cases for each module, parses the LLM output (pipe-delimited lines) and saves the results to `test_cases.xlsx` with columns: `TestCaseID`, `Type`, `Module`, `Steps`, `ExpectedResult`.

This README covers setup on Windows (cmd.exe), configuring Ollama, running the script, and troubleshooting tips.

---

## Requirements

- Windows (instructions assume cmd.exe)
- Python 3.8+ (3.10+ recommended)
- Ollama service available (local or remote) and at least one compatible model (e.g., `phi3` or `mistral`)
- A virtual environment (recommended)
- Network access if you use a remote Ollama host

Dependencies (see `requirements.txt`) include:
- langchain-community (Ollama wrapper)
- openpyxl

---

## Installation (Windows — cmd.exe)

1. Open a command prompt.

2. Create and activate a virtual environment:

```cmd
python -m venv .venv
.\.venv\Scripts\activate
```

3. Upgrade pip and install dependencies:

```cmd
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If `requirements.txt` is missing or you want to install manually:

```cmd
pip install langchain-community openpyxl
```

---

## Ollama configuration (important)

`main.py` uses `langchain_community.llms.Ollama`. This requires an Ollama host (usually a local Ollama daemon) with one or more models installed.

Two common setups:

1. Local Ollama (recommended)
   - Install Ollama following https://ollama.ai instructions.
   - Start the Ollama daemon and install a model, for example `phi3` or `mistral`.
   - Ensure the model name in `main.py` matches an installed model:

```python
llm = Ollama(model="phi3")
# or
# llm = Ollama(model="mistral")
```

2. Remote Ollama host (advanced)
   - If you run Ollama on a remote machine, configure the client to point at the host.
   - The wrapper may read `OLLAMA_HOST` or similar environment variables. Example (cmd.exe):

```cmd
set OLLAMA_HOST=http://127.0.0.1:11434
set OLLAMA_API_KEY=your_api_key_if_required
```

Note: Consult the `langchain_community` Ollama wrapper docs if you need custom auth or headers.

---

## Running the script

From the repository root with your virtual environment active:

```cmd
python main.py
```

What to expect:
- The script prints progress as it generates test cases per module.
- The generated file `test_cases.xlsx` will be saved in the current working directory.
- The Excel sheet is named `Test Cases` and contains columns: `TestCaseID`, `Type`, `Module`, `Steps`, `ExpectedResult`.

---

## Output format and parsing details

The LLM is prompted to return test cases in a strict pipe-delimited format:

Type | Module | Steps | ExpectedResult

Only lines that contain `|` and at least four pipe-separated parts are parsed and written to Excel. The script will prepend a `TestCaseID` (e.g., `TC001`) when saving.

If the LLM produces multi-line or otherwise malformed output, those lines may be ignored by the current parser. See "Extending or modifying" below for improvements.

---

## Common issues & troubleshooting

- Connection refused / Failed to connect to Ollama
  - Ensure the Ollama daemon is running and reachable at the configured host/port.
  - Check `OLLAMA_HOST` if using a custom host.

- Model not found
  - Install the desired model on Ollama or change `model=` in `main.py` to an available model name.

- No rows written to Excel
  - The parser only accepts pipe-delimited lines. Inspect the script output (it prints the raw LLM output) to see why lines were ignored.

- Encoding or Excel errors
  - Update `openpyxl` and ensure your Python environment uses UTF-8 (Windows default may vary). Opening with Excel should work for typical UTF-8 content.

---

## Development notes / Customization

- Change modules: edit the `modules` list in `main.py`.
- Change the SRS: edit the `srs_text` variable in `main.py`.
- Improve parsing: `save_to_excel` currently splits lines by `|` and expects 4 parts; consider a regex-based parser or a small state machine if you need multi-line fields.
- Add logging, retries, or timeouts around the LLM call for production use.

Suggested small improvements you can add immediately:
- A CLI wrapper (argparse) to select modules and output path.
- `--dry-run` mode to print/paraphrase the LLM output without writing Excel.
- Unit tests for `save_to_excel` with a mocked LLM output.

---

## Example (sample flow)

1. Activate virtualenv and run `python main.py`.
2. Observe console output per module.
3. Open `test_cases.xlsx` and review the generated test cases.

---

## License

Pick a license for your project (MIT, Apache-2.0, etc.).

---

## Contact / Next steps

If you'd like, I can:
- Add a lightweight CLI wrapper and argument parsing.
- Make the `save_to_excel` parser more robust to multi-line fields.
- Add a `requirements.txt` or update it with pinned versions.
- Add unit tests for the parser and integration tests that mock the LLM.

Generated on: 2026-04-06
