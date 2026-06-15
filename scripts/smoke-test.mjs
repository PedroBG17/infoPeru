import fs from 'node:fs';
import path from 'node:path';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:3000';
const env = loadLocalEnv();
const adminEmail = process.env.SMOKE_ADMIN_EMAIL || env.ADMIN_EMAIL || '';
const adminPassword = process.env.SMOKE_ADMIN_PASSWORD || '';
const revalidationSecret = process.env.REVALIDATION_SECRET || env.REVALIDATION_SECRET || '';

const checks = [];

async function main() {
  await check('home responds with SEO metadata', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert(res.status === 200, `expected 200, got ${res.status}`);
    const html = await res.text();
    assert(html.includes('ClavePerú | Trámites, salud, empleo y noticias del Perú'), 'missing default title');
    assert(html.includes('ClavePerú - Servicios ciudadanos del Perú'), 'missing OG title');
    assert(html.includes('Ver servicios'), 'missing CMS navigation CTA');
  });

  await check('health endpoint reports operational status', async () => {
    const res = await fetch(`${baseUrl}/api/health`, { redirect: 'manual' });
    assert(res.status === 200, `expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.status === 'ok', 'health endpoint did not report status=ok');
    assert(json.checks?.database === 'ok', 'database check is not ok');
  });

  await check('sitemap and robots are reachable', async () => {
    const sitemap = await fetch(`${baseUrl}/sitemap.xml`);
    assert(sitemap.status === 200, `expected sitemap 200, got ${sitemap.status}`);
    assert((await sitemap.text()).includes('<urlset'), 'sitemap is missing urlset');

    const robots = await fetch(`${baseUrl}/robots.txt`);
    assert(robots.status === 200, `expected robots 200, got ${robots.status}`);
    assert((await robots.text()).includes('Sitemap:'), 'robots is missing Sitemap');
  });

  await check('admin dashboard redirects when anonymous', async () => {
    const res = await fetch(`${baseUrl}/admin/dashboard?tab=portal`, { redirect: 'manual' });
    assert([302, 303, 307, 308].includes(res.status), `expected redirect, got ${res.status}`);
    assert((res.headers.get('location') || '').includes('/admin/login'), 'redirect does not target login');
  });

  await check('media upload rejects anonymous requests', async () => {
    const res = await fetch(`${baseUrl}/api/v1/media/upload`, { method: 'POST', redirect: 'manual' });
    assert(res.status === 401, `expected 401, got ${res.status}`);
  });

  await check('cron endpoint rejects anonymous requests', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cron/update-costs`, { redirect: 'manual' });
    assert(res.status === 401 || res.status === 503, `expected 401/503, got ${res.status}`);
  });

  await check('revalidation webhook rejects missing token', async () => {
    const res = await fetch(`${baseUrl}/api/v1/webhooks/revalidate`, {
      method: 'POST',
      body: JSON.stringify({ path: '/' }),
      headers: { 'content-type': 'application/json' },
      redirect: 'manual',
    });
    assert(res.status === 401 || res.status === 503, `expected 401/503, got ${res.status}`);
  });

  if (revalidationSecret) {
    await check('revalidation webhook accepts bearer token', async () => {
      const res = await fetch(`${baseUrl}/api/v1/webhooks/revalidate`, {
        method: 'POST',
        body: JSON.stringify({ path: '/' }),
        headers: {
          authorization: `Bearer ${revalidationSecret}`,
          'content-type': 'application/json',
        },
      });
      assert(res.status === 200, `expected 200, got ${res.status}`);
      const json = await res.json();
      assert(json.revalidated === true, 'webhook did not report revalidated=true');
    });
  }

  if (adminEmail && adminPassword) {
    await check('admin login opens dashboard with valid credentials', async () => {
      const form = new URLSearchParams({
        email: stripQuotes(adminEmail),
        password: adminPassword,
        next: '/admin/dashboard?tab=portal',
      });
      const login = await fetch(`${baseUrl}/admin/login/submit`, {
        method: 'POST',
        body: form,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        redirect: 'manual',
      });
      assert([302, 303, 307, 308].includes(login.status), `expected login redirect, got ${login.status}`);
      assert((login.headers.get('location') || '').includes('/admin/dashboard'), 'login did not redirect to dashboard');

      const cookie = login.headers.get('set-cookie');
      assert(Boolean(cookie), 'login did not set session cookie');

      const dashboard = await fetch(`${baseUrl}/admin/dashboard?tab=portal`, {
        headers: { cookie },
        redirect: 'manual',
      });
      assert(dashboard.status === 200, `expected dashboard 200, got ${dashboard.status}`);
      const html = await dashboard.text();
      assert(html.includes(stripQuotes(adminEmail)), 'dashboard did not render admin identity');
    });
  } else {
    checks.push({ name: 'admin login opens dashboard with valid credentials', skipped: true });
  }

  const failed = checks.filter((item) => item.ok === false);
  for (const item of checks) {
    const status = item.skipped ? 'SKIP' : item.ok ? 'PASS' : 'FAIL';
    console.log(`${status} ${item.name}${item.error ? ` - ${item.error}` : ''}`);
  }

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

async function check(name, fn) {
  try {
    await fn();
    checks.push({ name, ok: true });
  } catch (error) {
    checks.push({ name, ok: false, error: error instanceof Error ? error.message : String(error) });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function loadLocalEnv() {
  const result = {};
  for (const file of ['.env.local', '.env']) {
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      if (!(key in result)) result[key] = stripQuotes(value);
    }
  }
  return result;
}

function stripQuotes(value) {
  return String(value || '').replace(/^["']|["']$/g, '');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
