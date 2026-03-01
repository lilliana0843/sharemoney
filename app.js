let groups = [];
let currentGroupId = null;
let payerMode = "auto";
let sharerMode = "auto";

function getCurrentGroup(){
  return groups.find(g => g.id === currentGroupId);
}

/* ========= 群組 ========= */

function createGroup(){
  const name = document.getElementById("groupName").value.trim();
  if(!name) return;

  const group = {
    id: Date.now(),
    name,
    members: [],
    expenses: []
  };

  groups.push(group);
  currentGroupId = group.id;
  document.getElementById("groupName").value="";
  renderGroups();
  renderMembers();
}

function renderGroups(){
  const div = document.getElementById("groupList");
  div.innerHTML="";
  groups.forEach(g=>{
    const btn = document.createElement("button");
    btn.textContent = g.name;
    btn.onclick = ()=>{ currentGroupId=g.id; renderMembers(); renderExpenses(); calculateSummary(); }
    div.appendChild(btn);
  });
}

/* ========= 成員 ========= */

function addMember(){
  const group = getCurrentGroup();
  if(!group) return alert("請先建立群組");

  const name = document.getElementById("memberName").value.trim();
  if(!name) return;

  group.members.push({id:Date.now(), name});
  document.getElementById("memberName").value="";
  renderMembers();
}

function renderMembers(){
  const group = getCurrentGroup();
  if(!group) return;

  const memberList=document.getElementById("memberList");
  const payerContainer=document.getElementById("payerContainer");
  const sharerContainer=document.getElementById("sharerContainer");

  memberList.innerHTML="";
  payerContainer.innerHTML="";
  sharerContainer.innerHTML="";

  group.members.forEach(m=>{
    memberList.innerHTML += `<div>${m.name}</div>`;

    payerContainer.innerHTML += `
      <div class="row payer-row" data-id="${m.id}">
        <input type="checkbox" class="payer-check" onchange="updatePayerAmounts()">
        ${m.name}
        <input type="number" class="payer-amount" disabled>
      </div>`;

    sharerContainer.innerHTML += `
      <div class="row sharer-row" data-id="${m.id}">
        <input type="checkbox" class="sharer-check" onchange="updateSharerAmounts()">
        ${m.name}
        <input type="number" class="sharer-amount" disabled>
      </div>`;
  });
}

/* ========= 自動平均邏輯 ========= */

function togglePayerMode(){
  payerMode = payerMode==="auto"?"manual":"auto";
  updatePayerAmounts();
}

function toggleSharerMode(){
  sharerMode = sharerMode==="auto"?"manual":"auto";
  updateSharerAmounts();
}

function autoSplit(rows,total,mode,className){
  if(rows.length===0) return;

  if(mode==="manual"){
    rows.forEach(r=> r.querySelector(className).disabled=false);
    return;
  }

  const avg=Math.floor(total/rows.length);
  let remainder= total-avg*rows.length;

  rows.forEach((r,i)=>{
    let value=avg;
    if(i===rows.length-1) value+=remainder;
    const input=r.querySelector(className);
    input.value=value;
    input.disabled=true;
  });
}

function updatePayerAmounts(){
  const total=Number(document.getElementById("expenseAmount").value);
  const rows=[...document.querySelectorAll(".payer-row")]
    .filter(r=>r.querySelector(".payer-check").checked);
  autoSplit(rows,total,payerMode,".payer-amount");
}

function updateSharerAmounts(){
  const total=Number(document.getElementById("expenseAmount").value);
  const rows=[...document.querySelectorAll(".sharer-row")]
    .filter(r=>r.querySelector(".sharer-check").checked);
  autoSplit(rows,total,sharerMode,".sharer-amount");
}

/* ========= 支出 ========= */

function addExpense(){
  const group=getCurrentGroup();
  if(!group) return alert("請先建立群組");

  const date=document.getElementById("expenseDate").value;
  const item=document.getElementById("expenseItem").value;
  const amount=Number(document.getElementById("expenseAmount").value);

  let payers=[], sharers=[];

  document.querySelectorAll(".payer-row").forEach(r=>{
    if(r.querySelector(".payer-check").checked){
      payers.push({
        memberId:Number(r.dataset.id),
        amount:Number(r.querySelector(".payer-amount").value)
      });
    }
  });

  document.querySelectorAll(".sharer-row").forEach(r=>{
    if(r.querySelector(".sharer-check").checked){
      sharers.push({
        memberId:Number(r.dataset.id),
        amount:Number(r.querySelector(".sharer-amount").value)
      });
    }
  });

  group.expenses.push({id:Date.now(),date,item,amount,payers,sharers});

  renderExpenses();
  calculateSummary();
}

function renderExpenses(){
  const group=getCurrentGroup();
  if(!group) return;

  const div=document.getElementById("expenseList");
  div.innerHTML="";

  group.expenses.forEach(e=>{
    div.innerHTML += `
      <div class="expense-card">
        ${e.date} - ${e.item} - ${e.amount}元
      </div>`;
  });
}

/* ========= 計算 & 清算 ========= */

function calculateSummary(){
  const group=getCurrentGroup();
  if(!group) return;

  let balance={};
  group.members.forEach(m=> balance[m.id]=0);

  group.expenses.forEach(e=>{
    e.payers.forEach(p=> balance[p.memberId]+=p.amount);
    e.sharers.forEach(s=> balance[s.memberId]-=s.amount);
  });

  const summary=document.getElementById("summary");
  summary.innerHTML="";

  group.members.forEach(m=>{
    const val=balance[m.id];
    summary.innerHTML += `<div class="summary-box">
      ${m.name}：${val>0?"應收":"應付"} ${Math.abs(val)} 元
    </div>`;
  });

  generateSettlement(balance,group.members);
}

function generateSettlement(balance,members){
  const settlement=document.getElementById("settlement");
  settlement.innerHTML="";

  let creditors=[], debtors=[];

  Object.keys(balance).forEach(id=>{
    if(balance[id]>0) creditors.push({id,amount:balance[id]});
    if(balance[id]<0) debtors.push({id,amount:-balance[id]});
  });

  creditors.forEach(c=>{
    debtors.forEach(d=>{
      if(c.amount>0 && d.amount>0){
        const pay=Math.min(c.amount,d.amount);
        c.amount-=pay;
        d.amount-=pay;

        const creditorName=members.find(m=>m.id==c.id).name;
        const debtorName=members.find(m=>m.id==d.id).name;

        settlement.innerHTML+=`<div>${debtorName} ➜ ${creditorName} ： ${pay} 元</div>`;
      }
    });
  });
}
