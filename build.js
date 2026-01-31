// Node.js script: MD posts → static HTML (marked parse, frontmatter title/date/summary, no leak)

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

marked.setOptions({ breaks: true });

const postsDir = './posts';
const posts = fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.md'))
  .map(f => {
    const md = fs.readFileSync(path.join(postsDir, f), 'utf8');
    const fmMatch = md.match(/---\n([\s\S]*?)\n---/);
    const frontmatterLines = fmMatch ? fmMatch[1].split('\n') : [];
    const frontmatter = {};
    for (let line of frontmatterLines) {
      const parts = line.split(': ');
      if (parts.length >= 2) {
        frontmatter[parts[0].trim()] = parts.slice(1).join(': ').trim();
      }
    }
    const summary = frontmatter.summary || '';
    const bodyMatch = md.match(/---\n[\s\S]*?\n---\n?(.*)$/s);
    const body = bodyMatch ? bodyMatch[1].trim() : md.trim();
    const html = marked(body);
    const date = frontmatter.date || path.basename(f, '.md').slice(0,10);
    return { 
      title: frontmatter.title || path.basename(f, '.md'), 
      date, 
      html, 
      summary, 
      slug: path.basename(f, '.md').replace('.md', '') 
    };
  })
  .sort((a,b) => new Date(b.date) - new Date(a.date)); // Chrono desc

let html = '';
posts.forEach(post => {
  const summaryHtml = post.summary ? marked(post.summary) : '';
  html += `
    <article class="post">
      <h1>${post.title}</h1>
      <div class="date">${post.date}</div>
      ${summaryHtml ? `<div class="summary">${summaryHtml}</div>` : ''}
      <div class="content">${post.html}</div>
    </article>
  `;
});

const indexContent = fs.readFileSync('index.html', 'utf8');
const index = indexContent.replace('<!-- POSTS -->', html);
fs.writeFileSync('index.html', index);

console.log(`Built ${posts.length} posts into index.html (no errors, summaries rendered)`);
