// Fixed build: Title shown ONCE (strip duplicate # from MD), posts sorted newest-first by date (filename/frontmatter fallback), full content inline.

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

marked.setOptions({ breaks: true, gfm: true });

const postsDir = './posts';
const posts = fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.md'))
  .map(f => {
    const filePath = path.join(postsDir, f);
    let md = fs.readFileSync(filePath, 'utf8');
    
    // Frontmatter parse (simple)
    let frontmatterEnd = md.indexOf('\n---\n');
    let body = md;
    let dateStr = f.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || '0000-01-01';
    
    if (frontmatterEnd > 0) {
      const fmBlock = md.slice(3, frontmatterEnd); // skip initial ---
      const dateMatch = fmBlock.match(/date:\s*([^\n]+)/i);
      if (dateMatch) dateStr = dateMatch[1].trim();
      body = md.slice(frontmatterEnd + 5).trim();
    }
    
    // Extract title from first # line
    const titleMatch = body.match(/^# (.*)$/m);
    const title = titleMatch ? titleMatch[1].trim() : path.basename(f, '.md').replace(/\.md$/, '');
    
    // Strip duplicate title line (# Title\n)
    const titleLineMatch = body.match(/^# .*?\n?/);
    if (titleLineMatch && titleLineMatch[0].trim().startsWith('# ') && titleLineMatch[1]?.trim() === title) {
      body = body.slice(titleLineMatch[0].length).trimStart();
    }
    
    const html = marked(body);
    
    return { 
      title, 
      html,
      dateStr,
      filename: f
    };
  })
  .sort((a, b) => new Date(b.dateStr) - new Date(a.dateStr)); // Newest first by date

let html = '';
posts.forEach(post => {
  html += `
    <article class="post">
      <h1>${post.title}</h1>
      <div class="content">${post.html}</div>
    </article>
  `;
});

let indexContent = fs.readFileSync('index.html', 'utf8');
indexContent = indexContent.replace(/<main id="posts">[\s\S]*?<\/main>/, `<main id="posts">${html}</main>`);
fs.writeFileSync('index.html', indexContent);

console.log(`Built ${posts.length} posts: Newest-first by date, title deduped. Top: ${posts[0]?.filename}`);