import matplotlib.pyplot as plt
import base64
import io
import numpy as np
import scipy
from sklearn.cluster import MiniBatchKMeans
import warnings; warnings.simplefilter('ignore')  # Fix NumPy issues.
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def Clamp(rgbVal):
  return int(max(0, min(rgbVal, 255)))

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

    return screenshot

def ProcImage(screenshot):
    # Read screenshot
    image = base64.b64decode(screenshot)
    image = io.BytesIO(image)
    image = plt.imread(image, format="jpg")

    return image

def ShapeData(image):
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
    newImage = newColors.reshape(image.shape)
    npColors = np.array(newColors*255.0)
    rgbaColors = (np.unique(npColors, axis=0)).tolist()
    colors = []
    for rgb in rgbaColors:
        colors.append("#{0:02x}{1:02x}{2:02x}".format(Clamp(rgb[0]), Clamp(rgb[1]), Clamp(rgb[2])))

    return colors, base64.b64encode(newImage)

if __name__ == "__main__":
    print("done")
