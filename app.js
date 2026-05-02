

let currentUser = localStorage.getItem("currentUser");

function loginUser() {
  const username = document.getElementById("usernameInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();

  let users = JSON.parse(localStorage.getItem("users")) || {};

  if (!users[username] || users[username].password !== password) {
    alert("Invalid username or password");
    return;
  }

  currentUser = username;
  localStorage.setItem("currentUser", username);

  document.getElementById("loginPage").style.display = "none";
  document.getElementById("mainApp").style.display = "block";

  // ✅ ADD THIS (missing)
  document.getElementById("navButtons").style.display = "flex";
}
function logoutUser() {
  localStorage.removeItem("currentUser");
  location.reload(); // force clean reload
}
window.onload = () => {
  if (!currentUser) {
    // show login
    document.getElementById("loginPage").style.display = "flex";
    document.getElementById("mainApp").style.display = "none";
  } else {
    // show app
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("mainApp").style.display = "block";

    // ✅ IMPORTANT: show home properly
    document.getElementById("navButtons").style.display = "flex";
    document.getElementById("homeScreen").style.display = "block";
    document.getElementById("quiz").style.display = "none";
    document.getElementById("resultCard").style.display = "none";
    document.getElementById("historyBox").style.display = "none";
  }
};
function signupUser() {
  const username = document.getElementById("usernameInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();

  if (!username || !password) {
    alert("Enter username & password");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || {};

  if (users[username]) {
    alert("User already exists");
    return;
  }

  users[username] = { password };
  localStorage.setItem("users", JSON.stringify(users));

  alert("Signup successful! Now login.");
}

let questions = [];
let currentIndex = 0;
let userAnswers = [];
let timer;
let timeLeft = 60;
let activeTestBtn = null;

const tests = [
  { name: "Mock Test 1", file: "questions/test1.json" },
  { name: "Mock Test 2", file: "questions/test2.json" },
  { name: "Mock Test 3", file: "questions/test3.json" },
  { name: "Mock Test 4", file: "questions/test4.json" },
  { name: "Mock Test 5", file: "questions/test5.json" },
  { name: "Mock Test 6", file: "questions/test6.json" },
  { name: "Mock Test 7", file: "questions/test7.json" },
  { name: "Mock Test 8", file: "questions/test8.json" },
  { name: "Mock Test 9", file: "questions/test9.json" },
  { name: "Mock Test 10", file: "questions/test10.json" },
  { name: "Mock Test 11", file: "questions/test11.json" },
  { name: "Mock Test 12", file: "questions/test12.json" },
  { name: "Mock Test 13", file: "questions/test13.json" },
  { name: "Mock Test 14", file: "questions/test14.json" },
  { name: "Mock Test 15", file: "questions/test15.json" },
  { name: "Mock Test 16", file: "questions/test16.json" },
  { name: "Mock Test 17", file: "questions/test17.json" },
  { name: "Mock Test 18", file: "questions/test18.json" },
  { name: "Mock Test 19", file: "questions/test19.json" },
  { name: "Mock Test 20", file: "questions/test20.json" },
  { name: "Mock Test 21", file: "questions/test21.json" },
  { name: "Mock Test 22", file: "questions/test22.json" }
];

const icons = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12", "T13", "T14", "T15", "T16", "T17", "T18", "T19", "T20", "T21", "T22"];

const testListEl = document.getElementById("testList");
tests.forEach((t, i) => {
  const btn = document.createElement("button");
  btn.className = "test-btn";
  btn.innerHTML = `<span class="test-icon">${i+1}</span>${t.name}`;
  btn.onclick = () => {
    if (activeTestBtn) activeTestBtn.classList.remove("active");
    btn.classList.add("active");
    activeTestBtn = btn;
    loadTest(t.file, btn, i);
  };
  testListEl.appendChild(btn);
});

function showError(msg) {
  document.getElementById("quiz").style.display = "none";
  document.getElementById("resultCard").style.display = "none";
  let errEl = document.getElementById("errorBox");
  if (!errEl) {
    errEl = document.createElement("div");
    errEl.id = "errorBox";
    errEl.style.cssText = `background:#fff3cd;border:1.5px solid #f0b429;border-radius:14px;padding:20px 24px;color:#7c4a00;font-size:0.93rem;margin-top:8px;line-height:1.8;`;
    document.querySelector(".container").appendChild(errEl);
  }
  errEl.innerHTML = msg;
  errEl.style.display = "block";
}

function hideError() {
  const errEl = document.getElementById("errorBox");
  if (errEl) errEl.style.display = "none";
}

function loadTest(file, btn, idx) {
  btn.innerHTML = `<span class="test-icon">...</span>Loading...`;

  fetch(file)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status} – file not found`);
      return res.json();
    })
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) throw new Error("JSON is empty or invalid");
      hideError();
      questions = data;
      currentIndex = 0;
      userAnswers = new Array(questions.length).fill(null);
      document.querySelector(".section-label").style.display = "none";

      document.getElementById("resultCard").style.display = "none";
      // document.getElementById("quiz").style.display = "block";
      document.getElementById("quiz").style.display = "block";
      document.getElementById("testList").style.display = "none";
      btn.innerHTML = `<span class="test-icon">${idx+1}</span>${tests[idx].name}`;
      showQuestion();
    })
    .catch(err => {
      btn.innerHTML = `<span class="test-icon">${idx+1}</span>${tests[idx].name}`;
      btn.classList.remove("active");
      activeTestBtn = null;

      const isLocal = location.protocol === "file:";
      if (isLocal) {
        showError(`
          <strong>⚠️ Browser blocked the file — you need a local server</strong><br><br>
          Browsers cannot load JSON files when you open HTML directly from your computer (file:// protocol).<br><br>
          <strong>Easiest fix — VS Code Live Server:</strong><br>
          1. Open your project folder in <strong>VS Code</strong><br>
          2. Install the <strong>Live Server</strong> extension (by Ritwick Dey)<br>
          3. Right-click <code>index.html</code> → <em>"Open with Live Server"</em><br><br>
          <strong>Or run in terminal:</strong><br>
          <code style="background:#ffe082;padding:2px 6px;border-radius:4px">npx serve .</code>
          &nbsp;then open <strong>http://localhost:3000</strong>
        `);
      } else {
        showError(`<strong>❌ Could not load <code>${file}</code></strong><br>Error: ${err.message}<br>Make sure the <code>questions/</code> folder exists next to <code>index.html</code>.`);
      }
    });
}

function showQuestion() {
  clearInterval(timer);
  timeLeft = 60;

  const q = questions[currentIndex];
  const total = questions.length;

  document.getElementById("progressBar").style.width = (currentIndex / total * 100) + "%";
  document.getElementById("qCounter").textContent = `Question ${currentIndex + 1} of ${total}`;

  const timerPill = document.getElementById("timerPill");
  timerPill.classList.remove("urgent");
  document.getElementById("timerNum").textContent = 60;
  document.getElementById("questionText").textContent = `Q${currentIndex + 1}. ${q.question}`;

  const optionsEl = document.getElementById("optionsList");
  optionsEl.innerHTML = "";
  q.options.forEach(opt => {
    const label = document.createElement("label");
    const isSelected = userAnswers[currentIndex] === opt;
    label.className = "option-label" + (isSelected ? " selected" : "");
    label.innerHTML = `<input type="radio" name="option" value="${opt}" ${isSelected ? "checked" : ""}><span class="radio-dot"></span><span>${opt}</span>`;
    label.querySelector("input").addEventListener("change", () => {
      document.querySelectorAll(".option-label").forEach(l => l.classList.remove("selected"));
      label.classList.add("selected");
    });
    optionsEl.appendChild(label);
  });

  const navEl = document.getElementById("quizNav");
  navEl.innerHTML = currentIndex < questions.length - 1
    ? `<button class="btn btn-primary" onclick="nextQuestion()">Next ></button>`
    : `<button class="btn btn-gold" onclick="submitQuiz()">Submit Test</button>`;

  startTimer();
}

function startTimer() {
  const timerEl = document.getElementById("timerNum");
  const timerPill = document.getElementById("timerPill");
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 15) timerPill.classList.add("urgent");
    if (timeLeft <= 0) { clearInterval(timer); saveAnswer(); autoNext(); }
  }, 1000);
}

function saveAnswer() {
  const sel = document.querySelector('input[name="option"]:checked');
  userAnswers[currentIndex] = sel ? sel.value : null;
}

function autoNext() {
  if (currentIndex < questions.length - 1) { currentIndex++; showQuestion(); }
  else submitQuiz();
}

function nextQuestion() {
  clearInterval(timer); saveAnswer(); currentIndex++; showQuestion();
}

function submitQuiz() {
  clearInterval(timer);
  saveAnswer();

  let correct = 0, wrong = 0, skipped = 0, wrongHTML = "";

  questions.forEach((q, i) => {
    if (userAnswers[i] === null) {
      skipped++;
    } 
    else if (userAnswers[i] === q.answer) {
      correct++;
    } 
    else {
      wrong++;
      wrongHTML += `
        <div class="wrong-item">
          <strong>Q${i+1}.</strong> ${q.question}
          <span class="correct-ans">Correct: ${q.answer}</span>
          <span class="your-ans">Your Answer: ${userAnswers[i]}</span>
        </div>`;
    }
  });

  const score = correct - wrong * 0.25;

  /* ================= SAVE HISTORY (NEW) ================= */
  try {
    const historyKey = `history_${currentUser || "guest"}`;
    let history = JSON.parse(localStorage.getItem(historyKey)) || [];

    history.push({
      test: activeTestBtn ? activeTestBtn.innerText : "Mock Test",
      score: score.toFixed(2),
      correct,
      wrong,
      skipped,
      total: questions.length,
      date: new Date().toLocaleString()
    });

    localStorage.setItem(historyKey, JSON.stringify(history));
  } catch (e) {
    console.warn("History save failed:", e);
  }

  /* ================= SHOW RESULT ================= */
  document.getElementById("quiz").style.display = "none";

  const rc = document.getElementById("resultCard");
  rc.style.display = "block";

  document.getElementById("resCorrect").textContent = correct;
  document.getElementById("resWrong").textContent = wrong;
  document.getElementById("resSkipped").textContent = skipped;
  document.getElementById("resScore").textContent =
    `${score.toFixed(2)} / ${questions.length}`;

  document.getElementById("resultSubtitle").textContent =
    `${correct} correct · ${wrong} wrong · ${skipped} skipped · Negative marking (4:1) applied`;

  document.getElementById("wrongList").innerHTML =
    wrongHTML ||
    `<p style="color:#22c55e;font-weight:600;text-align:center;padding:16px 0">
      No wrong answers — Perfect!
    </p>`;

  rc.scrollIntoView({ behavior: "smooth" });
}
function resetApp() {
  clearInterval(timer);
  questions = []; currentIndex = 0; userAnswers = [];
  document.getElementById("quiz").style.display = "none";
  // document.getElementById("resultCard").style.display = "none";

  document.getElementById("resultCard").style.display = "none";
  document.getElementById("testList").style.display = "grid";
  document.querySelector(".section-label").style.display = "block";

  hideError();
  if (activeTestBtn) { activeTestBtn.classList.remove("active"); activeTestBtn = null; }
  window.scrollTo({ top: 0, behavior: "smooth" });
}


function showHistory() {
  const historyKey = `history_${currentUser}`;
  let history = JSON.parse(localStorage.getItem(historyKey)) || [];

  const box = document.getElementById("historyBox");
  box.style.display = "block";

  if (history.length === 0) {
    box.innerHTML = "<p>No test history found</p>";
    return;
  }

  box.innerHTML = history.map(h => `
    <div style="border-bottom:1px solid #ddd;padding:10px 0;">
      <strong>${h.test}</strong><br>
      Score: ${h.score}<br>
      ✔ ${h.correct} ❌ ${h.wrong} ⏭ ${h.skipped}<br>
      <small>${h.date}</small>
    </div>
  `).join("");
}

function goHome() {
  document.getElementById("quiz").style.display = "none";
  document.getElementById("resultCard").style.display = "none";
  document.getElementById("testList").style.display = "grid";
  document.getElementById("historyBox").style.display = "none";
}
