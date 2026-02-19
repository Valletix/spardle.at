import "https://cdn.jsdelivr.net/npm/chart.js@4.5.0";
import "https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels";
import { calculate_date_difference } from "./main.js";

export function calculate_stats() {
  let game_data = JSON.parse(localStorage.getItem("guesses_by_date"));
  if (game_data == null) {
    return guess_distribution
  }

  let number_of_games = Object.keys(game_data).length; 
  let solved_counter = 0;
  let current_streak = 0;
  let max_streak = 0;
  let guess_distribution = [0,0,0,0,0,0,0]
  let previous_game = "1998-02-26";
  for (let game in game_data) {
      let current_game = game;
      if(calculate_date_difference(current_game, previous_game) > 1) {
        current_streak = 0;
      }
      if (game_data[game]["solved"] == true) {
        solved_counter +=1;
        current_streak +=1;
        max_streak = Math.max(current_streak, max_streak);
        let number_of_guesses = Object.keys(game_data[game]["guess_values"]).length;
        guess_distribution[number_of_guesses-1] +=1;
      }
      else {
        current_streak = 0;
        guess_distribution[6] +=1;
      };
      previous_game = game;
  }
  let win_percent = (solved_counter / number_of_games * 100).toFixed(2);

  document.getElementById("games_played").textContent = number_of_games;
  document.getElementById("win_percent").textContent = win_percent;
  document.getElementById("max_streak").textContent = max_streak;
  document.getElementById("current_streak").textContent = current_streak;

  return guess_distribution;
}

export function draw_graph() {

  const x_values = ["1: ", "2: ", "3: ", "4: ", "5: ", "6: ", "Failed: "];
  const y_values = calculate_stats();
  const bar_colors = ["#06b81e","#5fe406","#a1e406","#d5e406","#e49e06","#e45f06","#E40613"];
  let existing_chart = Chart.getChart("stats_chart")
  if (existing_chart) {
    existing_chart.destroy();
  }
  const stats_chart = document.getElementById("stats_chart");
  Chart.register(ChartDataLabels);
  Chart.defaults.font.size = 16;

  new Chart(stats_chart, {
    type: "bar",
    data: {
    labels: x_values,
    datasets: [{
      backgroundColor: bar_colors,
      data: y_values
    }]
  },
    options: {
      indexAxis: 'y',
      responsive: true,
      events: [],
      plugins: {
        legend: {display: false},
        datalabels: {
          anchor: "start",
          align: "end",
          offset: 0,
          color: "black",
          formatter: function (value, context) {
                      return value;
        }
      }
      },
      scales: {
          x: {
              border: {
                  display: false
              },
              grid: {
                  display: false,
              },
              ticks: {
                  display: false
              }
          },
          y: {
              border: {
                  display: false
              },
              grid: {
                  display: false,
              }
          }
          
    },

  }
  });
}