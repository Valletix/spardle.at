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
    const product_brand = document.createElement("div");
    const product_name = document.createElement("div");
    const product_weight = document.createElement("div");
    product_brand.classList.add("product_info");
    product_name.classList.add("product_info");
    product_weight.classList.add("product_info");
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

function add_event_listeners(product) {
    const input_field = document.getElementById("input_guess")
    const submit_button = document.getElementById("submit_button");
    input_field.addEventListener("focus", () => {
        input_field.setAttribute("placeholder", "0.00");
    })
    input_field.addEventListener("blur", () => {
        input_field.setAttribute("placeholder", "Gib einen Tipp ab...")
    })
    submit_button.addEventListener("click", () => {
        make_guess(product);
    });
}

function make_guess(product) {
    const guess_price = document.getElementById("input_guess").value;
    if (guess_price == "") {
        no_input();
        return
    }
    const guess_section = document.querySelector("guess-section");
    const guess = document.createElement("div");
    guess.classList.add("guess");
    if (product.product_price > guess_price){
        guess.textContent = `${guess_price} – Zu niedrig!`
    }
    else if (product.product_price < guess_price) {
        guess.textContent = `${guess_price} – Zu hoch!`
    }
    else {
        guess.textContent = `${guess_price} – Passt genau!`
        disable_inputs()
    }
    guess_section.appendChild(guess)
    if (guess_section.children.length >= 6) {
        disable_inputs()
    }
}
function disable_inputs() {
    const submit_button = document.getElementById("submit_button")
    const input_field = document.getElementById("input_guess")
    input_field.disabled = true;
    submit_button.disabled = true;
}

function no_input() {
    var snackbar = document.getElementById("snackbar");
    snackbar.className = "show";
    setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 3000);
}

async function main() {
    const products = await get_products();
    const product = choose_product(products);
    show_product_info(product);
    add_event_listeners(product);
}









