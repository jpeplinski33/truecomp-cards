# truecompcards.com → GitHub Pages DNS

Site is deployed with CNAME `truecompcards.com` on repo `jpeplinski33/truecomp-cards` (gh-pages).

## Records to set in GoDaddy (DNS)

Delete parking / default A records that point at GoDaddy park IPs if present.

### Apex (`@` / truecompcards.com)

| Type | Name | Value | TTL |
|------|------|--------|-----|
| A | @ | 185.199.108.153 | 600 |
| A | @ | 185.199.109.153 | 600 |
| A | @ | 185.199.110.153 | 600 |
| A | @ | 185.199.111.153 | 600 |

### www

| Type | Name | Value | TTL |
|------|------|--------|-----|
| CNAME | www | jpeplinski33.github.io | 600 |

## After DNS propagates

1. https://truecompcards.com should load the app  
2. GitHub Pages → Enforce HTTPS (auto after cert issues)  
3. Fallback still works: https://jpeplinski33.github.io/truecomp-cards/ (old basePath build removed — custom domain is root)

## GoDaddy path

Domain portfolio → **truecompcards.com** → **DNS** → Add / Edit records → Save
