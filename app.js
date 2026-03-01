/* =========================
   全域資料
========================= */

let groups = [];
let currentGroupIndex = null;

let manualPayer = false;
let manualSharer = false;


/* =========================
   群組功能
========================= */

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

function selectGroup(index) {
  currentGroupIndex = index;
  renderMembers();
  renderExpenses();
  renderSummary();
}


/* =========================
   成員功能
========================= */

function addMember() {
  if (currentGroupIndex === null) return alert("請先選擇群組");

  const name = document.getElementById("memberName").value.trim();
  if (!name) return alert("請輸入成員名稱");

  groups[currentGroupIndex].members.push(name);
  document.getElementById("memberName").value = "";

  renderMembers();
}

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

  if (currentGroupIndex === null) return;

  const members = groups[currentGroupIndex].members;

  members.forEach((member, index) => {

    // 付款人
    payerContainer.innerHTML += `
      <div class="payer-row">
        <label>
          <input type="checkbox" class="payer-checkbox" value="${index}">
          ${member}
        </label>
        <input type="number" id="payerAmount_${index}" disabled>
      </div>
    `;

    // 分攤人
    sharerContainer.innerHTML += `
      <div class="sharer-row">
        <label>
          <input type="checkbox" class="sharer-checkbox" value="${index}">
          ${member}
        </label>
        <input type="number" id="sharerAmount_${index}" disabled>
      </div>
    `;
  });

  // 綁定事件
  bindAutoSplitEvents();
}


/* =========================
   事件綁定
========================= */

function bindAutoSplitEvents() {

  // 金額變動時自動重算
  document.getElementById("amount").addEventListener("input", () => {
    autoSplitPayers();
    autoSplitSharers();
  });

  // 勾選付款人
  document.querySelectorAll(".payer-checkbox").forEach(cb => {
    cb.addEventListener("change", autoSplitPayers);
  });

  // 勾選分攤人
  document.querySelectorAll(".sharer-checkbox").forEach(cb => {
    cb.addEventListener("change", autoSplitSharers);
  });
}


/* =========================
   自動均分
========================= */

function autoSplitPayers() {

  if (manualPayer) return;

  const total = parseFloat(document.getElementById("amount").value);
  const checked = document.querySelectorAll(".payer-checkbox:checked");

  // 先全部清空
  document.querySelectorAll("[id^='payerAmount_']").forEach(input => {
    input.value = "";
    input.disabled = true;
  });

  if (!total || checked.length === 0) return;

  const average = (total / checked.length).toFixed(2);

  checked.forEach(cb => {
    const input = document.getElementById("payerAmount_" + cb.value);
    input.disabled = false;
    input.value = average;
  });
}

function autoSplitSharers() {

  if (manualSharer) return;

  const total = parseFloat(document.getElementById("amount").value);
  const checked = document.querySelectorAll(".sharer-checkbox:checked");

  // 先全部清空
  document.querySelectorAll("[id^='sharerAmount_']").forEach(input => {
    input.value = "";
    input.disabled = true;
  });

  if (!total || checked.length === 0) return;

  const average = (total / checked.length).toFixed(2);

  checked.forEach(cb => {
    const input = document.getElementById("sharerAmount_" + cb.value);
    input.disabled = false;
    input.value = average;
  });
}


/* =========================
   手動模式
========================= */

function toggleManualPayer() {
  manualPayer = !manualPayer;

  document.querySelectorAll("[id^='payerAmount_']").forEach(input => {
    input.disabled = !manualPayer;
  });
}

function toggleManualSharer() {
  manualSharer = !manualSharer;

  document.querySelectorAll("[id^='sharerAmount_']").forEach(input => {
    input.disabled = !manualSharer;
  });
}


/* =========================
   新增支出
========================= */

function addExpense() {

  if (currentGroupIndex === null)
    return alert("請先選擇群組");

  const date = document.getElementById("date").value;
  const item = document.getElementById("item").value;
  const total = parseFloat(document.getElementById("amount").value);

  if (!date || !item || !total)
    return alert("請填寫完整資料");

  const payers = {};
  const sharers = {};

  document.querySelectorAll(".payer-checkbox:checked").forEach(cb => {
    const val = parseFloat(document.getElementById("payerAmount_" + cb.value).value);
    payers[cb.value] = val;
  });

  document.querySelectorAll(".sharer-checkbox:checked").forEach(cb => {
    const val = parseFloat(document.getElementById("sharerAmount_" + cb.value).value);
    sharers[cb.value] = val;
  });

  groups[currentGroupIndex].expenses.push({
    date,
    item,
    total,
    payers,
    sharers
  });

  clearExpenseForm();
  renderExpenses();
  renderSummary();
}


/* =========================
   清空表單
========================= */

function clearExpenseForm() {
  document.getElementById("date").value = "";
  document.getElementById("item").value = "";
  document.getElementById("amount").value = "";

  document.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);
  document.querySelectorAll("input[type='number']").forEach(input => {
    input.value = "";
    input.disabled = true;
  });
}


/* =========================
   顯示支出
========================= */

function renderExpenses() {

  const container = document.getElementById("expenseList");
  container.innerHTML = "";

  if (currentGroupIndex === null) return;

  groups[currentGroupIndex].expenses.forEach(exp => {
    container.innerHTML += `
      <div class="expense-card">
        ${exp.date} - ${exp.item} - $${exp.total}
      </div>
    `;
  });
}


/* =========================
   結算
========================= */

function renderSummary() {

  const container = document.getElementById("summary");
  container.innerHTML = "";

  if (currentGroupIndex === null) return;

  const members = groups[currentGroupIndex].members;
  const balances = Array(members.length).fill(0);

  groups[currentGroupIndex].expenses.forEach(exp => {

    for (let i in exp.payers)
      balances[i] += exp.payers[i];

    for (let i in exp.sharers)
      balances[i] -= exp.sharers[i];
  });

  balances.forEach((bal, i) => {
    container.innerHTML += `
      <div class="summary-box">
        ${members[i]}：${bal.toFixed(2)} 元
      </div>
    `;
  });
}
