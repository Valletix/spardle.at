import "https://cdn.jsdelivr.net/npm/chart.js@4.5.0";
import "https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels";



function draw_graph() {

  const x_values = ["1: ", "2: ", "3: ", "4: ", "5: ", "6: ", "Failed: "];
  const y_values = [2, 4, 7, 10, 7, 2, 1];
  const bar_colors = ["#06b81e","#5fe406","#a1e406","#d5e406","#e49e06","#e45f06","#E40613"];

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

draw_graph();
