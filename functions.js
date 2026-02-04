async function get_products() {
    const request = new Request("/jsons/products_cleaned.json");
    const response = await fetch(request);
    const products = await response.json();
    return products;
}

function choose_product(product_json) {
    const rand_num = Math.floor(Math.random() * 64);
    const product = product_json[rand_num];
    return product;
}

function show_product_info(product) {
    
    const section = document.querySelector("section");
    const img_section = document.querySelector("img-section");
    
    const product_img = document.createElement("img");
    const product_brand = document.createElement("p");
    const product_name = document.createElement("p");
    const product_weight = document.createElement("p");

    const product_folder = `/img/${product.product_img_folder}/`
    product_img.src = product_folder + product.product_img_name;
    product_img.loading = "lazy";
    product_img.height = 200;
    product_brand.textContent = "Marke: " + product.product_brand;
    product_name.textContent = "Produkt: " + product.product_name;
    product_weight.textContent = "Gewicht: " + product.product_weight;
    section.appendChild(product_brand);
    section.appendChild(product_name);
    section.appendChild(product_weight);
    img_section.appendChild(product_img);
}


function make_guess(product) {
    const guess_price = document.getElementById("input_guess").value;
    const guessed_price = Number(guess_price);
    const guess_section = document.querySelector("guess-section");
    const guess = document.createElement("p");
    if (product.product_price > guessed_price){
        guess.textContent = `${guessed_price}: Zu niedrig!`
    }
    else if (product.product_price < guessed_price) {
        guess.textContent = `${guessed_price}: Zu hoch!`
    }
    else {
        guess.textContent = `${guessed_price}: Passt genau!`
    }
    guess_section.appendChild(guess)
    
}

async function main() {
    const products = await get_products();
    const product = choose_product(products);
    show_product_info(product);
    const submit_button = document.getElementById("submit_button");
    submit_button.addEventListener("click", () => {
        make_guess(product);
    });
}







