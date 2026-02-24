import asyncio
import pandas as pd
from pydoll.browser.chromium import Chrome
from pydoll.constants import Key
import re
import os
import time

product_df = pd.DataFrame(columns=["product_brand",
                                    "product_name",
                                    "product_weight", 
                                    "product_price", 
                                    "product_img_link"])

def normalize_strings(text):
    not_wanted_chars = ["\\", "/", "*", "?", "!", "<", ">", "\"", "%"]
    new_text = "".join(filter(lambda c: c not in not_wanted_chars, text))
    return new_text
            

async def find_products():
    websites = [
        "https://www.spar.at/produktwelt/lebensmittel?page=1",
        "https://www.spar.at/produktwelt/getraenke?page=1"]
    
    for website in websites:
    
        async with Chrome() as browser:
            page_counter = 1
            
            tab = await browser.start()
            await tab.go_to(website, timeout=5)
            max_pages = await tab.find(class_name="pagination__text")
            max_pages = await max_pages.text
            print(max_pages)
            max_pages = int(max_pages.removeprefix("1 von "))

            while page_counter <= max_pages:
                time.sleep(2)
                await tab.keyboard.press(Key.ESCAPE)
                time.sleep(2)
                products = await tab.find(class_name="spar-plp__grid-item", find_all=True, timeout=2000)

                for product in products:
                    brand = await product.find(class_name="product-tile__name1", raise_exc=False)
                    name = await product.find(class_name="product-tile__name2", raise_exc=False)
                    weight = await product.find(class_name="product-tile__name3", raise_exc=False)

                    # Sometimes product weight does not align with price for the actual weight and a different actual weight
                    # is displayed below the price. If that's the case, we have to use that different weight.
                    weight_display_unit = await product.find(class_name="product-price__price-display-unit", raise_exc=False)
                    old_price = await product.find(class_name="product-price__price-old", raise_exc=False)
                    img_tile = await product.find(class_name="product-tile__image-price")
                    img = await img_tile.find(class_name="adaptive-image__img")
                    
                    if old_price:
                        price = old_price
                    else:
                        price = await product.find(class_name="product-price__price")
                    if brand:
                        brand_text = await brand.text
                    else:
                        brand_text = None
                    if name:
                        name_text = await name.text
                    else: 
                        name_text = None
                    if weight_display_unit:
                        weight_text = await weight_display_unit.text
                    elif weight:
                        weight_text = await weight.text
                    else:
                        weight_text = None
                    price_text = await price.text
                    image_text = await img.inner_html

                    pattern = r'src="([^"]+)"'
                    match = re.search(pattern, image_text)
                    if match:
                        image_link = match.group(1)

                    product_df.loc[len(product_df)] = [brand_text, name_text, weight_text, price_text, image_link]

                product_df.to_json(f"./jsons/products_combined.json", orient="index", indent=4)
                page_counter +=1
                next_page_button = await tab.find(aria_label="Zur nächsten Seite")
                await next_page_button.click()

asyncio.run(find_products())