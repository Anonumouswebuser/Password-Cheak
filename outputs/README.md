# Password Strength Checker

A responsive cybersecurity mini project that analyzes password characteristics in the browser and offers a cryptographically random password generator. Password analysis is local: the application has no backend, database, analytics, or password API.

## Features

- Live strength score from 0 to 100 with five understandable categories
- Length and character composition checks
- Small built-in common-password check with simple predictable variations
- Sequence, repeated-pattern, and heuristic personal-style warnings
- Educational entropy estimate
- Contextual security recommendations
- Password generator using `crypto.getRandomValues()`, secure shuffling, and selected-category guarantees
- Show/hide controls and copy action
- Responsive, keyboard-accessible interface with reduced-motion support
- Vercel-ready static hosting and security response headers

## Technologies

HTML5, CSS3, vanilla JavaScript (ES6+), Web Crypto API, and Vercel static hosting.

## How the analysis works

1. JavaScript inspects the input value in memory for length and character classes.
2. Local heuristic checks flag a small set of common passwords, sequential patterns, repeated patterns, and a word-plus-digits personal-style pattern.
3. The entropy estimate uses `length × log2(pool size)`, where the pool contains 26 lowercase letters, 26 uppercase letters, 10 digits, and approximately 32 symbols for each category present.
4. The score combines length (0–30), lowercase (10), uppercase (10), numbers (10), symbols (15), character diversity (up to 10), no repetition (5), no sequence (5), and no common-password match (5), then applies explicit penalties for short length, common matches, sequences, repeated patterns, and word-plus-digits personal-style patterns. Length also caps the maximum band: under 6 characters is Very Weak, 6–7 Weak, 8–10 Medium, 11–14 Strong, and 15+ can reach Very Strong. The final score is clamped to 0–100.
5. The app renders relevant improvement suggestions.

Strength bands are 0–20 Very Weak, 21–40 Weak, 41–60 Medium, 61–80 Strong, and 81–100 Very Strong. The rules are educational heuristics, not a guarantee or exact cracking-time estimate.

## Security and privacy

Your password is analyzed locally in your browser and is never stored or transmitted. Password values are not written to a database, browser storage, URL, or console. The app makes no password-analysis network calls. Generated passwords are also held only in the current page and use `crypto.getRandomValues()` with rejection sampling for unbiased selection. Copying is initiated only when the user selects Copy.

The sample common-password set is short and intended for demonstrating local checks. It is not a breach corpus. No external breach lookup is included.

## Run locally

1. Clone or download this repository.
2. Open `index.html` directly, or serve the folder with a static server. For example, if Node.js is installed:

   ```bash
   npx serve .
   ```

   Then open the local URL shown by the server. Clipboard access is generally available on localhost or a secure context.

The project needs no environment variables, build step, database, or package installation. The core analyzer works offline after the files are available; all assets are local.

## GitHub

Create a repository on GitHub, then from this project directory run:

```bash
git init
   git add index.html style.css script.js favicon.svg vercel.json README.md
git commit -m "Build password strength checker"
git branch -M main
git remote add origin https://github.com/<your-username>/<repository-name>.git
git push -u origin main
```

Replace the placeholder repository URL with your own. Add the academic documents if you want them versioned with the project.

## Deploy to Vercel

1. Push the project to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Keep the framework preset as **Other** and leave the build command and output directory empty (the repository root contains `index.html`).
4. Select **Deploy**. No environment variables are required.

You can also deploy with the Vercel CLI from this directory using `vercel` and follow its prompts.

## Sample checks

| Input | Expected behavior |
| --- | --- |
| `123456` | Very weak; common and sequential patterns are flagged |
| `password` | Very weak; common-password warning |
| `Password123` | Very weak under this scoring; common-password and sequence warnings |
| `P@ssword123` | Common variation and sequence warnings may appear |
| `Correct-Horse-Battery-Staple` | Strong length; no exact crack-time claim |
| Random 16+ character generated password | Usually very strong, with chosen types guaranteed |

Do not use these sample strings for real accounts.

## Project files

```text
outputs/
├── index.html
├── style.css
├── script.js
├── favicon.svg
├── vercel.json
├── README.md
├── MINI_PROJECT_REPORT.md
├── VIVA_QUESTIONS.md
└── PRESENTATION_OUTLINE.md
```

## Future improvements

- Better pattern detection and an expanded curated dictionary
- Optional Have I Been Pwned lookup using privacy-preserving k-anonymity, only after a careful threat-model and explicit user choice
- Password-manager integration
- Browser extension
- Multi-language support

External breach checking should not send the full password to a service.
