#!/usr/bin/env python3
"""
Independent test to verify meta description and canonical URL extraction
Compares direct HTTP fetch vs Playwright extraction
"""

import requests
from bs4 import BeautifulSoup
import json

def fetch_with_requests(url):
    """Fetch and parse using requests + BeautifulSoup (no JS)"""
    print(f"\n{'='*60}")
    print(f"Testing URL: {url}")
    print(f"{'='*60}\n")

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')

    # Extract Title
    title = soup.title.string if soup.title else None
    title_length = len(title) if title else 0

    # Extract Meta Description (case-insensitive)
    meta_desc = None
    meta_tag = soup.find('meta', attrs={'name': lambda x: x and x.lower() == 'description'})
    if meta_tag and meta_tag.get('content'):
        meta_desc = meta_tag['content']

    meta_desc_length = len(meta_desc) if meta_desc else 0

    # Extract Canonical URL (case-insensitive)
    canonical = None
    canonical_tag = soup.find('link', attrs={'rel': lambda x: x and x[0].lower() == 'canonical' if isinstance(x, list) else x and x.lower() == 'canonical'})
    if canonical_tag and canonical_tag.get('href'):
        canonical = canonical_tag['href']

    # Extract H1 tags
    h1_tags = soup.find_all('h1')
    h1_count = len(h1_tags)
    h1_texts = [h1.get_text(strip=True) for h1 in h1_tags[:3]]  # First 3

    # Extract H2 count
    h2_count = len(soup.find_all('h2'))

    # Extract images
    images = soup.find_all('img')
    images_count = len(images)
    images_with_alt = len([img for img in images if img.get('alt') and img.get('alt').strip()])

    # Check for OG tags
    og_tags = soup.find_all('meta', property=lambda x: x and x.startswith('og:'))
    og_present = len(og_tags) > 0

    # Check for Twitter tags
    twitter_tags = soup.find_all('meta', attrs={'name': lambda x: x and x.startswith('twitter:')})
    twitter_present = len(twitter_tags) > 0

    # Check for Schema.org JSON-LD
    schema_scripts = soup.find_all('script', type='application/ld+json')
    schema_present = len(schema_scripts) > 0

    # Check robots meta
    robots_meta = soup.find('meta', attrs={'name': 'robots'})
    robots_content = robots_meta['content'] if robots_meta else None

    # Check lang attribute
    html_tag = soup.find('html')
    lang = html_tag.get('lang') if html_tag else None

    # Print results
    print("DIRECT HTTP FETCH RESULTS (requests + BeautifulSoup):")
    print(f"\n{'='*60}")
    print(f"Title: {title}")
    print(f"Title Length: {title_length} chars")
    print(f"\nMeta Description: {meta_desc}")
    print(f"Meta Description Length: {meta_desc_length} chars")
    print(f"\nCanonical URL: {canonical}")
    print(f"\nH1 Count: {h1_count}")
    if h1_texts:
        print(f"H1 Texts: {h1_texts}")
    print(f"H2 Count: {h2_count}")
    print(f"\nImages: {images_count} total, {images_with_alt} with alt text ({images_with_alt}/{images_count} = {round(images_with_alt/images_count*100) if images_count > 0 else 0}%)")
    print(f"\nOG Tags Present: {og_present}")
    print(f"Twitter Tags Present: {twitter_present}")
    print(f"Schema.org JSON-LD Present: {schema_present}")
    print(f"\nRobots Meta: {robots_content}")
    print(f"Lang Attribute: {lang}")
    print(f"{'='*60}\n")

    # Return data for comparison
    return {
        'title': title,
        'title_length': title_length,
        'meta_description': meta_desc,
        'meta_description_length': meta_desc_length,
        'canonical': canonical,
        'h1_count': h1_count,
        'h2_count': h2_count,
        'images_count': images_count,
        'images_with_alt': images_with_alt,
        'og_present': og_present,
        'twitter_present': twitter_present,
        'schema_present': schema_present,
        'robots_meta': robots_content,
        'lang': lang
    }

def main():
    url = "https://spotcircuit.com"

    try:
        data = fetch_with_requests(url)

        print("\nKEY FINDINGS:")
        print("="*60)

        if data['meta_description']:
            print(f"✓ Meta description EXISTS: {data['meta_description_length']} chars")
            if data['meta_description_length'] > 160:
                print(f"  → Too long! Should be 120-160 chars")
        else:
            print("✗ Meta description MISSING")

        if data['canonical']:
            print(f"✓ Canonical URL EXISTS: {data['canonical']}")
        else:
            print("✗ Canonical URL MISSING")

        if data['h1_count'] == 1:
            print(f"✓ Exactly 1 H1 tag (optimal)")
        elif data['h1_count'] == 0:
            print(f"✗ No H1 tags found")
        else:
            print(f"⚠ {data['h1_count']} H1 tags found (should be exactly 1)")

        alt_coverage = (data['images_with_alt'] / data['images_count'] * 100) if data['images_count'] > 0 else 0
        if alt_coverage >= 80:
            print(f"✓ Good image alt coverage: {round(alt_coverage)}%")
        else:
            print(f"⚠ Low image alt coverage: {round(alt_coverage)}%")

        print("="*60)

        # Save to JSON for easy comparison
        with open('test_extraction_results.json', 'w') as f:
            json.dump(data, f, indent=2)
        print("\n✓ Results saved to test_extraction_results.json")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
