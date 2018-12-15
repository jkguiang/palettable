import numpy as np
import warnings; warnings.simplefilter('ignore')  # Fix NumPy issues.
from sklearn.cluster import MiniBatchKMeans
import bs4 as bs
import requests
import cssutils
import colorsys
import logging
import base64
import cv2
import io

def Clamp(rgbVal):
  return int(max(0, min(rgbVal, 255)))

def ProcImage(screenshot):
    # Get screenshot of url
    img = base64.b64decode(screenshot)
    img = io.BytesIO(img)
    img_bytes = np.asarray(bytearray(img.read()), dtype=np.uint8)
    img = cv2.imdecode(img_bytes, cv2.IMREAD_UNCHANGED)
    img_sm = cv2.resize(img, (0,0), fx=0.1, fy=0.1)
    # Color correction
    img_sm = cv2.cvtColor(img_sm, cv2.COLOR_BGR2RGB)

    return img_sm

def ParseCSS(url):
    """ Parse html content of a URL, grab all relevant CSS color information """
    # Disable warning messages
    cssutils.log.setLevel(logging.CRITICAL)
    # Grab URL and make some soup
    page = requests.get(url)
    soup = bs.BeautifulSoup(page.text, "lxml")
    # Feed the hungry
    soupKitchen = soup.find_all("link", {"rel":"stylesheet", "href":True})
     # Find all CSS links
    image = []
    for s in soupKitchen:
        href = s.get("href")
        # Fix URL if necessary
        if href[0:8] != "https://":
            for i, c in enumerate(href):
                if c not in "https://":
                    href = "https://"+href[i:]
                    break
        # Parse CSS text and count colors
        try:
            css = requests.get(href)
        except Exception as e:
            continue
        parser = cssutils.CSSParser()
        parsed = parser.parseString(css.text, href=href)
        for rule in parsed:
            if rule.type == rule.STYLE_RULE:
                for prop in rule.style:
                    if prop.name == "background-color" and len(prop.value) <= 7 and "#" in prop.value:
                        # Turn hex values into np array of RGB values
                        value = (prop.value).lstrip('#')
                        if len(value) == 3:
                            value = "".join((v+v for v in value))
                        r,g,b = tuple(int(value[i:i+2], 16) for i in (0, 2 ,4))
                        image.append([r,g,b])

    image.sort(key=lambda rgb: colorsys.rgb_to_hls(*rgb))
    image = np.array(image)
    image = image.reshape(image.shape[0],1,image.shape[1]) # Arbitrarily reshape array for use in API

    return image

def GetData(image):
    # Shape data
    data = image / 255.0 # use 0...1 scale
    data = data.reshape(image.shape[0] * image.shape[1], image.shape[2])

    return data

def Cluster(nColors, data):
    # K Means Clustering
    kMeans = MiniBatchKMeans(nColors)
    kMeans.fit(data)
    newColors = kMeans.cluster_centers_[kMeans.predict(data)]
    # Retrieve colors
    npColors = np.array(newColors*255.0)
    rgbColors = (np.unique(npColors, axis=0)).tolist()
    colors = []
    for rgb in rgbColors:
        r, g, b = [ Clamp(v) for v in rgb ]
        hex = "#{0:02x}{1:02x}{2:02x}".format(r, g, b)
        h, l, s = colorsys.rgb_to_hls(r/255.0, g/255.0, b/255.0)
        colors.append({ "rgb":[r,g,b], "hex":hex, "hsl":[h,s,l] })

    return colors

if __name__ == "__main__":
    print("done")
