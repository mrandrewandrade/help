# Search Support

A playful, shareable search demonstration: familiar search-engine clarity mixed with an overqualified AI assistant.

## How it works

Open the site, enter a question, and copy the generated link. Shared links use the `?q=` query parameter, animate the question and a simulated AI reasoning sequence, then continue to Google search results.

The AI sequence is intentionally theatrical and runs entirely in the browser. No question is sent anywhere until the page redirects to Google.

## Local preview

Serve this directory with any static web server. For example:

```sh
python -m http.server 4173
```
