import confetti from "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/+esm";
import {calculate_stats, draw_graph} from "./stats.js";
import "//cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js"

var current_date = new Date().toISOString().slice(0,10);

async function get_products() {
    const request = new Request(`../jsons/products_cleaned.json`);
    const response = await fetch(request);
    const products = await response.json();
    return products;
}

function choose_product(product_json) {
    Math.seedrandom(current_date);
    const rand_num = Math.floor(Math.random() * 14400);
    const product = product_json[rand_num];
    return product;
}

function restore_guesses(product) {
    var guess_data = JSON.parse(localStorage.getItem("guesses_by_date"));
    if (guess_data == null || guess_data[current_date] == null) {
        return;
    }
    const guesses  = guess_data[current_date]["guess_values"]
    guesses.forEach(guess => {
        make_guess(product, true, guess["value"]);
    })
        
}

function show_modal(modal){
    const current_modal = document.getElementById(modal);
    current_modal.style.display = "block";
    if (modal == "stats_modal") {
        calculate_stats();
        draw_graph();
    }
}

function close_modal(modal) {
    const current_modal = document.getElementById(modal);
    current_modal.style.display = "none";
}
function show_product_info(product) {
    
    const section = document.querySelector("section");
    const product_img = document.getElementById("product_image");
    const product_brand = document.createElement("div");
    const product_name = document.createElement("div");
    const product_weight = document.createElement("div");
    product_brand.classList.add("product_info");
    product_name.classList.add("product_info");
    product_weight.classList.add("product_info");
    // product_img.src = `../img/${product.product_img_folder}/${product.product_img_name}`;
    product_img.src = product.product_img_link;
    product_brand.textContent = "Marke: " + product.product_brand;
    product_name.textContent = "Produkt: " + product.product_name;
    product_weight.textContent = "Menge: " + product.product_weight;
    section.appendChild(product_brand);
    section.appendChild(product_name);
    section.appendChild(product_weight);
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

function make_guess(product, restored = false, guess_price = null) {

    const guesses_container = document.getElementById("guesses_container");
    const guess_container = document.createElement("div");
    const guess = document.createElement("div")
    const direction = document.createElement("div");

    guess_container.classList.add("guess_container");
    guess.classList.add("guess");
    direction.classList.add("direction")
    if (guess_price == null) {
        guess_price = document.getElementById("input_guess").value;
    }
    

    if (guess_price == "") {
        wrong_input("Du musst vorher einen Tipp abgeben!");
        return
    }
    if (guess_price <= 0 || guess_price >= 1000) {
        wrong_input("Der Eingabewert muss zwischen 0 und 1000 € liegen.");
        return
    }
   
    if(product.product_price != guess_price) {
        incorrect_guess(guesses_container, guess_container, guess, direction, guess_price, product.product_price, restored);
    }
    else {
        correct_guess(guesses_container, guess_container, guess, direction, guess_price, restored);
    }
}

function incorrect_guess(
    guesses_container, 
    guess_container,
    guess,
    direction,
    guess_price, 
    product_price,
    restored) {

    if (product_price*0.95 <= guess_price && guess_price <= product_price*1.05) {
        direction.classList.add("almost")
    }
    else if (product_price*0.75 <= guess_price && guess_price <= product_price*1.25) {
        direction.classList.add("close");
    }
    else {
        direction.classList.add("far");
    }
    if (product_price > guess_price){
        guess.textContent = `€ ${guess_price}`;
        direction.textContent = "🔼";
        guess_container.appendChild(guess);
        guess_container.appendChild(direction);
    }
    else {
        guess.textContent = `€ ${guess_price}`;
        direction.textContent = "🔽"
        guess_container.appendChild(guess);
        guess_container.appendChild(direction);
    }

    guesses_container.appendChild(guess_container);
    if (restored == false) {
        save_data_by_date(guess_price);
    }
    

    if (guesses_container.children.length >= 7) {
        disable_inputs();
        show_solution(product_price);
    }
}

function correct_guess(
    guesses_container, 
    guess_container, 
    guess, 
    direction, 
    guess_price,
    restored) {

    guess.textContent = `€ ${guess_price}`;
    direction.textContent = "✅";
    direction.classList.add("correct");
    guess_container.appendChild(guess);
    guess_container.appendChild(direction);
    confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 },
    });
    if (restored == false) {
        save_data_by_date(guess_price);
        var guess_data = JSON.parse(localStorage.getItem("guesses_by_date"));
        guess_data[current_date]["solved"] = true;
        localStorage.setItem("guesses_by_date", JSON.stringify(guess_data));
    }
    disable_inputs();
    guesses_container.appendChild(guess_container);
    setTimeout(show_modal,1000, "stats_modal");
}

function show_solution(product_price) {
    const guesses_container = document.getElementById("guesses_container");
    const guess_container = document.createElement("div");
    guess_container.classList.add("guess_container", "solution");
    const solution = document.createElement("div");
    solution.classList.add("guess");
    solution.textContent = `Lösung: € ${product_price}`;
    guess_container.appendChild(solution);
    guesses_container.appendChild(guess_container);
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

function save_data_by_game(guess_price, game_count) {
    var guess_data = JSON.parse(localStorage.getItem("guesses_by_game"));
    if (guess_data == null) {
        localStorage.setItem("guesses_by_game", JSON.stringify({[game_count]: {"guess_values" : [{"value": guess_price}], "solved": false}}));
    }
    else if (guess_data[game_count] == null) {
        guess_data[game_count] = {"guess_values" : [{"value": guess_price}], "solved": false};
        localStorage.setItem("guesses_by_game", JSON.stringify(guess_data));
    }
    else {
        var todays_guess_list = guess_data[game_count]["guess_values"];
        todays_guess_list.push({"value": guess_price})
        guess_data[game_count]["guess_values"] = todays_guess_list
        localStorage.setItem("guesses_by_game", JSON.stringify(guess_data));
    }
}

function save_data_by_date(guess_price) {
    var guess_data = JSON.parse(localStorage.getItem("guesses_by_date"));
    if (guess_data == null) {
        localStorage.setItem("guesses_by_date", JSON.stringify({[current_date]: {"guess_values" : [{"value": guess_price}], "solved": false}}));
    }
    else if (guess_data[current_date] == null){
        guess_data[current_date] = {"guess_values" : [{"value": guess_price}], "solved": false};
        localStorage.setItem("guesses_by_date", JSON.stringify(guess_data));
    }
    else {
        var todays_guess_list = guess_data[current_date]["guess_values"];
        todays_guess_list.push({"value": guess_price})
        guess_data[current_date]["guess_values"] = todays_guess_list
        localStorage.setItem("guesses_by_date", JSON.stringify(guess_data));
    }
}

async function main() {
    const products = await get_products();
    const product = choose_product(products);
    show_product_info(product);
    add_event_listeners(product);
    restore_guesses(product);
}

main()


