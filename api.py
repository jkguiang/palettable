import numpy as np
import warnings; warnings.simplefilter('ignore')  # Fix NumPy issues.
from sklearn.cluster import MiniBatchKMeans
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
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

def GetImage(url):
    # Get screenshot
    chromeOptions = Options()
    chromeOptions.add_argument("--headless")
    chromeOptions.add_argument("--window-size=1920x1080")
    DRIVER = 'chromedriver'
    driver = webdriver.Chrome(chrome_options=chromeOptions, executable_path=DRIVER) # Make sure this is in path
    driver.get(url)
    screenshot = driver.get_screenshot_as_base64()
    driver.quit()
    # Process screenshot
    image = ProcImage(screenshot)

    return image

def GetData(image):
    # Shape data
    data = image / 255.0 # use 0...1 scale
    data = data.reshape(image.shape[0] * image.shape[1], image.shape[2])

    return data

def Cluster(nColors, image, data):
    # K Means Clustering
    kMeans = MiniBatchKMeans(nColors)
    kMeans.fit(data)
    newColors = kMeans.cluster_centers_[kMeans.predict(data)]
    # Retrieve colors and recolored image
    npColors = np.array(newColors*255.0)
    rgbaColors = (np.unique(npColors, axis=0)).tolist()
    colors = []
    for rgb in rgbaColors:
        colors.append("#{0:02x}{1:02x}{2:02x}".format(Clamp(rgb[0]), Clamp(rgb[1]), Clamp(rgb[2])))

    return colors

if __name__ == "__main__":
    print("done")
