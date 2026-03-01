let trip = {
  members: [],
  expenses: []
};

// ===== 新增成員 =====
function addMember() {
  const nameInput = document.getElementById("memberName");
  const name = nameInput.value.trim();

  if (!name) return;

  trip.members.push({
    id: Date.now(),
    name: name
  });

  nameInput.value = "";
  renderMembers();
}

// ===== 渲染成員 + payer + sharer =====
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
      <span>${member.name}</span>
      <input type="number" class="payer-amount" placeholder="金額">
    `;
    payerContainer.appendChild(payerRow);

    // 分攤人
    const sharerRow = document.createElement("div");
    sharerRow.className = "sharer-row";
    sharerRow.dataset.id = member.id;

    sharerRow.innerHTML = `
      <input type="checkbox" class="sharer-check">
      <span>${member.name}</span>
      <input type="number" class="sharer-amount" placeholder="金額">
    `;
    sharerContainer.appendChild(sharerRow);
  });
}

// ===== 新增支出 =====
function addExpense() {
  const date = document.getElementById("expenseDate").value;
  const item = document.getElementById("expenseItem").value;
  const amount = Number(document.getElementById("expenseAmount").value);

  if (!date || !item || !amount) {
    alert("請填完整資料");
    return;
  }

  let payers = [];
  let sharers = [];

  // 取得付款人
  document.querySelectorAll(".payer-row").forEach(row => {
    const checked = row.querySelector(".payer-check").checked;
    const memberId = Number(row.dataset.id);
    const payAmount = Number(row.querySelector(".payer-amount").value);

    if (checked && payAmount > 0) {
      payers.push({ memberId, amount: payAmount });
    }
  });

  // 取得分攤人
  document.querySelectorAll(".sharer-row").forEach(row => {
    const checked = row.querySelector(".sharer-check").checked;
    const memberId = Number(row.dataset.id);
    const shareAmount = Number(row.querySelector(".sharer-amount").value);

    if (checked && shareAmount > 0) {
      sharers.push({ memberId, amount: shareAmount });
    }
  });

  trip.expenses.push({
    id: Date.now(),
    date,
    item,
    amount,
    payers,
    sharers
  });

  clearExpenseForm();
  calculateSummary();
}

// ===== 清空表單 =====
function clearExpenseForm() {
  document.getElementById("expenseDate").value = "";
  document.getElementById("expenseItem").value = "";
  document.getElementById("expenseAmount").value = "";

  document.querySelectorAll("input[type=checkbox]").forEach(c => c.checked = false);
  document.querySelectorAll(".payer-amount, .sharer-amount").forEach(i => i.value = "");
}

// ===== 計算結算 =====
function calculateSummary() {
  let balance = {};

  trip.members.forEach(m => {
    balance[m.id] = 0;
  });

  trip.expenses.forEach(expense => {
    expense.payers.forEach(p => {
      balance[p.memberId] += p.amount;
    });

    expense.sharers.forEach(s => {
      balance[s.memberId] -= s.amount;
    });
  });

  const summaryDiv = document.getElementById("summary");
  summaryDiv.innerHTML = "";

  trip.members.forEach(member => {
    const div = document.createElement("div");
    div.className = "summary-box";

    const money = balance[member.id];

    if (money > 0) {
      div.textContent = `${member.name} 應收 ${money} 元`;
    } else if (money < 0) {
      div.textContent = `${member.name} 應付 ${Math.abs(money)} 元`;
    } else {
      div.textContent = `${member.name} 已結清`;
    }

    summaryDiv.appendChild(div);
  });
}
