// Create new round
function createRound() {
    let name = document.getElementById("roundName").value || "Round";
    let price = Number(document.getElementById("ticketPrice").value);

    if (!price) {
        alert("Enter a ticket price!");
        return;
    }

    let lottery = {
        roundName: name,
        ticketPrice: price,
        status: "not_started",
        tickets: [],
        winningNumber: null,
        winners: []
    };

    localStorage.setItem("lottery", JSON.stringify(lottery));

    alert("New Round Created!");
}


// Start the lottery
function startLottery() {
    let lottery = getLottery();
    lottery.status = "open";
    
    save(lottery);
    alert("Lottery Started!");
}


// Stop lottery (no more selling)
function stopLottery() {
    let lottery = getLottery();
    lottery.status = "closed";
    
    save(lottery);
    alert("Lottery Stopped!");
}


// Set winning number
function setWinningNumber() {
    let number = Number(document.getElementById("winningNumber").value);
    let lottery = getLottery();

    if (isNaN(number)) {
        alert("Enter a number!");
        return;
    }

    lottery.winningNumber = number;

    // Find winners
    lottery.winners = lottery.tickets.filter(t => t.number == number);

    save(lottery);

    document.getElementById("winnerText").innerText =
        "Winning Number: " + number + 
        " | Winners: " + lottery.winners.length;

    alert("Winner Declared!");
}


// View buyers
function viewBuyers() {
    let lottery = getLottery();
    document.getElementById("buyerList").textContent =
        JSON.stringify(lottery.tickets, null, 4);
}


// View winners
function viewWinners() {
    let lottery = getLottery();
    document.getElementById("winnerList").textContent =
        JSON.stringify(lottery.winners, null, 4);
}


// Helper: load lottery
function getLottery() {
    return JSON.parse(localStorage.getItem("lottery")) || {};
}

// Helper: save lottery
function save(data) {
    localStorage.setItem("lottery", JSON.stringify(data));
}

// Set countdown end time (from admin datetime-local input)
function setCountdown() {
    const input = document.getElementById('countdownAt');
    if (!input || !input.value) {
        alert('Choose a date and time first');
        return;
    }

    const dt = new Date(input.value);
    if (isNaN(dt.getTime())) {
        alert('Invalid date/time');
        return;
    }

    const lottery = getLottery();
    lottery.countdownEnd = dt.getTime();
    save(lottery);
    alert('Live time set for: ' + dt.toString());
    showCountdownInfo();
}

function clearCountdown() {
    const lottery = getLottery();
    delete lottery.countdownEnd;
    delete lottery.countdownSeconds;
    save(lottery);
    alert('Live time cleared');
    showCountdownInfo();
}

function showCountdownInfo() {
    const info = document.getElementById('countdownInfo');
    const input = document.getElementById('countdownAt');
    const lottery = getLottery();
    if (!info) return;
    if (lottery.countdownEnd) {
        const dt = new Date(Number(lottery.countdownEnd));
        info.innerText = 'Configured live time: ' + dt.toString();
        if (input) {
            // set input to the configured value in local time (datetime-local expects yyyy-mm-ddThh:mm)
            const pad = (n) => n.toString().padStart(2, '0');
            const yyyy = dt.getFullYear();
            const mm = pad(dt.getMonth()+1);
            const dd = pad(dt.getDate());
            const hh = pad(dt.getHours());
            const min = pad(dt.getMinutes());
            input.value = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
        }
    } else if (lottery.countdownSeconds) {
        info.innerText = 'Configured countdown (seconds): ' + lottery.countdownSeconds;
    } else {
        info.innerText = 'No live time configured.';
        if (input) input.value = '';
    }
}

// show existing countdown info on load
document.addEventListener('DOMContentLoaded', () => {
    showCountdownInfo();
});

// Reset any existing draw/winner (admin control)
function resetDraw() {
    try {
        localStorage.removeItem('liveWinner');
        // also broadcast the reset so any open live pages can react
        localStorage.setItem('liveWinnerReset', JSON.stringify({ k: Math.random(), t: Date.now() }));
        alert('Draw reset — winner cleared.');
    } catch (e) {
        alert('Failed to reset draw: ' + e);
    }
}
