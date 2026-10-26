// =========================
// Bingo Simulator v0.1
// Part 1/6
// =========================

const app = {
    settings: {
        maxNumber: 75,
        playerCount: 300,
        winnerLimit: 20,
        cardSize: 5,
        freeCenter: true
    },

    cards: [],
    drawn: [],
    winners: [],
    started: false,
    startTime: null,
    timerId: null
};

const $ = id => document.getElementById(id);

const el = {
    settings: $("settings"),
    game: $("game"),
    start: $("startButton"),
    input: $("numberInput"),
    submit: $("submitNumber"),
    undo: $("undoButton"),
    drawCount: $("drawCount"),
    bingoCount: $("bingoCount"),
    reachCount: $("reachCount"),
    timer: $("timer"),
    drawn: $("drawnNumbers"),
    latest: $("latestBingo")
};

el.start.addEventListener("click", startGame);
el.submit.addEventListener("click", addNumber);

el.input.addEventListener("keydown", e => {
    if (e.key === "Enter") addNumber();
});

el.undo.addEventListener("click", undoLast);

function startGame() {

    app.settings.maxNumber =
        Number($("maxNumber").value);

    app.settings.playerCount =
        Number($("playerCount").value);

    app.settings.winnerLimit =
        Number($("winnerCount").value);

    app.settings.cardSize =
        Number($("cardSize").value);

    app.settings.freeCenter =
        $("freeCenter").checked;

    app.cards = [];

    app.drawn = [];

    app.winners = [];

    app.started = true;

    createCards();

    el.settings.style.display = "none";
    el.game.style.display = "block";

    app.startTime = Date.now();

    app.timerId = setInterval(updateTimer,1000);

    updateDisplay();

    el.input.focus();
}
// =========================
// Part 2/6
// =========================

function createCards() {

    for (let i = 0; i < app.settings.playerCount; i++) {

        const nums = [];

        while (nums.length < 25) {

            const n =
                Math.floor(Math.random() * app.settings.maxNumber) + 1;

            if (!nums.includes(n)) {
                nums.push(n);
            }
        }

        const marks = new Array(25).fill(false);

        if (app.settings.freeCenter) {
            marks[12] = true;
        }

        app.cards.push({
            id: i + 1,
            numbers: nums,
            marks: marks,
            bingo: false,
            reach: false,
            order: 0,
            draw: 0
        });

    }

}

function addNumber() {

    if (!app.started) return;

    const n = Number(el.input.value);

    if (isNaN(n)) {
        alert("数字を入力してください");
        return;
    }

    if (n < 1 || n > app.settings.maxNumber) {
        alert("範囲外です");
        return;
    }

    if (app.drawn.includes(n)) {
        alert("既に入力済みです");
        return;
    }

    app.drawn.push(n);

    markCards(n);

    updateDisplay();

    el.input.value = "";
    el.input.focus();
}

// =========================
// Part 3/6
// =========================

function markCards(number) {

    for (const card of app.cards) {

        if (card.bingo) continue;

        const index = card.numbers.indexOf(number);

        if (index !== -1) {
            card.marks[index] = true;
        }

        const result = checkCard(card);

        if (result.bingo) {

            card.bingo = true;
            card.order = app.winners.length + 1;
            card.draw = app.drawn.length;

            app.winners.push(card);

            el.latest.textContent =
                `${card.order}人目　カードNo.${card.id}　${card.draw}個目の数字でビンゴ！`;

        } else {

            card.reach = result.reach;

        }

    }

}

function checkCard(card) {

    const s = app.settings.cardSize;

    let reach = false;

    // 横
    for (let r = 0; r < s; r++) {

        let count = 0;

        for (let c = 0; c < s; c++) {

            if (card.marks[r * s + c]) {
                count++;
            }

        }

        if (count === s) {
            return {
                bingo: true,
                reach: false
            };
        }

        if (count === s - 1) {
            reach = true;
        }

    }

    // 縦
    for (let c = 0; c < s; c++) {

        let count = 0;

        for (let r = 0; r < s; r++) {

            if (card.marks[r * s + c]) {
                count++;
            }

        }

        if (count === s) {
            return {
                bingo: true,
                reach: false
            };
        }

        if (count === s - 1) {
            reach = true;
        }

    }


 // 左上 → 右下 
    let count = 0;

    for (let i = 0; i < s; i++) {

        if (card.marks[i * s + i]) {
            count++;
        }

    }

    if (count === s) {
        return {
            bingo: true,
            reach: false
        };
    }

    if (count === s - 1) {
        reach = true;
    }

    // 右上 → 左下
    count = 0;

    for (let i = 0; i < s; i++) {

        if (card.marks[i * s + (s - 1 - i)]) {
            count++;
        }

    }

    if (count === s) {
        return {
            bingo: true,
            reach: false
        };
    }

    if (count === s - 1) {
        reach = true;
    }

    return {
        bingo: false,
        reach: reach
    };

}

function undoLast() {

    if (app.drawn.length === 0) {
        return;
    }

    app.drawn.pop();


    app.winners = [];

    for (const card of app.cards) {

        card.bingo = false;
        card.reach = false;
        card.order = 0;
        card.draw = 0;
        card.marks.fill(false);

        if (app.settings.freeCenter) {
            card.marks[12] = true;
        }

    }

    for (const n of app.drawn) {
        markCards(n);
    }

    updateDisplay();
}
// ===== ビンゴ記録 =====

// =========================
// Part 5/6
// =========================

function updateDisplay() {

    el.drawCount.textContent = app.drawn.length;

    el.bingoCount.textContent = app.winners.length;

    let reachCount = 0;

    for (const card of app.cards) {

        if (card.reach && !card.bingo) {
            reachCount++;
        }

    }

    el.reachCount.textContent = reachCount;

    el.drawn.innerHTML = "";

    for (const n of app.drawn) {

        const span = document.createElement("span");

        span.textContent = n;

        span.style.display = "inline-block";
        span.style.margin = "4px";
        span.style.padding = "6px 10px";
        span.style.border = "1px solid #888";
        span.style.borderRadius = "6px";

        el.drawn.appendChild(span);

    }

    if (app.winners.length >= app.settings.winnerLimit) {

        clearInterval(app.timerId);

        alert(
            `${app.settings.winnerLimit}人がビンゴしました！`
        );

    }

const history = document.getElementById("bingoHistory");

if (history) {

    history.innerHTML = "";

    for (const winner of app.winners) {

        const item = document.createElement("div");

        item.className = "historyItem";

        item.innerHTML = `
            <strong>${winner.order}位</strong><br>
            カードNo：${winner.id}<br>
            ${winner.draw}個目の数字でビンゴ
        `;

        history.appendChild(item);

    }

}

}

function updateTimer() {

    if (!app.started) return;

    const sec = Math.floor(
        (Date.now() - app.startTime) / 1000
    );

    const h = String(Math.floor(sec / 3600)).padStart(2, "0");

    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");

    const s = String(sec % 60).padStart(2, "0");

    el.timer.textContent = `${h}:${m}:${s}`;

}
// =========================
// Part 6/6
// =========================

// 初期表示
updateDisplay();

// デバッグ用（F12のコンソールから確認可能）
window.app = app;

// バージョン
console.log("Bingo Simulator v0.1");

// 開始時に最新ビンゴ表示を初期化
el.latest.textContent = "まだビンゴはいません。";