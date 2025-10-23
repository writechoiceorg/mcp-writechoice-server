# Testing URLs and inline code capitalization

## this heading has lowercase and should be flagged

## this heading has a URL https://example.com/API and should not flag the URL part

## this heading has `inline code` and should not flag the code part

## this heading has both https://api.github.com and `npm install` commands

Regular text with URLs like https://localhost:3000/api/docs should not be flagged.

Text with `code snippets` and `API calls` should not flag the backtick content.

But this sentence with improper capitalization Should be flagged for the Capital S.