const form = document.getElementById("transaction-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const transactionList = document.getElementById("transaction-list");
const filterInput = document.getElementById("filter");
const clearAllBtn = document.getElementById("clear-all");
const exportBtn = document.getElementById("export");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let chart;
let editId = null;

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
    id: editId ? editId : Date.now(),
    title: title,
    amount: amount,
    type: type,
    category: category,
    date: date
  };

  if (editId) {
    transactions = transactions.map(function (t) {
      if (t.id === editId) {
        return transaction;
      }
      return t;
    });
    editId = null;
  } else {
    transactions.push(transaction);
  }

  saveToLocalStorage();
  displayTransactions();
  updateSummary();
  updateChart();
  form.reset();
});

filterInput.addEventListener("change", function () {
  displayTransactions();
});

clearAllBtn.addEventListener("click", function () {
  transactions = [];
  editId = null;
  saveToLocalStorage();
  displayTransactions();
  updateSummary();
  updateChart();
});

exportBtn.addEventListener("click", function () {
  if (transactions.length === 0) {
    alert("No data to export");
    return;
  }

  let csvContent = "Title,Amount,Type,Category,Date\n";

  transactions.forEach(function (t) {
    csvContent += `${t.title},${t.amount},${t.type},${t.category},${t.date}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", "transactions.csv");
  a.click();
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

    const color = transaction.type === "income" ? "green" : "red";

    li.innerHTML = `
      <span style="color:${color}">
        ${transaction.title} - ₹${transaction.amount} - ${transaction.category} - ${transaction.date}
      </span>
      <div>
        <button onclick="editTransaction(${transaction.id})">Edit</button>
        <button onclick="deleteTransaction(${transaction.id})">Delete</button>
      </div>
    `;

    transactionList.appendChild(li);
  });
}

function editTransaction(id) {
  const t = transactions.find(function (item) {
    return item.id === id;
  });

  titleInput.value = t.title;
  amountInput.value = t.amount;
  typeInput.value = t.type;
  categoryInput.value = t.category;
  dateInput.value = t.date;

  editId = id;
}

function deleteTransaction(id) {
  transactions = transactions.filter(function (t) {
    return t.id !== id;
  });

  if (editId === id) {
    editId = null;
    form.reset();
  }

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