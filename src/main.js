import confetti from "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/+esm";

async function get_products() {
    const request = new Request(`../jsons/products_cleaned.json`);
    const response = await fetch(request);
    const products = await response.json();
    return products;
}

function choose_product(product_json) {
    const rand_num = Math.floor(Math.random() * 64);
    const product = product_json[rand_num];
    return product;
}
function show_modal(modal){
    const current_modal = document.getElementById(modal);
    current_modal.style.display = "block";
}

function close_modal(modal) {
    const current_modal = document.getElementById(modal);
    current_modal.style.display = "none";
}
function show_product_info(product) {
    
    const section = document.querySelector("section");
    const img_section = document.querySelector("img_section");
   
    const product_img = document.createElement("img");
    const product_brand = document.createElement("div");
    const product_name = document.createElement("div");
    const product_weight = document.createElement("div");
    product_brand.classList.add("product_info");
    product_name.classList.add("product_info");
    product_weight.classList.add("product_info");
    product_img.src = `../img/${product.product_img_folder}/${product.product_img_name}`;
    product_img.loading = "lazy";
    product_img.height = 200;
    product_brand.textContent = "Marke: " + product.product_brand;
    product_name.textContent = "Produkt: " + product.product_name;
    product_weight.textContent = "Menge: " + product.product_weight;
    section.appendChild(product_brand);
    section.appendChild(product_name);
    section.appendChild(product_weight);
    img_section.appendChild(product_img);
}

function add_event_listeners(product) {
    const tutorial_button = document.getElementById("tutorial_button");
    const stats_button = document.getElementById("stats_button");
    const input_field = document.getElementById("input_guess");
    const submit_button = document.getElementById("submit_button");
    const tutorial_close_button = document.getElementById("tutorial_close_button");
    const stats_close_button = document.getElementById("stats_close_button");

    tutorial_button.addEventListener("click", () => {
        show_modal("tutorial_modal");
    });
    tutorial_close_button.addEventListener("click", () => {
        close_modal("tutorial_modal");
    });
    stats_button.addEventListener("click", () => {
        show_modal("stats_modal");
    });
    stats_close_button.addEventListener("click", () => {
        close_modal("stats_modal");
    });
    input_field.addEventListener("focus", () => {
        input_field.setAttribute("placeholder", "0.00");
    });
    input_field.addEventListener("keydown", function(event) {
        if(event.key === "Enter") {
            submit_button.click();
        }
    });
    input_field.addEventListener("blur", () => {
        input_field.setAttribute("placeholder", "Gib einen Tipp ab...")
    });
    submit_button.addEventListener("click", () => {
        make_guess(product);
        input_field.value = "";
    });
}

function make_guess(product) {

    const guess_section = document.querySelector("guess_section");
    const guess_grid = document.createElement("div");
    const guess = document.createElement("div")
    const direction = document.createElement("div");

    guess_grid.classList.add("guess_grid");
    guess.classList.add("guess");
    direction.classList.add("direction")
    const guess_price = document.getElementById("input_guess").value;

    if (guess_price == "") {
        wrong_input("Du musst vorher einen Tipp abgeben!");
        return
    }
    if (guess_price <= 0 || guess_price >= 1000) {
        wrong_input("Der Eingabewert muss zwischen 0 und 1000 € liegen.");
        return
    }
   
    if(product.product_price != guess_price) {
        incorrect_guess(guess_section, guess_grid, guess, direction, guess_price, product.product_price);
    }
    else {
        correct_guess(guess_section, guess_grid, guess, direction, guess_price);
    }
}

function incorrect_guess(
    guess_section, 
    guess_grid,
    guess,
    direction,
    guess_price, 
    product_price) {

    if (product_price*0.95 <= guess_price && guess_price <= product_price*1.05) {
        direction.classList.add("almost")
    }
    else if (product_price*0.75 <= guess_price && guess_price <= product_price*1.25) {
        direction.classList.add("close");
    }
    if (product_price > guess_price){
        guess.textContent = `€ ${guess_price}`;
        direction.textContent = "🔼";
        guess_grid.appendChild(guess);
        guess_grid.appendChild(direction);
    }
    else {
        guess.textContent = `€ ${guess_price}`;
        direction.textContent = "🔽"
        guess_grid.appendChild(guess);
        guess_grid.appendChild(direction);
    }

    guess_section.appendChild(guess_grid);
    save_data(guess_price);

    if (guess_section.children.length >= 6) {
        disable_inputs();
        show_solution(product_price);
    }
}

function correct_guess(
    guess_section, 
    guess_grid, 
    guess, 
    direction, 
    guess_price) {

    guess.textContent = `€ ${guess_price}`;
    direction.textContent = "✅";
    direction.classList.add("correct");
    guess_grid.appendChild(guess);
    guess_grid.appendChild(direction);
    confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 },
    });
    save_data(guess_price);
    disable_inputs();
    guess_section.appendChild(guess_grid);
}

function show_solution(product_price) {
    const guess_section = document.querySelector("guess_section");
    const guess_grid = document.createElement("div");
    guess_grid.classList.add("guess_grid", "solution");
    const solution = document.createElement("div");
    solution.classList.add("guess");
    solution.textContent = `Lösung: € ${product_price}`;
    guess_grid.appendChild(solution);
    guess_section.appendChild(guess_grid);
    return
}

function disable_inputs() {
    const submit_button = document.getElementById("submit_button")
    const input_field = document.getElementById("input_guess")
    input_field.disabled = true;
    submit_button.disabled = true;
}

function wrong_input(message) {
    var snackbar = document.getElementById("snackbar");
    snackbar.className = "show";
    snackbar.textContent = message;
    setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 3000);
}

function save_data(guess_price) {
    const current_date = new Date().toISOString().slice(0,10);
    var guess_data = JSON.parse(localStorage.getItem("guesses"));
    console.log(guess_data);
    if (guess_data == null) {
        localStorage.setItem("guesses", JSON.stringify({[current_date]: [{"value": guess_price}]}));
    }
    else if (guess_data[current_date] == null){
        guess_data[current_date] = {"value": guess_price};
        localStorage.setItem("guesses", JSON.stringify(guess_data));
    }
    else {
        var todays_guess_list = guess_data[current_date];
        todays_guess_list.push({"value": guess_price})
        guess_data[current_date] = todays_guess_list
        localStorage.setItem("guesses", JSON.stringify(guess_data));
    }
}

async function main() {
    const products = await get_products();
    const product = choose_product(products);
    show_product_info(product);
    add_event_listeners(product);
}

main()


