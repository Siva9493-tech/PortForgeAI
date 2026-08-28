async function search(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    // Parse links and titles
    const matches = [...html.matchAll(/<a class="result__snippet" href="([^"]+)".*?>(.*?)<\/a>/g)];
    const titles = [...html.matchAll(/<a class="result__url"[^>]* href="([^"]+)"[^>]*>(.*?)<\/a>/g)];
    const results = [];
    for (let i = 0; i < Math.min(10, matches.length); i++) {
       const urlMatch = matches[i][1];
       const body = matches[i][2].replace(/<[^>]*>/g, '');
       const title = titles[i] ? titles[i][2].replace(/<[^>]*>/g, '').trim() : '';
       results.push({ title, url: decodeURIComponent(urlMatch), snippet: body });
    }
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error(err);
  }
}
search(process.argv[2] || "astro vercel adapter 404");
