const users = [{username:"p", password:"testuser"}];
window.onload = () => {
    loadBirthDate();
    showScreen("welcome");
}

function loadBirthDate(){
    const day = document.getElementById("birthDay");
    const month = document.getElementById("birthMonth");
    const year = document.getElementById("birthYear");
    for (let d = 1; d <= 31; d++){
        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = d;
        day.appendChild(opt);
    }
    for (let m = 1; m <= 12; m++){
        const opt = document.createElement("option");
        opt.value = m; 
        opt.textContent = m;
        month.appendChild(opt);
    }
    for (let y = 1; y <= 31; y++){
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        year.appendChild(opt);
    }
}

//לבדוק מה זה עושה
function showScreen(screenId){
    document.querySelectorAll(".screen").forEach(screen => {screen.style.display = screen.id === screenId ? "block" : "none";});
}


function validateRegForm(){
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPass").value;
    const confPass = document.getElementById("passConf").value;
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const errorDiv = document.getElementById("regError").value.trim();
    const passValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
    const firstNameValid = /^[A-Za-z]+$/.test(firstName);
    const lastNameValid = /^[A-Za-z]+$/.test(lastName);
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    if (!username || !password || !confPass || !firstName || !lastName || !email) {
        errorDiv.textContent = "All fields are required!"
        return false;
    }
    if (!passwordValid) {
        errorDiv.textContent = "Password must be at least 8 characters and include letters and numbers!";
        return false;
    }
    if (password !== confirmPassword) {
        errorDiv.textContent = "Passwords do not match!";
        return false;
    }
    if (!firstNameValid) {
    errorDiv.textContent = "First name must contain only letters!";
      return false;
    }
    if (!lastNameValid) {
        errorDiv.textContent = "Last name must contain only letters!";
          return false;
        }
    if (!emailValid) {
        errorDiv.textContent = "Invalid email format!";
        return false;
    }
    users.push({username, password});
    alert("Registration Successful!!!");
    showScreen("welcome");
    return true; //הצאט אומר להחזיר false ???
}


function validateLoginForm(){
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPass").value;
    const errorDiv = document.getElementById("regError").value.trim();
    const user = users.find(user => user.username === username && user.password === password);
    if(!user){
        errorDiv.textContent = "Invalid username or password!";
        return false;
    }
    alert("Login Successful!");
    showScreen("config");
    return true; //הצאט אומר להחזיר false ???
}


function openAbout() {
    document.getElementById("aboutModal").style.display = "block";
}
  

function closeAbout() {
    document.getElementById("aboutModal").style.display = "none";
}


window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeAbout();
    }
});


window.addEventListener("click", (e) => {
    const modal = document.getElementById("aboutModal");
    if (e.target === modal) {
      closeAbout();
    }
  });