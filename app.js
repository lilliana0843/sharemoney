/* =========================
   全域資料結構
========================= */

// 儲存所有群組
let groups = [];

// 目前選中的群組 index
let currentGroupIndex = null;

// 是否為手動模式
let manualPayer = false;
let manualSharer = false;


/* =========================
   群組功能
========================= */

// 新增群組
function createGroup() {
  const name = document.getElementById("groupName").value.trim();
  if (!name) return alert("請輸入群組名稱");

  groups.push({
    name: name,
    members: [],
    expenses: []
  });

  document.getElementById("groupName").value = "";
  renderGroups();
}

// 顯示群組按鈕
function renderGroups() {
  const container = document.getElementById("groupList");
  container.innerHTML = "";

  groups.forEach((group, index) => {
    const btn = document.createElement("button");
    btn.innerText = group.name;
    btn.onclick = () => selectGroup(index);
    container.appendChild(btn);
  });
}

// 選擇群組
function selectGroup(index) {
  currentGroupIndex = index;
  renderMembers();
  renderExpenses();
  renderSummary();
}


/* =========================
   成員功能
========================= */

// 新增成員
function addMember() {
  const name = document.getElementById("memberName").value.trim();
  if (!name) return alert("請輸入成員名稱");
  if (currentGroupIndex === null) return alert("請先選擇群組");

  groups[currentGroupIndex].members.push(name);
  document.getElementById("memberName").value = "";

  renderMembers();
}

// 顯示成員
function renderMembers() {
  const container = document.getElementById("memberList");
  container.innerHTML = "";

  if (currentGroupIndex === null) return;

  groups[currentGroupIndex].members.forEach(member => {
    const div = document.createElement("div");
    div.className = "member-row";
    div.innerText = member;
    container.appendChild(div);
  });

  renderPayerSharerOptions();
}


/* =========================
   付款人 / 分攤人 UI
========================= */

function renderPayerSharerOptions() {
  const payerContainer = document.getElementById("payerList");
  const sharerContainer = document.getElementById("sharerList");

  payerContainer.innerHTML = "";
  sharerContainer.innerHTML = "";

  const members = groups[currentGroupIndex].members;

  members.forEach((member, index) => {

    // ===== 付款人 =====
    const payerRow = document.createElement("div");
    payerRow.className = "payer-row";

    payerRow.innerHTML = `
      <label>
        <input type="checkbox" class="payer-checkbox" value="${index}" onchange="autoSplitPayers()">
        ${member}
      </label>
      <input type="number" id="payerAmount_${index}" disabled>
    `;

    payerContainer.appendChild(payerRow);

    // ===== 分攤人 =====
    const sharerRow = document.createElement("div");
    sharerRow.className = "sharer-row";

    sharerRow.innerHTML = `
      <label>
        <input type="checkbox" class="sharer-checkbox" value="${index}" onchange="autoSplitSharers()">
        ${member}
      </label>
      <input type="number" id="sharerAmount_${index}" disabled>
    `;

    sharerContainer.appendChild(sharerRow);
  });
}


/* =========================
   自動均分邏輯（小數點兩位）
========================= */

// 自動均分付款人
function autoSplitPayers() {
  if (manualPayer) return;

  const total = parseFloat(document.getElementById("amount").value);
  if (!total) return;

  const checked = document.querySelectorAll(".payer-checkbox:checked");
  if (checked.length === 0) return;

  const average = (total / checked.length).toFixed(2);

  checked.forEach(cb => {
    const input = document.getElementById("payerAmount_" + cb.value);
    input.disabled = false;
    input.value = average;
  });
}

// 自動均分分攤人
function autoSplitSharers() {
  if (manualSharer) return;

  const total = parseFloat(document.getElementById("amount").value);
  if (!total) return;

  const checked = document.querySelectorAll(".sharer-checkbox:checked");
  if (checked.length === 0) return;

  const average = (total / checked.length).toFixed(2);

  checked.forEach(cb => {
    const input = document.getElementById("sharerAmount_" + cb.value);
    input.disabled = false;
    input.value = average;
  });
}


/* =========================
   手動模式切換
========================= */

function toggleManualPayer() {
  manualPayer = !manualPayer;
}

function toggleManualSharer() {
  manualSharer = !manualSharer;
}


/* =========================
   新增支出
========================= */

function addExpense() {
  if (currentGroupIndex === null) return alert("請先選擇群組");

  const date = document.getElementById("date").value;
  const item = document.getElementById("item").value;
  const total = parseFloat(document.getElementById("amount").value);

  if (!date || !item || !total) {
    return alert("請填寫完整資料");
  }

  const payers = {};
  const sharers = {};

  // 收集付款人資料
  document.querySelectorAll(".payer-checkbox:checked").forEach(cb => {
    const amount = parseFloat(
      document.getElementById("payerAmount_" + cb.value).value
    );
    payers[cb.value] = amount;
  });

  // 收集分攤人資料
  document.querySelectorAll(".sharer-checkbox:checked").forEach(cb => {
    const amount = parseFloat(
      document.getElementById("sharerAmount_" + cb.value).value
    );
    sharers[cb.value] = amount;
  });

  groups[currentGroupIndex].expenses.push({
    date,
    item,
    total,
    payers,
    sharers
  });

  renderExpenses();
  renderSummary();
}


/* =========================
   顯示支出
========================= */

function renderExpenses() {
  const container = document.getElementById("expenseList");
  container.innerHTML = "";

  if (currentGroupIndex === null) return;

  groups[currentGroupIndex].expenses.forEach(exp => {
    const div = document.createElement("div");
    div.className = "expense-card";
    div.innerText = `${exp.date} - ${exp.item} - $${exp.total}`;
    container.appendChild(div);
  });
}


/* =========================
   結算計算
========================= */

function renderSummary() {
  const container = document.getElementById("summary");
  container.innerHTML = "";

  if (currentGroupIndex === null) return;

  const members = groups[currentGroupIndex].members;
  const balances = Array(members.length).fill(0);

  groups[currentGroupIndex].expenses.forEach(exp => {

    // 付款人加錢
    for (let i in exp.payers) {
      balances[i] += exp.payers[i];
    }

    // 分攤人扣錢
    for (let i in exp.sharers) {
      balances[i] -= exp.sharers[i];
    }
  });

  balances.forEach((bal, index) => {
    const div = document.createElement("div");
    div.className = "summary-box";
    div.innerText = `${members[index]}：${bal.toFixed(2)} 元`;
    container.appendChild(div);
  });
}
