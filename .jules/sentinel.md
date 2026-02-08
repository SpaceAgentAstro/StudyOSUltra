## 2024-05-22 - Client-Side File Processing Vulnerability
**Vulnerability:** The application processes file uploads entirely on the client-side using `FileReader`, without size or type validation. This exposes the user to browser crashes (DoS) if large files are selected.
**Learning:** In serverless/client-side apps, "upload" validation must happen before reading the file into memory to prevent resource exhaustion.
**Prevention:** Always validate `file.size` and `file.type`/extension before calling `FileReader.readAsText()` or `readAsDataURL()`.
