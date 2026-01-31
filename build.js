// Fixed build: Title shown ONCE, posts sorted newest-first by date+time (ISO 8601), full content inline.

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
    
    // Frontmatter parse
    let frontmatterEnd = md.indexOf('\n---\n');
    let body = md;
    let dateTimeStr = null; // ISO 8601 (YYYY-MM-DDTHH:MM:SS)
    
    if (frontmatterEnd > 0) {
      const fmBlock = md.slice(3, frontmatterEnd);
      const dateMatch = fmBlock.match(/date:\s*([^\n]+)/i);
      if (dateMatch) {
        dateTimeStr = dateMatch[1].trim();
      }
      body = md.slice(frontmatterEnd + 5).trim();
    }
    
    // Fallback to filename date if no datetime in frontmatter
    if (!dateTimeStr || !dateTimeStr.includes('T')) {
      const fileDate = f.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || '0000-01-01';
      const fileStat = fs.statSync(filePath);
      const fileTime = fileStat.mtime.toISOString().split('T')[1].split('.')[0]; // HH:MM:SS
      dateTimeStr = `${fileDate}T${fileTime}`;
    }
    
    // Extract title from first # line
    const titleMatch = body.match(/^# (.*)$/m);
    const title = titleMatch ? titleMatch[1].trim() : path.basename(f, '.md');
    
    const html = marked(body);
    
    return { 
      title, 
      html,
      dateTimeStr,
      filename: f
    };
  })
  .sort((a, b) => new Date(b.dateTimeStr) - new Date(a.dateTimeStr)); // Newest first by datetime

let html = '';
posts.forEach(post => {
  html += `
    <article class="post">
      <div class="content">${post.html}</div>
    </article>
  `;
});

let indexContent = fs.readFileSync('index.html', 'utf8');
indexContent = indexContent.replace(/<main id="posts">[\s\S]*?<\/main>/, `<main id="posts">${html}</main>`);
fs.writeFileSync('index.html', indexContent);

console.log(`Built ${posts.length} posts: Newest-first by datetime (ISO). Top: ${posts[0]?.filename} (${posts[0]?.dateTimeStr})`);
