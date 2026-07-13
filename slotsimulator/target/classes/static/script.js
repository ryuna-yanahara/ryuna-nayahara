console.log("Script Loaded: Image Only Version");

// ===============================================
// 画像の設定
// ===============================================

// 画像ファイルへのパス
// ※ src/main/resources/static/images/ フォルダ内のファイル名と一致させてください
const IMAGE_MAP = {
    '7': 'images/7.png?v=2',
    'ベル': 'images/bell.png?v=2',
    'リプ': 'images/replay.png?v=2',
    'チェ': 'images/cherry.png?v=2',
    'スイカ': 'images/suica.png?v=2',
    'BAR': 'images/bar.png?v=2'
};

// ===============================================
// ゲーム定数・変数
// ===============================================

const REEL_STRIPS = {
    left: ['7', 'スイカ', 'リプ', 'ベル', 'チェ', 'BAR', 'リプ', 'ベル', 'スイカ', 'チェ', '7', 'リプ', 'ベル', 'チェ', 'BAR', 'スイカ', 'リプ', 'ベル', 'チェ', 'リプ', 'ベル'],
    center: ['7', 'ベル', 'スイカ', 'リプ', 'チェ', 'BAR', 'ベル', 'スイカ', 'リプ', '7', 'ベル', 'チェ', 'リプ', 'スイカ', 'BAR', 'ベル', 'リプ', 'チェ', 'ベル', 'リプ', 'スイカ'],
    right: ['7', 'チェ', 'ベル', 'スイカ', 'リプ', 'BAR', 'ベル', 'リプ', 'チェ', 'スイカ', '7', 'ベル', 'リプ', 'BAR', 'チェ', 'ベル', 'リプ', 'スイカ', 'ベル', 'リプ', 'チェ']
};
const STRIP_LEN = REEL_STRIPS.left.length;

const ROLES_NORMAL = { REPLAY: { name: 'リプレイ', probability: 1 / 7.3, payout: 0 }, BELL: { name: 'ベル', probability: 1 / 8, payout: 12 }, SUICA: { name: 'スイカ', probability: 1 / 54.6, payout: 1 }, WEAK_CHERRY: { name: '弱チェリー', probability: 1 / 109.2, payout: 1 }, STRONG_CHERRY: { name: '強チェリー', probability: 1 / 163.8, payout: 1 }, CHANCE_ME: { name: 'チャンス目', probability: 1 / 109.2, payout: 1 }, COMMON_BELL: { name: '共通ベル', probability: 1 / 224.4, payout: 12 }, DIRECT_AT: { name: 'ダイレクトAT', probability: 1 / 1024, payout: 0 }, HAZURE: { name: 'ハズレ', probability: 0, payout: 0 } };
const ROLES_AT = { BELL: { name: 'ベル', probability: 1 / 3, payout: 12 }, REPLAY: { name: 'リプレイ', probability: (1 / 7.3) * 0.7, payout: 0 }, SUICA: { name: 'スイカ', probability: (1 / 54.6) * 0.7, payout: 1 }, WEAK_CHERRY: { name: '弱チェリー', probability: (1 / 109.2) * 0.7, payout: 1 }, STRONG_CHERRY: { name: '強チェリー', probability: (1 / 163.8) * 0.7, payout: 1 }, CHANCE_ME: { name: 'チャンス目', probability: (1 / 109.2) * 0.7, payout: 1 }, HAZURE: { name: 'ハズレ', probability: 0, payout: 0 } };
const CZ_PROB = { NORMAL: { WEAK: 0.063, SUICA: 0.004, STRONG: 0.297 }, HIGH: { WEAK: 0.156, SUICA: 0.008, STRONG: 0.563 }, SUPER_HIGH: { WEAK: 0.250, SUICA: 0.070, STRONG: 0.750 } };
const CZ_AT_PROB = { WEAK_SUICA: 0.10, STRONG_CHERRY: 0.25, CHANCE_ME: 0.33, LAST_GAME: 0.33 };
const AT_CONTINUATION_RATES = [{ rate: 0.30, weight: 49 }, { rate: 0.50, weight: 39 }, { rate: 0.70, weight: 9 }, { rate: 0.90, weight: 3 }];
const COST_PER_GAME = 3, MEDALS_PER_1000YEN = 46;

const API_URL = "/api";
let currentUser = null;
let playerMoney = 0, playerMedals = 0, totalDiffMedals = 0, gameCount = 0;
let gameState = 'NORMAL', internalState = 'NORMAL';
let czThroughCount = 0, czGameCount = 0, atGameCount = 0, atContinuationCount = 0;
let isLeverEnabled = true, isReplay = false, penaltyState = false;
let reelIntervals = [null, null, null], currentWinningRole = null, finalStopPositions = [0, 0, 0];
let normalProbabilityTable = [], atProbabilityTable = [];

// HTML要素
const moneyDisplay = document.getElementById('player-money'), medalsDisplay = document.getElementById('player-medals');
const totalDiffDisplay = document.getElementById('total-diff-medals'), gameCountDisplay = document.getElementById('game-count');
const stateDisplay = document.getElementById('game-state'), czThroughDisplay = document.getElementById('cz-through-count');
const messageArea = document.getElementById('message-area'), payoutDisplay = document.getElementById('payout-medals');
const reelElements = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
const insertMoneyButton = document.getElementById('insert-money-button'), insertMoneyAmount = document.getElementById('insert-money-amount');
const leverButton = document.getElementById('lever'), stopButtons = [document.getElementById('stop1'), document.getElementById('stop2'), document.getElementById('stop3')];

// ===============================================
// サーバー通信機能
// ===============================================
async function loginGame() {
    let name = prompt("ユーザー名を入力してください");
    if(!name) name = "Guest"; 
    try {
        messageArea.textContent = "サーバー接続中...";
        const formData = new FormData();
        formData.append('username', name);
        const response = await fetch(`${API_URL}/login`, { method: 'POST', body: formData });
        if(!response.ok) throw new Error("Network error");
        currentUser = await response.json();
        playerMoney = currentUser.money; playerMedals = currentUser.currentMedals || 0; totalDiffMedals = currentUser.totalDiff; gameCount = currentUser.totalGameCount || 0;
        gameState = currentUser.gameState || 'NORMAL'; czThroughCount = currentUser.czThroughCount || 0; atGameCount = currentUser.atGameCount || 0; atContinuationCount = currentUser.atContinuationCount || 0;
        messageArea.textContent = `ようこそ ${currentUser.username} さん！`;
        updateDisplays();
    } catch (e) {
        console.error(e);
        messageArea.textContent = "オフラインモード";
        playerMoney = 10000; updateDisplays();
    }
}

async function saveData() {
    if (!currentUser) return;
    const dataToSave = {
        id: currentUser.id, username: currentUser.username, money: playerMoney, currentMedals: playerMedals,
        totalDiff: totalDiffMedals, totalGameCount: gameCount, gameState: gameState, czThroughCount: czThroughCount,
        atGameCount: atGameCount, atContinuationCount: atContinuationCount
    };
    try {
        await fetch(`${API_URL}/save`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSave) });
    } catch (e) { console.error("Save failed", e); }
}

async function showRanking() {
    try {
        const response = await fetch(`${API_URL}/ranking`);
        const list = await response.json();
        let msg = "🏆 ランキング (総差枚) 🏆\n\n";
        list.forEach((u, index) => { msg += `${index + 1}位: ${u.username} (${u.totalDiff}枚)\n`; });
        alert(msg);
    } catch(e) { alert("ランキング取得失敗"); }
}

// ===============================================
// ロジック部
// ===============================================
function setupProbabilityTable(roles, table) { let cumulativeProbability = 0; table.length = 0; for (const key in roles) { if (key !== 'HAZURE') { cumulativeProbability += roles[key].probability; table.push({ role: roles[key], probability: cumulativeProbability }); } } roles.HAZURE.probability = 1 - cumulativeProbability; table.push({ role: roles.HAZURE, probability: 1.0 }); table.sort((a, b) => a.probability - b.probability); }
function getWinningRole() { const rand = Math.random(); const table = (gameState === 'AT' || gameState === 'SUPER_AT') ? atProbabilityTable : normalProbabilityTable; for (const item of table) { if (rand < item.probability) { return item.role; } } return table[table.length - 1].role; }
function weightedChoice(table) { const totalWeight = table.reduce((sum, item) => sum + item.weight, 0); let rand = Math.random() * totalWeight; for (const item of table) { if (rand < item.weight) { return item; } rand -= item.weight; } }

function analyzeDisplay(positions) {
    const s = { left: REEL_STRIPS.left, center: REEL_STRIPS.center, right: REEL_STRIPS.right };
    const p = { l: positions[0], c: positions[1], r: positions[2] };
    const lines = { top: [s.left[p.l], s.center[p.c], s.right[p.r]], middle: [s.left[(p.l + 1) % STRIP_LEN], s.center[(p.c + 1) % STRIP_LEN], s.right[(p.r + 1) % STRIP_LEN]], bottom: [s.left[(p.l + 2) % STRIP_LEN], s.center[(p.c + 2) % STRIP_LEN], s.right[(p.r + 2) % STRIP_LEN]], diag_br: [s.left[p.l], s.center[(p.c + 1) % STRIP_LEN], s.right[(p.r + 2) % STRIP_LEN]], diag_tr: [s.left[(p.l + 2) % STRIP_LEN], s.center[(p.c + 1) % STRIP_LEN], s.right[p.r]] };
    let role = ROLES_NORMAL.HAZURE;
    if (lines.bottom[0] === 'チェ') { role = lines.middle[2] === 'リプ' ? ROLES_NORMAL.WEAK_CHERRY : ROLES_NORMAL.STRONG_CHERRY; } 
    else if (lines.diag_br.every(sym => sym === 'スイカ')) { role = ROLES_NORMAL.SUICA; } 
    else if ((lines.top[0] === 'スイカ' && lines.middle[1] === 'スイカ' && lines.middle[2] === 'スイカ') || (lines.top[0] === 'ベル' && lines.middle[1] === 'ベル' && lines.top[2] === 'ベル')) { role = ROLES_NORMAL.CHANCE_ME; } 
    else { for (const line of [lines.top, lines.middle, lines.bottom]) { if (line.every(sym => sym === 'ベル')) { role = ROLES_NORMAL.BELL; break; } if (line.every(sym => sym === 'リプ')) { role = ROLES_NORMAL.REPLAY; break; } } }
    const violations = [];
    if (lines.top[0] === 'スイカ' && role.name !== 'スイカ' && role.name !== 'チャンス目') violations.push('INVALID_SUICA_TOP_LEFT');
    const forbiddenSymbols = ['スイカ', 'チェ', 'BAR'];
    for (const line of Object.values(lines)) { if (line.every(sym => sym === line[0]) && forbiddenSymbols.includes(line[0])) { if (line[0] === 'スイカ' && line !== lines.diag_br) violations.push('INVALID_SUICA_ALIGN'); if (line[0] === 'チェ' || line[0] === 'BAR') violations.push(`INVALID_ALIGN_${line[0]}`); } }
    return { role, violations };
}

function onLeverDown() {
    if (!isLeverEnabled) return;
    if (!isReplay && playerMedals < COST_PER_GAME) { messageArea.textContent = "メダルが足りません"; return; }
    isLeverEnabled = false; penaltyState = false; payoutDisplay.textContent = 0;
    if (!isReplay) { playerMedals -= COST_PER_GAME; totalDiffMedals -= COST_PER_GAME; }
    isReplay = false; gameCount++; updateDisplays();
    currentWinningRole = getWinningRole();
    let foundMatch = false, attempts = 0;
    while (!foundMatch && attempts < 3000) {
        const candidatePositions = [Math.floor(Math.random() * STRIP_LEN), Math.floor(Math.random() * STRIP_LEN), Math.floor(Math.random() * STRIP_LEN)];
        const analysis = analyzeDisplay(candidatePositions);
        if (analysis.role.name === currentWinningRole.name && analysis.violations.length === 0) { finalStopPositions = candidatePositions; foundMatch = true; } attempts++;
    }
    if (!foundMatch) { finalStopPositions = { 'ハズレ': [0, 5, 10], 'ベル': [2, 0, 1], 'リプレイ': [1, 2, 3], 'スイカ': [0, 1, 2], '弱チェリー': [3, 10, 3], '強チェリー': [3, 10, 4], 'チャンス目': [1, 8, 15] }[currentWinningRole.name] || [0, 5, 10]; }
    startSpinning();
    messageArea.textContent = "リールを止めてください";
    stopButtons.forEach(btn => btn.disabled = false);
    saveData();
}

let stoppedReelCount = 0;
function stopReel(index) {
    if (index !== stoppedReelCount && !penaltyState) { penaltyState = true; messageArea.textContent = "警告！順押ししてください！"; }
    clearInterval(reelIntervals[index]);
    setReelSymbols(index, finalStopPositions[index]);
    stopButtons[index].disabled = true;
    stoppedReelCount++;
    if (stoppedReelCount === 3) {
        stoppedReelCount = 0;
        const finalRole = penaltyState ? ROLES_NORMAL.HAZURE : currentWinningRole;
        if (penaltyState) { let hazurePos = [0, 5, 10]; for(let i=0; i<3; i++) setReelSymbols(i, hazurePos[i]); }
        setTimeout(() => processGameResult(finalRole), 500);
    }
}

function startSpinning() { let positions = [0, 0, 0]; for (let i = 0; i < 3; i++) { reelIntervals[i] = setInterval(() => { positions[i] = (positions[i] + 1) % STRIP_LEN; setReelSymbols(i, positions[i]); }, 50); } }

// ★画像を表示するための処理
function setReelSymbols(reelIndex, position) {
    const strip = [REEL_STRIPS.left, REEL_STRIPS.center, REEL_STRIPS.right][reelIndex];
    const stripLen = strip.length;
    const images = reelElements[reelIndex].querySelectorAll('.sym-img');
    
    // IMAGE_MAPを使って文字を画像パスに変換
    if (images.length > 0) {
        images[0].src = IMAGE_MAP[strip[position % stripLen]];
        images[1].src = IMAGE_MAP[strip[(position + 1) % stripLen]];
        images[2].src = IMAGE_MAP[strip[(position + 2) % stripLen]];
    }
}

function processGameResult(winningRole) {
    if (penaltyState) winningRole = ROLES_NORMAL.HAZURE;
    let payout = winningRole.payout;
    if (winningRole.name === 'ハズレ') messageArea.textContent = "ハズレ";
    else if (winningRole.name === 'リプレイ') { isReplay = true; messageArea.textContent = "リプレイ！"; }
    else { messageArea.textContent = `${winningRole.name}成立！ ${payout}枚`; }
    
    playerMedals += payout; totalDiffMedals += payout; payoutDisplay.textContent = payout;
    
    switch (gameState) {
        case 'NORMAL': case 'HIGH': case 'SUPER_HIGH': handleNormalState(winningRole); break;
        case 'CZ': handleCzState(winningRole); break;
        case 'AT': case 'SUPER_AT': handleAtState(winningRole); break;
    }
    isLeverEnabled = true; updateDisplays();
}

function handleNormalState(role) {
    if(role === ROLES_NORMAL.DIRECT_AT) { messageArea.textContent = "直撃AT！！"; startAT(); return; }
    const isWeak = ['弱チェリー','スイカ'].includes(role.name), isStrong = ['強チェリー','チャンス目'].includes(role.name);
    if (isWeak || isStrong) {
        const p = CZ_PROB[internalState];
        let prob = isStrong ? p.STRONG : (role.name === 'スイカ' ? p.SUICA : p.WEAK);
        if (Math.random() < prob) startCZ();
    }
}
function handleCzState(role) {
    czGameCount--; messageArea.textContent = `${role.name}！ 残${czGameCount}G`;
    let hit = false;
    if (['弱チェリー','スイカ'].includes(role.name) && Math.random() < CZ_AT_PROB.WEAK_SUICA) hit = true;
    if (role.name === '強チェリー' && Math.random() < CZ_AT_PROB.STRONG_CHERRY) hit = true;
    if (role.name === 'チャンス目' && Math.random() < CZ_AT_PROB.CHANCE_ME) hit = true;
    if(hit) { startAT(); return; }
    if(czGameCount <= 0) {
        if (Math.random() < CZ_AT_PROB.LAST_GAME) startAT();
        else { messageArea.textContent = "CZ終了..."; gameState = 'NORMAL'; czThroughCount++; }
    }
}
function handleAtState(role) {
    atGameCount--;
    if (atGameCount <= 0) {
        if (Math.random() < weightedChoice(AT_CONTINUATION_RATES).rate) {
            atContinuationCount++; atGameCount = 20; messageArea.textContent = `継続！ ${atContinuationCount+1}連目`;
        } else {
             messageArea.textContent = "AT終了..."; gameState = 'NORMAL'; atContinuationCount = 0;
        }
    }
}
function startCZ() { if(czThroughCount >=4){ startAT(); return; } gameState = 'CZ'; czGameCount = 5; messageArea.textContent = "CZ突入！"; }
function startAT() { gameState = 'AT'; atGameCount = 20; atContinuationCount = 0; czThroughCount = 0; messageArea.textContent = "AT開始！"; }

function updateDisplays() {
    moneyDisplay.textContent = playerMoney; if(playerMoney < 0) moneyDisplay.style.color = "red";
    medalsDisplay.textContent = playerMedals; totalDiffDisplay.textContent = totalDiffMedals; gameCountDisplay.textContent = gameCount;
    stateDisplay.textContent = `${gameState} ${gameState.includes('AT') ? `残${atGameCount}G` : ''}`; czThroughDisplay.textContent = czThroughCount;
}

insertMoneyButton.addEventListener('click', () => {
    const amount = parseInt(insertMoneyAmount.value, 10);
    if (amount > 0) {
        playerMoney -= amount; playerMedals += Math.floor(amount / 1000) * MEDALS_PER_1000YEN;
        updateDisplays(); if(playerMoney < 0) messageArea.textContent = "借金生活..."; saveData();
    }
});
leverButton.addEventListener('click', onLeverDown);
stopButtons.forEach((btn, index) => { btn.onclick = () => stopReel(index); });
document.getElementById('ranking-button').addEventListener('click', showRanking);
document.getElementById('save-quit-button').addEventListener('click', async () => { await saveData(); alert("保存しました。"); location.reload(); });

function init() {
    setupProbabilityTable(ROLES_NORMAL, normalProbabilityTable); setupProbabilityTable(ROLES_AT, atProbabilityTable);
    loginGame();
    // 最初の表示を画像にするために一度セット
    setTimeout(() => { for (let i = 0; i < 3; i++) setReelSymbols(i, 0); }, 100);
}
init();