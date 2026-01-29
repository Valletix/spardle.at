import asyncio
import pandas as pd
from pydoll.browser.chromium import Chrome
from pydoll.constants import Key
import re

product_df = pd.DataFrame(columns=["product_brand", "product_name", "product_weight", "product_price", "image_link"])

def normalize_strings(text):
    not_wanted_chars = ["\\", "/", "*", "?", "!", "<", ">", "\""]
    new_text = "".join(filter(lambda c: c not in not_wanted_chars, text))
    return new_text
            

async def find_products():
    async with Chrome() as browser:
        tab = await browser.start()
        await tab.go_to('https://www.spar.at/produktwelt/lebensmittel?page=1', timeout=5)

        await tab.keyboard.press(Key.ESCAPE)

        products = await tab.find(class_name="spar-plp__grid-item", find_all=True)

        for product in products:
            brand = await product.find(class_name="product-tile__name1")
            name = await product.find(class_name="product-tile__name2")
            weight = await product.find(class_name="product-tile__name3", raise_exc=False)
            old_price = await product.find(class_name="product-price__price-old", raise_exc=False)
            if old_price:
                price = old_price
            else:
                price = await product.find(class_name="product-price__price")
            img_tile = await product.find(class_name="product-tile__image-price")
            img = await img_tile.find(class_name="adaptive-image__img")

            brand_text = await brand.text
            name_text = await name.text
            if weight:
                weight_text = await weight.text
            else:
                weight_text = None
            price_text = await price.text
            image_text = await img.inner_html

            pattern = r'src="([^"]+)"'
            match = re.search(pattern, image_text)

            if match:
                image_link = match.group(1)
                
            # img_tab = await browser.new_tab(image_link)

            # img_clean = await img_tab.find(tag_name="img")

            # await img_clean.take_screenshot(f"img/{normalize_strings(f"{brand_text}_{name_text}_{weight_text}")}.png", quality=85)

            # await img_tab.close()
        

            # await product.take_screenshot(f"img/{normalize_strings(f"{brand_text}_{name_text}_{weight_text}")}.png", quality=85)


            product_df.loc[len(product_df)] = [brand_text, name_text, weight_text, price_text, image_link]
    print(product_df)

asyncio.run(find_products())