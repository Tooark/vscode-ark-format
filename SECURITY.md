# Security Policy

## Reporting a vulnerability

The Ark Format maintainers take security seriously. If you believe you have
found a security vulnerability in any Ark Format extension (Shell, PowerShell,
Makefile, the extension pack, or the shared library), please report it
**privately** so we can address it before public disclosure.

### How to report

**Do NOT** open a public GitHub issue for security vulnerabilities.

Instead, use one of the following channels:

1. **Preferred** — GitHub Security Advisories:
   [Report a vulnerability](https://github.com/Tooark/vscode-ark-format/security/advisories/new)
2. **Email** — `security@tooark.com` (PGP key available on request)

Please include:

- A description of the vulnerability and its impact
- Steps to reproduce (proof of concept if possible)
- The affected extension(s) and version(s)
- Your VS Code version and operating system
- Your name / handle for credit (optional)

### What to expect

| Milestone                            | Target time                                             |
| ------------------------------------ | ------------------------------------------------------- |
| Acknowledgment of report             | Within **72 hours**                                     |
| Initial triage & severity assessment | Within **5 business days**                              |
| Fix and coordinated disclosure plan  | Within **30 days** (may be extended for complex issues) |
| Public advisory (if applicable)      | After a fixed release is published                      |

We follow the principles of
[Coordinated Vulnerability Disclosure (CVD)](https://en.wikipedia.org/wiki/Coordinated_vulnerability_disclosure).

## Supported versions

Each extension is versioned and released independently. Only the **latest
published version** of each extension receives security fixes.

| Extension                  | Supported      |
| -------------------------- | -------------- |
| `ark-format-shell`         | ✅ Latest only |
| `ark-format-powershell`    | ✅ Latest only |
| `ark-format-makefile`      | ✅ Latest only |
| `ark-format` (pack)        | ✅ Latest only |
| Pre-release / older builds | ❌             |

Always update to the latest Marketplace release before reporting a bug or
vulnerability.

## Scope

In scope:

- Vulnerabilities in Ark Format extension code (the formatters and shared
  library)
- Supply-chain issues in Ark Format's declared dependencies
- Unsafe handling of workspace content during formatting (e.g. command
  injection through a bundled formatter, path traversal)

Out of scope:

- Vulnerabilities in VS Code itself (report to Microsoft)
- Vulnerabilities in third-party extensions installed alongside Ark Format
- Vulnerabilities in the external formatting tools an extension may invoke
  (report upstream), unless Ark Format invokes them unsafely
- Social engineering, physical attacks, and denial of service

## Safe harbor

We support security research conducted in good faith. If you follow this policy,
we will:

- Not pursue legal action against you
- Work with you to understand and resolve the issue
- Publicly credit you (if you wish) in the security advisory

## Bounties

Ark Format is an open-source project maintained by volunteers. **No monetary
bounty program is currently offered**, but we deeply appreciate responsible
disclosure and will credit reporters publicly.
