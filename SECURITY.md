# Security policy

## Reporting a vulnerability

Do not open a public issue for a security problem.

Use GitHub's private vulnerability reporting on this repository, or contact a
maintainer directly. Please include:

- what you found and where,
- the impact you believe it has,
- the steps needed to reproduce it.

We aim to acknowledge a report within a few days and to keep you informed until
the issue is resolved.

## Scope

Anything in this repository: the API, the web, mobile and admin applications,
the shared packages and the local infrastructure files.

Particularly relevant areas:

- authentication, sessions and refresh token rotation,
- authorization on listings, reports and moderation endpoints,
- exposure of personal data, especially exact locations and phone numbers,
- file upload handling.

## Supported versions

The project is pre-1.0. Only the `main` branch receives fixes.
