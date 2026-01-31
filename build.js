// Node.js script: MD posts → static HTML (marked for parse, frontmatter)

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

marked.setOptions({ breaks: true });

const postsDir = './posts';
const posts = fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.md'))
  .map(f => {
    const md = fs.readFileSync(path.join(postsDir, f), 'utf8');
    const fmMatch = md.match(/---\\n(.*?\\n)---/s);
    const frontmatterLines = fmMatch ? fmMatch[1].split('\\n') : [];
const frontmatter = {};
for (let line of frontmatterLines) {
  const [key, ...value] = line.split(': ');
  if (key) frontmatter[key.trim()] = value.join(': ').trim();
}
    const summary = frontmatter.summary || '';
const body = md.replace(/---.*?---\\n?/, '').trim();
post.summary = summary;
    const html = marked(body);
    const date = frontmatter.date || path.basename(f, '.md').slice(0,10);
    return { title: frontmatter.title || path.basename(f, '.md'), date, html, summary, slug: path.basename(f, '.md').replace('.md', '') };
  })
  .sort((a,b) => new Date(b.date) - new Date(a.date)); // Chrono desc

let html = '';
posts.forEach(post => {
  html += `
    <article class="post">
      <h1>${post.title}</h1>
      <div class="date">${post.date}</div>
      ${post.summary ? `<div class="summary">${marked(post.summary)}</div>` : ''}
      <div class="content">${post.html}</div>
    </article>
  `;
});

const index = fs.readFileSync('index.html', 'utf8').replace('<!-- POSTS -->', html);
fs.writeFileSync('index.html', index);

console.log(`Built ${posts.length} posts into index.html`);
