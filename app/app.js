/***********************
  1️⃣ 全域資料
************************/

let trip = {
  members: [],
  expenses: []
};


/***********************
  2️⃣ 初始化
************************/

window.onload = function () {
  loadData();
  renderMembers();
};


/***********************
  3️⃣ 成員管理
************************/

function addMember() {
  const nameInput = document.getElementById("memberName");
  const name = nameInput.value.trim();

  if (!name) return alert("請輸入名字");

  trip.members.push({
    id: Date.now() + Math.random(),
    name: name
  });

  nameInput.value = "";
  saveData();
  renderMembers();
}

function renderMembers() {
  const container = document.getElementById("memberList");
  container.innerHTML = "";

  trip.members.forEach(member => {
    const div = document.createElement("div");
    div.textContent = member.name;
    container.appendChild(div);
  });
}


/***********************
  4️⃣ 新增支出
************************/

function addExpense() {
  const date = document.getElementById("expenseDate").value;
  const item = document.getElementById("expenseItem").value;
  const amount = Number(document.getElementById("expenseAmount").value);

  if (!date || !item || !amount) {
    return alert("請填寫完整支出資料");
  }

  const payers = collectPayers();
  const sharers = collectSharers();

  if (!validateTotal(amount, payers, sharers)) return;

  const expense = {
    id: Date.now(),
    date,
    item,
    amount,
    payers,
    sharers
  };

  trip.expenses.push(expense);

  saveData();
  calculateSummary();
}


/***********************
  5️⃣ 收集付款人資料
************************/

function collectPayers() {
  const payerRows = document.querySelectorAll(".payer-row");
  let payers = [];

  payerRows.forEach(row => {
    const checked = row.querySelector(".payer-check").checked;
    if (!checked) return;

    const memberId = Number(row.dataset.id);
    const amount = Number(row.querySelector(".payer-amount").value);

    payers.push({
      memberId,
      amount
    });
  });

  return payers;
}


/***********************
  6️⃣ 收集分攤人資料
************************/

function collectSharers() {
  const sharerRows = document.querySelectorAll(".sharer-row");
  let sharers = [];

  sharerRows.forEach(row => {
    const checked = row.querySelector(".sharer-check").checked;
    if (!checked) return;

    const memberId = Number(row.dataset.id);
    const amount = Number(row.querySelector(".sharer-amount").value);

    sharers.push({
      memberId,
      amount
    });
  });

  return sharers;
}


/***********************
  7️⃣ 驗證金額
************************/

function validateTotal(totalAmount, payers, sharers) {
  const totalPaid = payers.reduce((sum, p) => sum + p.amount, 0);
  const totalShared = sharers.reduce((sum, s) => sum + s.amount, 0);

  if (totalPaid !== totalAmount) {
    alert("付款總額不等於支出金額");
    return false;
  }

  if (totalShared !== totalAmount) {
    alert("分攤總額不等於支出金額");
    return false;
  }

  return true;
}


/***********************
  8️⃣ 計算總結
************************/

function calculateSummary() {
  let paid = {};
  let shouldPay = {};

  trip.members.forEach(member => {
    paid[member.id] = 0;
    shouldPay[member.id] = 0;
  });

  trip.expenses.forEach(exp => {
    exp.payers.forEach(p => {
      paid[p.memberId] += p.amount;
    });

    exp.sharers.forEach(s => {
      shouldPay[s.memberId] += s.amount;
    });
  });

  renderSummary(paid, shouldPay);
}


/***********************
  9️⃣ 顯示結果
************************/

function renderSummary(paid, shouldPay) {
  const container = document.getElementById("summary");
  container.innerHTML = "";

  trip.members.forEach(member => {
    const balance = paid[member.id] - shouldPay[member.id];

    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${member.name}</strong><br>
      已付：${paid[member.id]}<br>
      應付：${shouldPay[member.id]}<br>
      餘額：${balance}
      <hr>
    `;

    container.appendChild(div);
  });
}


/***********************
  🔟 儲存與讀取
************************/

function saveData() {
  localStorage.setItem("tripData", JSON.stringify(trip));
}

function loadData() {
  const data = localStorage.getItem("tripData");
  if (data) {
    trip = JSON.parse(data);
  }
}

function renderMembers() {
  const memberList = document.getElementById("memberList");
  const payerContainer = document.getElementById("payerContainer");
  const sharerContainer = document.getElementById("sharerContainer");

  memberList.innerHTML = "";
  payerContainer.innerHTML = "";
  sharerContainer.innerHTML = "";

  trip.members.forEach(member => {

    // 成員列表
    const div = document.createElement("div");
    div.className = "member-row";
    div.textContent = member.name;
    memberList.appendChild(div);

    // 付款人
    const payerRow = document.createElement("div");
    payerRow.className = "payer-row";
    payerRow.dataset.id = member.id;

    payerRow.innerHTML = `
      <input type="checkbox" class="payer-check">
      ${member.name}
      <input type="number" class="payer-amount" placeholder="金額">
    `;

    payerContainer.appendChild(payerRow);

    // 分攤人
    const sharerRow = document.createElement("div");
    sharerRow.className = "sharer-row";
    sharerRow.dataset.id = member.id;

    sharerRow.innerHTML = `
      <input type="checkbox" class="sharer-check">
      ${member.name}
      <input type="number" class="sharer-amount" placeholder="金額">
    `;

    sharerContainer.appendChild(sharerRow);
  });
}

