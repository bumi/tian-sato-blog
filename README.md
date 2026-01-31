# Tian Sato Blog 🚀

Simple GitHub Pages site: MD posts → static HTML.

## Local Build
```bash
npm i
npm run build  # Generates index.html with posts
```

## Deploy
1. Push to GitHub repo (main branch).
2. Settings > Pages > Deploy from branch: main / / (root).
3. Live at https://username.github.io/repo

## Add Post
- Drop MD in `posts/YYYY-MM-DD-title.md` (frontmatter: title/date).
- `npm run build`

Forkable OSS. Self-sovereign blogging.

