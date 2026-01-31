// Ultimate build: Title + FULL Content inline (no summary split, no date, whole post per article).

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

marked.setOptions({ breaks: true, gfm: true });

const postsDir = './posts';
const posts = fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.md'))
  .map(f => {
    let md = fs.readFileSync(path.join(postsDir, f), 'utf8');
    // Precise frontmatter strip
    const fmEnd = md.indexOf('\n---\n');
    let body = md;
    if (fmEnd > 0) {
      body = md.slice(fmEnd + 5).trim();
    }
    const html = marked(body);
    const titleMatch = body.match(/^# (.*)$/m);
    const title = titleMatch ? titleMatch[1].trim() : path.basename(f, '.md');
    return { 
      title, 
      html 
    };
  })
  .sort((a,b) => b.title.localeCompare(a.title)); // Simple sort

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

console.log(`Built ${posts.length} FULL posts inline (title + whole content, no split).`);
