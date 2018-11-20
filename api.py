import requests
import bs4 as bs
import cssutils
import logging

def Parse(url):
    # Disable warning messages
    cssutils.log.setLevel(logging.CRITICAL)
    # Grab URL and make some soup
    page = requests.get(url)
    soup = bs.BeautifulSoup(page.text, "lxml")
    # Feed the hungry
    soupKitchen = soup.find_all("link", {"rel":"stylesheet", "href":True})

    # Find all CSS links
    colors = {}
    for s in soupKitchen:
        href = s.get("href")
        css = requests.get(href)
        parser = cssutils.CSSParser()
        parsed = parser.parseString(css.text, href=href)
        # Parse CSS text for colors
        for rule in parsed:
            if rule.type == rule.STYLE_RULE:
                for prop in rule.style:
                    if prop.name == "color":
                        if prop.value not in colors:
                            colors[prop.value] = 1
                        else:
                            colors[prop.value] += 1
    # Get rid of low-count colors
    out = {}
    for c in colors:
        count = colors[c]
        if count > 10 and "#" in c:
            out[c] = count

    return { "success": True, "data": out }

if __name__ == "__main__":
    Parse("https://stackoverflow.com/questions/20371448/stop-cssutils-from-generating-warning-messages")
