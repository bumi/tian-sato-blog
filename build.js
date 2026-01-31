// Clean build: Strip frontmatter perfectly, render title/summary/full content inline.

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

marked.setOptions({ breaks: true, gfm: true });

const postsDir = './posts';
const posts = fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.md'))
  .map(f => {
    let md = fs.readFileSync(path.join(postsDir, f), 'utf8');
    // Exact frontmatter strip
    const fmEnd = md.indexOf('\n---\n');
    let frontmatter = {};
    let body = md;
    if (fmEnd > 0) {
      const fmRaw = md.slice(3, fmEnd);
      const lines = fmRaw.split('\n');
      lines.forEach(line => {
        const [key, ...val] = line.split(': ');
        if (key) frontmatter[key.trim()] = val.join(': ').trim();
      });
      body = md.slice(fmEnd + 5).trim();
    }
    const summary = frontmatter.summary || '';
    const html = marked(body);
    const summaryHtml = marked(summary);
    const date = frontmatter.date || path.basename(f, '.md').slice(0,10);
    return { 
      title: frontmatter.title || path.basename(f, '.md'), 
      date, 
      html, 
      summaryHtml,
      slug: path.basename(f, '.md').replace('.md', '') 
    };
  })
  .sort((a,b) => new Date(b.date) - new Date(a.date));

let html = '';
posts.forEach(post => {
  html += `
    <article class="post">
      <h1>${post.title}</h1>
      ${post.summaryHtml ? `<div class="summary">${post.summaryHtml}</div>` : ''}
      <div class="content">${post.html}</div>
    </article>
  `;
});

let indexContent = fs.readFileSync('index.html', 'utf8');
indexContent = indexContent.replace(/<main id="posts">.*?<\/main>/s, `<main id="posts">${html}</main>`);
fs.writeFileSync('index.html', indexContent);

console.log(`Built ${posts.length} posts. Clean frontmatter strip, full inline content.`);
