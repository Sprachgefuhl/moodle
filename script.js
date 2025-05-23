const COWS = getTodaysCows();

// handle new user
if (!localStorage.getItem('moodle-stats')) {
    const stats = {
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
    stats.currentGuess = null;
    updateLocalStorage(stats);
}

const stats = getLocalStorage();

if (!hasUserPlayedToday(stats.lastPlayedTimestamp)) {
    stats.wonToday = false;
    updateLocalStorage(stats);

    typeWriter(`one of them is grumpy, choose wisely. or don't.`, document.getElementById('bio'), 20, 50);
    
    document.querySelector('.game-container').innerHTML = `
        <div class="cow" id="cow-1">
            <span style="font-size: 30px;">1. 🐮</span>
            <h3></h3>
        </div>
        <div class="cow" id="cow-2">
            <span style="font-size: 30px;">2. 🐮</span>
            <h3></h3>
        </div>
        <div class="cow" id="cow-3">
            <span style="font-size: 30px;">3. 🐮</span>
            <h3></h3>
        </div>
        <div class="cow" id="cow-4">
            <span style="font-size: 30px;">4. 🐮</span>
            <h3></h3>
        </div>
        <div class="cow" id="cow-5">
            <span style="font-size: 30px;">5. 🐮</span>
            <h3></h3>
        </div>
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
            cowEl.style.backgroundColor = '#3a3a3a';
        });
    }
} else {
    if (stats.wonToday) {
        renderWin();
    } else {
        renderLoss();
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

function typeWriter(text, element, min, max) {
  let index = 0;
  element.textContent = '';

  function type() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      const randomSpeed = Math.floor(Math.random() * (max - min + 1)) + min;
      setTimeout(type, randomSpeed);
    }
  }

  element.textContent = '';
  type();
}

function renderLoss() {
    // typeWriter(`you were not in tune with the moo. better luck tomorrow. saaargh :)`, document.getElementById('bio'), 30, 50);
}

function renderWin() {
    typeWriter(`You got it! the barn applauds you.`, document.getElementById('bio'), 30, 50);

    document.querySelector('.game-container').innerHTML = `
        <div class="cow" id="">
            <span style="font-size: 30px;">🐮</span>
            <h3></h3>
        </div>
    `;
}

function renderShareStats() {
    
}

let isAudioPlaying = false;
let isAudioMuted = false;
let audio;
document.getElementById('sound').addEventListener('click', () => {
    if (!isAudioPlaying) {
        audio = new Audio('theme.wav');
        audio.loop = true;  
        audio.play();
        isAudioPlaying = true;
    } else {
        if (!isAudioMuted) {
            audio.volume = 0;
            isAudioMuted = true;
        } else {
            audio.volume = 1;
            isAudioMuted = false;
        }
    }
});