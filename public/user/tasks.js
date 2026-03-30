let currentUser = JSON.parse(localStorage.getItem("currentUser"));
const taskList = document.getElementById("task-list");
const pointsDisplay = document.getElementById("user-points");
const redeemBtn = document.getElementById("redeem");
const voucherMsg = document.getElementById("voucher-msg");
const backBtn = document.getElementById("back-btn");

const tasks = [
  {id:1, name:"Đăng ký tài khoản", points:20},
  {id:2, name:"Đăng nhập lần đầu", points:10},
  {id:3, name:"Xem sản phẩm", points:150},
];

function renderTasks(){
  taskList.innerHTML="";
  if(!currentUser.tasks) currentUser.tasks=[];
  tasks.forEach(task=>{
    const completed = currentUser.tasks.includes(task.id);
    const li=document.createElement("li");
    li.innerHTML=`<input type="checkbox" id="task-${task.id}" ${completed?"checked":""}><label for="task-${task.id}">${task.name} (+${task.points} điểm)</label>`;
    taskList.appendChild(li);

    li.querySelector("input").addEventListener("change", function(){
      if(this.checked && !completed){
        currentUser.points+=task.points;
        currentUser.tasks.push(task.id);
        saveCurrentUser();
        updatePoints();
        alert(`Hoàn thành "${task.name}" +${task.points} điểm!`);
      }
    });
  });
}

function updatePoints(){
  pointsDisplay.textContent=currentUser.points;
  redeemBtn.disabled=currentUser.points<100;
}

redeemBtn.addEventListener("click", ()=>{
  if(currentUser.points>=100){
    currentUser.points-=100;
    saveCurrentUser();
    updatePoints();
    voucherMsg.textContent="Đổi thành công voucher 50.000₫ 🎉";
  }
});

backBtn.addEventListener("click", ()=>{
  window.location.href="index_user.html";
});

function saveCurrentUser(){ localStorage.setItem("currentUser", JSON.stringify(currentUser)); }

renderTasks();
updatePoints();
