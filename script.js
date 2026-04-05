const setupEl = document.getElementById("setup");
const gameEl = document.getElementById("game");
const committeeEl = document.getElementById("committee");
const doneEl = document.getElementById("done");

const playerCountInput = document.getElementById("playerCount");
const setupInfo = document.getElementById("setupInfo");
const startBtn = document.getElementById("startBtn");

const turnTitle = document.getElementById("turnTitle");
const turnHint = document.getElementById("turnHint");
const roleCard = document.getElementById("roleCard");
const roleText = document.getElementById("roleText");

const committeeTitle = document.getElementById("committeeTitle");
const committeeSize = document.getElementById("committeeSize");
const committeeHint = document.getElementById("committeeHint");
const roundVoteSummary = document.getElementById("roundVoteSummary");
const goodScore = document.getElementById("goodScore");
const badScore = document.getElementById("badScore");
const voteCard = document.getElementById("voteCard");
const voteText = document.getElementById("voteText");
const voteActions = document.getElementById("voteActions");
const successBtn = document.getElementById("successBtn");
const failureBtn = document.getElementById("failureBtn");
const nextRoundBtn = document.getElementById("nextRoundBtn");

const doneTitle = document.getElementById("doneTitle");
const doneText = document.getElementById("doneText");
const doneGoodScore = document.getElementById("doneGoodScore");
const doneBadScore = document.getElementById("doneBadScore");
const restartBtn = document.getElementById("restartBtn");

let roles = [];
let currentPlayer = 0;
let isRoleRevealed = false;
let playerCount = 10;

let committeeSizes = [];
let currentRound = 0;
let currentVoteMember = 0;
let failureVotes = 0;
let lastRoundSuccessVotes = 0;
let lastRoundFailureVotes = 0;
let goodWins = 0;
let badWins = 0;
let votingOpen = false;

function getEvilCount(totalPlayers) {
  const evilByPlayerCount = {
    3: 1,
    4: 1,
    5: 2,
    6: 2,
    7: 3,
    8: 3,
    9: 3,
    10: 4
  };

  return evilByPlayerCount[totalPlayers] || 4;
}

function getCommitteeSizes(totalPlayers) {
  const committeeByPlayerCount = {
    3: [2, 2, 2, 2, 3],
    4: [2, 2, 3, 3, 3],
    5: [2, 3, 2, 3, 3],
    6: [2, 3, 4, 3, 4],
    7: [2, 3, 3, 4, 4],
    8: [3, 4, 4, 5, 5],
    9: [3, 4, 4, 5, 5],
    10: [3, 4, 4, 5, 5]
  };

  return committeeByPlayerCount[totalPlayers] || committeeByPlayerCount[10];
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildRoles(playerCount) {
  const evilCount = getEvilCount(playerCount);
  const goodCount = playerCount - evilCount;

  const goodRoles = [];
  if (goodCount >= 1) goodRoles.push("Merlin");
  if (goodCount >= 2) goodRoles.push("Percival");
  while (goodRoles.length < goodCount) goodRoles.push("Loyal Servant of Arthur");

  const evilRoles = ["Morgana"];
  while (evilRoles.length < evilCount) evilRoles.push("Minion of Mordred");

  return shuffle([...goodRoles, ...evilRoles]);
}

function showSetupBreakdown(playerCount) {
  const evilCount = getEvilCount(playerCount);
  const goodCount = playerCount - evilCount;
  setupInfo.textContent = `${goodCount} good, ${evilCount} bad (includes Merlin, Percival, and Morgana when possible).`;
}

function resetRoleCard() {
  roleCard.className = "role-card role-hidden";
  roleText.textContent = "Role is hidden.";
  isRoleRevealed = false;
}

function renderTurn() {
  if (currentPlayer >= roles.length) {
    gameEl.classList.add("hidden");
    startCommitteePhase();
    return;
  }

  turnTitle.textContent = `Player ${currentPlayer + 1}`;
  turnHint.textContent = "Make sure only this player is looking. Tap card to reveal, tap again to pass.";
  resetRoleCard();
}

function resetVoteCard() {
  voteCard.className = "role-card role-hidden";
  voteText.textContent = "Vote is hidden. Tap to begin this member's vote.";
  voteActions.classList.add("hidden");
  votingOpen = false;
}

function renderCommitteeRound() {
  const committeeMemberCount = committeeSizes[currentRound];

  committeeTitle.textContent = `Committee Round ${currentRound + 1} of ${committeeSizes.length}`;
  committeeSize.textContent = `This committee has ${committeeMemberCount} members.`;
  committeeHint.textContent = `Committee member ${currentVoteMember + 1} of ${committeeMemberCount}: tap the vote card, then choose Success or Failure privately.`;
  goodScore.textContent = String(goodWins);
  badScore.textContent = String(badWins);
  roundVoteSummary.innerHTML = "";
  roundVoteSummary.classList.remove("round-win-good", "round-win-bad");
  roundVoteSummary.classList.add("hidden");
  nextRoundBtn.classList.add("hidden");
  resetVoteCard();
}

function startCommitteePhase() {
  committeeSizes = getCommitteeSizes(playerCount);
  currentRound = 0;
  currentVoteMember = 0;
  failureVotes = 0;
  lastRoundSuccessVotes = 0;
  lastRoundFailureVotes = 0;
  goodWins = 0;
  badWins = 0;

  committeeEl.classList.remove("hidden");
  doneEl.classList.add("hidden");
  renderCommitteeRound();
}

function finishGame() {
  committeeEl.classList.add("hidden");
  doneEl.classList.remove("hidden");

  const goodWonGame = goodWins > badWins;
  const winnerName = goodWonGame ? "Loyal Servant of Arthur" : "Minion of Mordred";

  doneTitle.textContent = `${winnerName} wins the game!`;
  doneText.textContent = `Final score: Loyal Servant of Arthur ${goodWins} - ${badWins} Minion of Mordred. Last committee votes: Success ${lastRoundSuccessVotes}, Failure ${lastRoundFailureVotes}.`;
  doneGoodScore.textContent = String(goodWins);
  doneBadScore.textContent = String(badWins);
}

function resolveRound() {
  const committeeMemberCount = committeeSizes[currentRound];
  const successVotes = committeeMemberCount - failureVotes;
  const goodWonRound = failureVotes === 0;

  lastRoundSuccessVotes = successVotes;
  lastRoundFailureVotes = failureVotes;

  roundVoteSummary.classList.remove("round-win-good", "round-win-bad");
  roundVoteSummary.classList.add(goodWonRound ? "round-win-good" : "round-win-bad");
  roundVoteSummary.innerHTML = `
    <span class="vote-summary-label">Round Votes</span>
    <span class="vote-pill vote-pill-success">Success ${successVotes}</span>
    <span class="vote-pill vote-pill-failure">Failure ${failureVotes}</span>
  `;
  roundVoteSummary.classList.remove("hidden");

  if (goodWonRound) {
    goodWins += 1;
    committeeHint.textContent = "Round result: Loyal Servant of Arthur wins this committee round.";
  } else {
    badWins += 1;
    committeeHint.textContent = "Round result: Minion of Mordred wins this committee round.";
  }

  goodScore.textContent = String(goodWins);
  badScore.textContent = String(badWins);
  voteActions.classList.add("hidden");
  voteCard.className = "role-card role-hidden";
  voteText.textContent = "Round complete.";

  if (goodWins >= 3 || badWins >= 3) {
    finishGame();
    return;
  }

  if (currentRound >= committeeSizes.length - 1) {
    finishGame();
    return;
  }

  nextRoundBtn.textContent = "Next Committee Round";
  nextRoundBtn.classList.remove("hidden");
}

function recordVote(isFailure) {
  if (isFailure) {
    failureVotes += 1;
  }

  const committeeMemberCount = committeeSizes[currentRound];

  if (currentVoteMember >= committeeMemberCount - 1) {
    resolveRound();
    return;
  }

  currentVoteMember += 1;
  committeeHint.textContent = `Vote recorded anonymously. Pass to committee member ${currentVoteMember + 1} of ${committeeMemberCount}.`;
  resetVoteCard();
}

startBtn.addEventListener("click", () => {
  playerCount = Number(playerCountInput.value);

  if (!Number.isInteger(playerCount) || playerCount < 3 || playerCount > 10) {
    setupInfo.textContent = "Please enter a whole number from 3 to 10.";
    return;
  }

  roles = buildRoles(playerCount);
  currentPlayer = 0;

  setupEl.classList.add("hidden");
  committeeEl.classList.add("hidden");
  doneEl.classList.add("hidden");
  gameEl.classList.remove("hidden");

  renderTurn();
});

roleCard.addEventListener("click", () => {
  if (gameEl.classList.contains("hidden") || currentPlayer >= roles.length) {
    return;
  }

  if (!isRoleRevealed) {
    const role = roles[currentPlayer];
    const isBad = role === "Morgana" || role === "Minion of Mordred";

    roleText.textContent = role;
    roleCard.className = `role-card ${isBad ? "role-bad" : "role-good"}`;
    isRoleRevealed = true;
    return;
  }

  currentPlayer += 1;
  renderTurn();
});

voteCard.addEventListener("click", () => {
  if (committeeEl.classList.contains("hidden") || nextRoundBtn.classList.contains("hidden") === false) {
    return;
  }

  if (votingOpen) {
    return;
  }

  const committeeMemberCount = committeeSizes[currentRound];
  voteCard.className = "role-card role-good";
  voteText.textContent = `Committee member ${currentVoteMember + 1} of ${committeeMemberCount}: choose your vote.`;
  voteActions.classList.remove("hidden");
  votingOpen = true;
});

successBtn.addEventListener("click", () => {
  recordVote(false);
});

failureBtn.addEventListener("click", () => {
  recordVote(true);
});

nextRoundBtn.addEventListener("click", () => {
  currentRound += 1;
  currentVoteMember = 0;
  failureVotes = 0;
  renderCommitteeRound();
});

restartBtn.addEventListener("click", () => {
  setupEl.classList.remove("hidden");
  committeeEl.classList.add("hidden");
  doneEl.classList.add("hidden");
  gameEl.classList.add("hidden");
});

playerCountInput.addEventListener("input", () => {
  const playerCount = Number(playerCountInput.value);
  if (Number.isInteger(playerCount) && playerCount >= 3 && playerCount <= 10) {
    showSetupBreakdown(playerCount);
  } else {
    setupInfo.textContent = "Please enter a whole number from 3 to 10.";
  }
});

showSetupBreakdown(Number(playerCountInput.value));
