# Mini Project Report: Password Strength Checker

## Title page

**Project:** Password Strength Checker  
**Domain:** Cybersecurity and Web Development  
**Academic level:** Second-year B.Tech Computer Science and Engineering  
**Submitted by:** ____________________  
**Roll number:** ____________________  
**Department / Institution:** ____________________  
**Academic year:** ____________________

## Abstract

The Password Strength Checker is a client-side web application that helps users understand password quality without sending the password to a server. It evaluates length, character variety, common-password matches, sequences, and repeated patterns. An educational entropy estimate and a transparent score summarize the findings, while contextual recommendations suggest improvements. A separate password generator uses the browser Web Crypto API to generate random passwords and guarantees at least one character from each selected category. The project demonstrates basic web development and privacy-aware cybersecurity design.

## 1. Introduction

Passwords remain a common way to protect online accounts. Short, familiar, or reused passwords are easier to guess or expose users to credential reuse attacks. Many users receive little feedback about why a password is weak. This project presents a simple educational tool that explains measurable password characteristics and keeps analysis in the browser.

## 2. Problem statement

Users need immediate, understandable feedback about password length, variety, and predictable patterns. The application must provide this feedback without retaining or transmitting the sensitive input.

## 3. Objectives

- Analyze a password in real time in the browser.
- Explain a score and strength category using a documented heuristic.
- Detect selected common strings and predictable patterns.
- Estimate entropy from the present character classes.
- Recommend relevant improvements.
- Generate passwords with cryptographically secure randomness.
- Provide a responsive, accessible interface deployable as a static site.

## 4. Scope

The application performs local educational checks only. It does not verify password reuse, query breach databases, estimate exact cracking time, create accounts, or replace a password manager. Its short dictionary and heuristics cannot identify every weak password.

## 5. Requirements

### Functional

1. Accept password input and update analysis while typing.
2. Show and hide the input and clear it on request.
3. Display strength, score, estimated entropy, length, character classes, risk signals, and recommendations.
4. Generate a selected-length password from selected character groups using Web Crypto.
5. Copy a generated password on explicit user action.

### Non-functional

- Passwords are not stored or transmitted by application code.
- The page is responsive, keyboard accessible, and dependency-free.
- The project can be hosted as a static Vercel site without environment variables.

## 6. System design

The page consists of a password analyzer, generator, project explanation, and disclaimer. HTML supplies semantic structure and labels. CSS provides responsive dark dashboard styling and visible focus states. JavaScript performs all checks and updates the page. There is no backend or database.

### Analysis flow

```text
Password input
      ↓
Character and length analysis
      ↓
Common, sequence, and repetition heuristics
      ↓
Entropy estimate and score
      ↓
Recommendations and dashboard update
```

## 7. Scoring algorithm

The base score totals 100 points:

| Factor | Maximum |
| --- | ---: |
| Length, scaled to 16 characters | 30 |
| Lowercase present | 10 |
| Uppercase present | 10 |
| Number present | 10 |
| Symbol present | 15 |
| Character-class diversity | 10 |
| No repeated pattern | 5 |
| No obvious sequence | 5 |
| No common-password match | 5 |

The implementation subtracts penalties for passwords under eight characters, a common-password match, a sequence, repeated patterns, and a word-plus-digits personal-style pattern. It also caps the maximum band by length: under 6 characters is Very Weak, 6–7 Weak, 8–10 Medium, 11–14 Strong, and 15+ can reach Very Strong. The final result is clamped between zero and 100. Penalties prevent a password from scoring highly just because it combines several character classes with a familiar weak pattern. This is a transparent classroom heuristic; it is not a formal security standard.

## 8. Entropy estimate

For a password of length `L`, the application estimates:

```text
H = L × log2(R)
```

`R` is the approximate pool size formed by the character classes observed: lowercase 26, uppercase 26, digits 10, and symbols approximately 32. The result is rounded to a whole bit. This estimate assumes random independent character choice from the full pool. Human choices often violate that assumption, so the estimate is not an exact search effort or crack time.

## 9. Generator and security decisions

The generator draws bytes from `crypto.getRandomValues()`. Rejection sampling removes modulo bias when choosing an index. It first selects a character from each enabled category, fills remaining positions from the combined pool, then securely shuffles the result. The generated value stays in the current page. Copying requires an explicit button press and uses the browser clipboard API when available.

The analyzer has no network code, backend, local storage, session storage, URL parameters, analytics, or password logging. Input values remain in page memory until the page is cleared or closed. Browser extensions and the operating system are outside the application's control.

## 10. Technology stack

- HTML5 for semantic page structure
- CSS3 for the responsive interface
- JavaScript ES6+ for analysis and interactions
- Web Crypto API for secure generation
- Vercel for static deployment

## 11. Testing plan and sample cases

| Case | Input / action | Expected result |
| --- | --- | --- |
| Empty input | Leave field blank | Prompt shown; score and entropy are zero |
| Spaces only | Enter spaces | Friendly guidance; no false promise of strength |
| Common password | `password` | Common password warning and very low score |
| Numeric sequence | `Prince@123` | Sequence warning and tailored advice |
| Repeated run | `aaaaB7!` | Repetition warning |
| Mixed passphrase | `Correct-Horse-Battery-Staple` | Long length contributes well; no exact crack time |
| Generator categories | Enable all types | Each chosen category appears at least once |
| Generator validation | Disable every category | Clear validation error; no generated value |
| Visibility controls | Activate show/hide | Input type and accessible label update |
| Clear control | Activate clear | Analyzer resets and input receives focus |

Sample strings are for demonstration only and should not be used for accounts.

## 12. Limitations and future work

Pattern and name-like detection is heuristic and may miss weak constructions or flag unusual ones. The dictionary is intentionally small. Improvements could include a better curated pattern dictionary, more languages, password-manager integration, and an optional breach check that uses a privacy-preserving k-anonymity protocol with clear consent and careful review.

## 13. Conclusion

The project demonstrates how a small static web application can combine explainable password feedback with a privacy-first design. It teaches users about length, variety, and predictability while keeping the implementation simple enough to inspect and deploy.
