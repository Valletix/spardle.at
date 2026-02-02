async function get_products() {
    const request = new Request("/jsons/products.json");
    const response = await fetch(request);
    const products = await response.json();

    show_product_info(products);
}

function show_product_info(obj) {
    const section = document.querySelector("section");
    const img_section = document.querySelector("img-section");

    const products = obj;
    const product_img = document.createElement("img");
    const product_brand = document.createElement("p");
    const product_name = document.createElement("p");
    const product_weight = document.createElement("p");

    product_img.src = "/img/1/" + products[0].product_img_name;
    product_img.loading = "lazy";
    product_img.height = 200;
    product_brand.textContent = "Marke: " + products[0].product_brand;
    product_name.textContent = "Produkt: " + products[0].product_name;
    product_weight.textContent = "Gewicht: " + products[0].product_weight;
    section.appendChild(product_brand);
    section.appendChild(product_name);
    section.appendChild(product_weight);
    img_section.appendChild(product_img);
}

get_products()