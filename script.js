const form = document.getElementById("transaction-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const transactionList = document.getElementById("transaction-list");
const filterInput = document.getElementById("filter");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let chart;

displayTransactions();
updateSummary();
updateChart();

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const amount = amountInput.value.trim();
  const type = typeInput.value;
  const category = categoryInput.value;
  const date = dateInput.value;

  if (title === "" || amount === "" || type === "" || category === "" || date === "") {
    alert("Please fill all fields");
    return;
  }

  if (Number(amount) <= 0) {
    alert("Amount must be greater than 0");
    return;
  }

  const transaction = {
    id: Date.now(),
    title: title,
    amount: amount,
    type: type,
    category: category,
    date: date
  };

  transactions.push(transaction);
  saveToLocalStorage();
  displayTransactions();
  updateSummary();
  updateChart();
  form.reset();
});

filterInput.addEventListener("change", function () {
  displayTransactions();
});

function displayTransactions() {
  transactionList.innerHTML = "";

  let filteredTransactions = transactions;

  if (filterInput.value !== "all") {
    filteredTransactions = transactions.filter(function (transaction) {
      return transaction.type === filterInput.value;
    });
  }

  filteredTransactions.forEach(function (transaction) {
    const li = document.createElement("li");

    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";

    const color = transaction.type === "income" ? "green" : "red";

    li.innerHTML = `
      <span style="color:${color}">
        ${transaction.title} - ₹${transaction.amount} - ${transaction.category} - ${transaction.date}
      </span>
      <button onclick="deleteTransaction(${transaction.id})">Delete</button>
    `;

    transactionList.appendChild(li);
  });
}

function deleteTransaction(id) {
  transactions = transactions.filter(function (t) {
    return t.id !== id;
  });

  saveToLocalStorage();
  displayTransactions();
  updateSummary();
  updateChart();
}

function updateSummary() {
  let income = 0;
  let expense = 0;

  transactions.forEach(function (t) {
    if (t.type === "income") {
      income += Number(t.amount);
    } else {
      expense += Number(t.amount);
    }
  });

  document.getElementById("income").textContent = "₹" + income;
  document.getElementById("expense").textContent = "₹" + expense;
  document.getElementById("balance").textContent = "₹" + (income - expense);
}

function saveToLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateChart() {
  const expenseData = {};

  transactions.forEach(function (t) {
    if (t.type === "expense") {
      if (!expenseData[t.category]) {
        expenseData[t.category] = 0;
      }
      expenseData[t.category] += Number(t.amount);
    }
  });

  const labels = Object.keys(expenseData);
  const data = Object.values(expenseData);

  const ctx = document.getElementById("expenseChart").getContext("2d");

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top"
        }
      }
    }
  });
}