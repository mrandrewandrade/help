# SOS — Search-Oriented Support

A playful, shareable search demonstration powered by AI: Andraoid Intelligence.

## How it works

Open the site, enter a question, and copy the generated link. Shared links use the `?q=` query parameter, run an unnecessarily elaborate progress sequence, then continue to Google search results.

The AI sequence is intentionally theatrical and runs entirely in the browser. No question is sent anywhere until the page redirects to Google.

## Local preview

Serve this directory with any static web server. For example:

```sh
python -m http.server 4173
```
