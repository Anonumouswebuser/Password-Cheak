# Viva Questions and Answers

### 1. What does password strength mean?

It is an estimate of resistance to guessing. Longer, less predictable passwords are generally more resistant, but strength also depends on reuse and exposure.

### 2. Why does this project analyze passwords locally?

Passwords are sensitive. Local analysis avoids sending them to a server and avoids creating a server-side record.

### 3. Does the application store passwords?

No. It does not use a database, local storage, session storage, analytics, or password API. The entered value exists in the page while the user is working with it.

### 4. What is entropy?

Entropy is a measure of uncertainty. The app estimates it as password length multiplied by the base-2 logarithm of the assumed character pool size.

### 5. Is the entropy number an exact crack-time estimate?

No. It assumes random independent choices. Human-made passwords contain patterns, and real attack conditions vary. The app does not claim an exact crack time.

### 6. How is the score calculated?

It adds points for length, character classes, diversity, and the absence of common patterns, then subtracts penalties for short length, common passwords, sequences, and repetition. The result is clamped to 0–100.

### 7. Why use penalties?

A password can contain uppercase, lowercase, digits, and symbols while still being an obvious variation. Penalties keep such predictable passwords from appearing strong based only on character variety.

### 8. What is a character pool?

It is the approximate set of possible characters. This project uses 26 lowercase, 26 uppercase, 10 numeric, and about 32 symbols when those classes appear.

### 9. Why use `crypto.getRandomValues()`?

It provides cryptographically strong random bytes in supported browsers. `Math.random()` is intended for general-purpose randomness and is not suitable for generating security credentials.

### 10. How does the generator ensure selected categories appear?

It first picks one random character from every selected category, fills the remaining length from the combined pool, and shuffles the result.

### 11. What is rejection sampling used for?

Mapping a random byte with modulo can make some character indexes slightly more likely than others. Rejection sampling discards values outside an evenly divisible range before taking the remainder.

### 12. What does the common-password check cover?

It checks a small built-in set and catches a few simple digit or symbol variations. It is educational, not a comprehensive leaked-password database.

### 13. Can this checker recognize the user's real name?

No. It does not know a user's identity. It only flags a broad word-plus-digits pattern that is commonly used for personal-style passwords.

### 14. Why is no breach database connected?

A careless lookup could expose the password. A future option should use a privacy-preserving method such as k-anonymity and should explain the data flow before the user opts in.

### 15. Why use vanilla JavaScript?

The project has a small interface and no need for a framework. Vanilla JavaScript reduces dependencies and keeps the static deployment straightforward.

### 16. What is Vercel doing in this project?

Vercel hosts the static HTML, CSS, JavaScript, and configuration. No backend or environment variables are needed.

### 17. What are the limitations?

The score and pattern checks are heuristics, the common-password set is small, and the entropy model assumes random choices. Users should still use unique passwords and a password manager.

### 18. What could be added next?

Improved pattern detection, localization, password-manager integration, and a carefully designed opt-in breach check using privacy-preserving k-anonymity.
