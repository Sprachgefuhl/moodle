const COWS = getTodaysCows();

// handle new user
if (!localStorage.getItem('moodle-stats')) {
    const stats = {
        finalGuess: null,
        currentStreak: 0,
        maxStreak: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        currentGuess: null,
        wonToday: false,
        lastPlayedTimestamp: null,
    }
    
    updateLocalStorage(stats);
    // localStorage.setItem('moodle-stats', JSON.stringify(stats));
} else {
    // reset current guess on load
    const stats = getLocalStorage();
    // stats.finalGuess = null;
    stats.currentGuess = null;
    updateLocalStorage(stats);
}

const stats = getLocalStorage();

if (!hasUserPlayedToday(stats.lastPlayedTimestamp)) {
    stats.wonToday = false;
    updateLocalStorage(stats);

    typeWriter(`One of them is grumpy, choose wisely. Or don't.`, document.getElementById('bio'), 20, 50);
    
    document.querySelector('.game-container').innerHTML = `
        <div class="cow" id="cow-1">
            <span>#1 🐄</span>
            <h3 style="color: #B0CDD4"></h3>
        </div>
        <div class="cow" id="cow-2">
            <span>#2 🐄</span>
            <h3 style="color: #FFECD6"></h3>
        </div>
        <div class="cow" id="cow-3">
            <span>#3 🐄</span>
            <h3 style="color: #A88C89"></h3>
        </div>
        <div class="cow" id="cow-4">
            <span>#4 🐄</span>
            <h3 style="color: #EDD6AD"></h3>
        </div>
        <div class="cow" id="cow-5">
            <span>#5 🐄</span>
            <h3 style="color: #B0CDD4"></h3>
        </div>
    `;

    document.querySelector('.bottom-container').innerHTML = `
        <i id="mute" class="fa-solid fa-volume-xmark"></i>
        <button id="guess-btn">Guess</button>
    `;

    const cowEls = document.querySelectorAll('.cow');
    for (let i = 0; i < cowEls.length; i++) {
        const cowEl = cowEls[i];
        COWS.then(COWS => {
            cowEl.children[1].innerText = COWS[i].moo;
        })

        cowEl.addEventListener('click', () => {
            stats.currentGuess = i + 1;
            updateLocalStorage(stats);

            cowEls.forEach(el => { el.style.backgroundColor = '#121213' }); // reset background colours
            cowEl.style.backgroundColor = '#272727';
        });
    }
} else {
    if (stats.wonToday) {
        renderWin();
        renderShareStats();
    } else {
        renderLoss();
        renderShareStats();
    }
}

document.getElementById('guess-btn').addEventListener('click', () => {
    // if no cow selected
    if (!stats.currentGuess) {
        typeWriter(`must select a cow.`, document.getElementById('bio'), 30, 50);
        return;
    }

    const guess = stats.currentGuess;
    COWS.then(cows => {
        const grumpyCow = cows.find(cow => cow.isGrumpy).id;
        if (guess == grumpyCow) {
            stats.gamesPlayed++;
            stats.lastPlayedTimestamp = new Date().getTime();
            stats.wonToday = true;
            stats.gamesWon++;
            stats.currentStreak++;
            // TODO: check if max streak is beaten
            if (stats.currentStreak > stats.maxStreak) {
                stats.maxStreak++;
            }

            updateLocalStorage(stats);

            // typeWriter(`you got it! the pasture underestimated you!`, document.getElementById('bio'), 30, 50);
            location.reload();
        } else {
            stats.finalGuess = guess;
            stats.gamesPlayed++;
            stats.lastPlayedTimestamp = new Date().getTime();
            stats.wonToday = false;
            stats.currentStreak = 0;

            updateLocalStorage(stats);

            location.reload();
            // typeWriter(`you were not in tune with the moo. better luck tomorrow. saaargh :)`, document.getElementById('bio'), 30, 50);
        }
    });
});

async function getTodaysCows() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;

    const response = await fetch('db.json')
    const posts = await response.json();   
    const COWS = posts.find(col => col.date == day && col.month == month).cows;

    return COWS;
}

function getLocalStorage() {
    const stats = JSON.parse(localStorage.getItem('moodle-stats'));
    return stats;
}

function updateLocalStorage(updatedObj) {
    localStorage.setItem('moodle-stats', JSON.stringify(updatedObj));
}

function hasUserPlayedToday(lastPlayedTimestamp) {
    if (lastPlayedTimestamp == null) return false;
    
    // get current time
    const date = new Date();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1;

    // last played time
    const lastDate = new Date(lastPlayedTimestamp);
    const lastDayOfMonth = lastDate.getDate();
    const lastMonth = lastDate.getMonth() + 1;

    if (dayOfMonth == lastDayOfMonth && month == lastMonth) return true;
    else return false;
}

function typeWriter(text, element, min, max, colour) {
  let index = 0;
  element.textContent = '';

  function type() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      element.style.color = colour;
      index++;
      const randomSpeed = Math.floor(Math.random() * (max - min + 1)) + min;
      setTimeout(type, randomSpeed);
    }
  }

  element.textContent = '';
  type();
}

function renderLoss() {
    typeWriter(`❌ You are not in tune with the moo. Better luck tomorrow.`, document.getElementById('bio'), 30, 50, '#E1AF87');
    
    const stats = getLocalStorage();
    COWS.then(cows => {
        const cowGuess = cows.find(cow => cow.id == stats.finalGuess);
        document.querySelector('.game-container').innerHTML = `
        <div class="cow" style="background-color: #272727;">
            <span style="font-size: 30px;">#${cowGuess.id} 🐄😄</span>
            <h3 style="font-style: italic;">${cowGuess.moo}</h3>
            <p style="color: #B0CDD4;">${cowGuess.mood}</p>
            <p style="">"${cowGuess.story}"</p>
        </div>
    `;
    });
}

function renderWin() {
    typeWriter(`✅ You found grumpy pants! Come back tomorrow to keep this streak alive.`, document.getElementById('bio'), 30, 40, '#E1AF87');

    COWS.then(cows => {
        const grumpyCow = cows.find(cow => cow.isGrumpy);
        document.querySelector('.game-container').innerHTML = `
        <div class="cow" style="background-color: #272727;">
            <span style="font-size: 30px;">#${grumpyCow.id} 🐄😠</span>
            <h3 style="font-style: italic;">${grumpyCow.moo}</h3>
            <p style="color: #B0CDD4;">${grumpyCow.mood}</p>
            <p style="">"${grumpyCow.story}"</p>
        </div>
    `;
    });
}

function renderShareStats() {
    document.querySelector('.bottom-container').innerHTML = `
        <div>
            <label for="share">Share</label>
            <i class="fa-solid fa-share" id="share"></i>

            <label for="stats">Stats</label>
            <i class="fa-solid fa-chart-simple" id="stats"></i>
        </div>
    `;

    const date = new Date();

    document.getElementById('share').addEventListener('click', () => {
        if (stats.wonToday) {
            navigator.clipboard.writeText(
`🐮 Moodle ${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ✅
https://sprachgefuhl.github.io/moodle/`);
        } else {
            navigator.clipboard.writeText(
`🐮 Moodle ${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ❌
https://sprachgefuhl.github.io/moodle/`);
        }
        document.getElementById('share').className = 'fa-solid fa-check';
    });
}

let isAudioPlaying = false;
let isAudioMuted = false;
let audio;
document.getElementById('mute').addEventListener('click', () => {
    if (!isAudioPlaying) {
        audio = new Audio('theme.wav');
        audio.loop = true;  
        audio.play();
        isAudioPlaying = true;
        document.getElementById('mute').className = 'fa-solid fa-volume-high';
    } else {
        if (!isAudioMuted) {
            audio.volume = 0;
            isAudioMuted = true;
            document.getElementById('mute').className = 'fa-solid fa-volume-xmark';
        } else {
            audio.volume = 1;
            isAudioMuted = false;
            document.getElementById('mute').className = 'fa-solid fa-volume-high';
        }
    }
});