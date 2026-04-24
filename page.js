// ============== CONFETTI ==============
const confettiCanvas = document.getElementById('confetti');
const cctx = confettiCanvas.getContext('2d');
let particles = [];
let confettiRunning = false;

function sizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
sizeCanvas();
window.addEventListener('resize', sizeCanvas);

const confettiColors = ['#3ea66a', '#27804f', '#c8e6a0', '#f2f5ee', '#8ec26a', '#1a6b42'];

function burstConfetti(x, y, count = 120) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 1) * 14 - 4,
      g: 0.35 + Math.random() * 0.15,
      size: 6 + Math.random() * 6,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      life: 1,
      shape: Math.random() < 0.5 ? 'rect' : 'circle'
    });
  }
  if (!confettiRunning) loopConfetti();
}

function loopConfetti() {
  confettiRunning = true;
  cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  particles.forEach(p => {
    p.vy += p.g;
    p.vx *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 0.005;
    cctx.save();
    cctx.globalAlpha = Math.max(0, p.life);
    cctx.translate(p.x, p.y);
    cctx.rotate(p.rot);
    cctx.fillStyle = p.color;
    if (p.shape === 'rect') {
      cctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else {
      cctx.beginPath();
      cctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      cctx.fill();
    }
    cctx.restore();
  });
  particles = particles.filter(p => p.life > 0 && p.y < confettiCanvas.height + 50);
  if (particles.length > 0) {
    requestAnimationFrame(loopConfetti);
  } else {
    confettiRunning = false;
    cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

document.getElementById('confettiBtn').addEventListener('click', (e) => {
  const rect = e.target.getBoundingClientRect();
  burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 180);
  // Side blasts
  setTimeout(() => burstConfetti(50, window.innerHeight * 0.6, 80), 120);
  setTimeout(() => burstConfetti(window.innerWidth - 50, window.innerHeight * 0.6, 80), 240);
});

// ============== BALLOONS ==============
const balloonColors = ['#3ea66a', '#27804f', '#c8e6a0', '#8ec26a'];
const balloonContainer = document.getElementById('balloons');
function spawnBalloon() {
  const b = document.createElement('div');
  b.className = 'balloon';
  const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
  b.style.background = `radial-gradient(circle at 30% 30%, ${color}dd, ${color})`;
  b.style.color = color;
  b.style.left = Math.random() * 100 + '%';
  b.style.bottom = '-80px';
  b.style.position = 'fixed';
  b.style.animationDuration = (14 + Math.random() * 10) + 's';
  b.style.zIndex = 1;
  b.style.opacity = 0.6 + Math.random() * 0.3;
  const scale = 0.7 + Math.random() * 0.6;
  b.style.transform = `scale(${scale})`;
  balloonContainer.appendChild(b);
  setTimeout(() => b.remove(), 25000);
}
for (let i = 0; i < 10; i++) setTimeout(spawnBalloon, i * 600);
setInterval(spawnBalloon, 1200);

// Sprinkles on cake
const tierBottom = document.getElementById('tierBottom');
if (tierBottom) {
  const sprinkleColors = ['#c8e6a0', '#f2f5ee', '#3ea66a', '#8ec26a'];
  for (let i = 0; i < 25; i++) {
    const s = document.createElement('div');
    s.className = 'sprinkle';
    s.style.background = sprinkleColors[i % sprinkleColors.length];
    s.style.top = (10 + Math.random() * 110) + 'px';
    s.style.left = (Math.random() * 290) + 'px';
    s.style.setProperty('--rot', (Math.random() * 180) + 'deg');
    tierBottom.appendChild(s);
  }
}

// ============== CANDLES ==============
const NUM_CANDLES = 7; // symbolic; label says 25
const candlesEl = document.getElementById('candles');
const candleCount = document.getElementById('cakeCount');
const wishBox = document.getElementById('wishGranted');
let lit = NUM_CANDLES;

function updateCount() {
  if (lit === 0) {
    candleCount.textContent = 'todas as velas apagadas ✦';
    wishBox.classList.add('show');
    // Celebration confetti
    burstConfetti(window.innerWidth / 2, window.innerHeight / 2, 200);
    setTimeout(() => burstConfetti(window.innerWidth * 0.2, window.innerHeight * 0.5, 80), 200);
    setTimeout(() => burstConfetti(window.innerWidth * 0.8, window.innerHeight * 0.5, 80), 400);
  } else {
    candleCount.textContent = `${lit} vela${lit > 1 ? 's' : ''} acesa${lit > 1 ? 's' : ''}`;
  }
}

for (let i = 0; i < NUM_CANDLES; i++) {
  const c = document.createElement('div');
  c.className = 'candle';
  c.innerHTML = '<div class="flame"></div><div class="smoke"></div>';
  c.addEventListener('click', () => {
    if (!c.classList.contains('out')) {
      c.classList.add('out');
      lit--;
      updateCount();
    }
  });
  candlesEl.appendChild(c);
}

// Microphone blow-out
const micBtn = document.getElementById('micBtn');
let audioCtx, analyser, micStream;
micBtn.addEventListener('click', async () => {
  if (micBtn.classList.contains('listening')) return;
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(micStream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    micBtn.classList.add('listening');
    micBtn.textContent = '🔴 Sopra forte no microfone!';
    const data = new Uint8Array(analyser.frequencyBinCount);

    function detect() {
      analyser.getByteFrequencyData(data);
      // focus on low-mid frequencies where blowing sits
      let sum = 0;
      for (let i = 5; i < 40; i++) sum += data[i];
      const avg = sum / 35;
      if (avg > 80) {
        // Blow out one candle per strong sample
        const candles = [...document.querySelectorAll('.candle:not(.out)')];
        if (candles.length > 0) {
          const idx = Math.floor(Math.random() * candles.length);
          candles[idx].classList.add('out');
          lit--;
          updateCount();
        }
      }
      if (lit > 0) requestAnimationFrame(detect);
      else {
        micStream.getTracks().forEach(t => t.stop());
        micBtn.textContent = '✓ todas apagadas';
        micBtn.disabled = true;
      }
    }
    detect();
  } catch (err) {
    micBtn.textContent = 'microfone não liberado — clica nas velas mesmo';
  }
});

updateCount();

// ============== TIMELINE observer ==============
const tlObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('in'), i * 80);
      tlObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.tl-item').forEach(el => tlObserver.observe(el));

// ============== ENVELOPES / MESSAGES ==============
const messages = [
  {
    seal: 'A',
    label: 'sobre amizade',
    title: 'Amizade de verdade',
    body: 'Amizade de verdade não é a que aparece na foto bonita, é a que fica. E a gente ficou. Já faz 9 anos, cara. Em fase boa, em fase ruim, em fase de não querer falar com ninguém menos com você. Obrigado por ser esse tipo de amigo que a vida inteira é pouca pra agradecer.'
  },
  {
    seal: 'F',
    label: 'sobre a faetec',
    title: 'A gente sobreviveu',
    body: 'A Faetec foi pesada. Foi uma das coisas mais difíceis que a gente passou, e a gente passou junto. Se hoje eu olho pra trás e consigo rir é porque teve alguém do meu lado segurando a barra. E esse alguém foi você. Eu nunca esqueci disso, e nunca vou esquecer.'
  },
  {
    seal: 'R',
    label: 'sobre a rift',
    title: 'Duo pra vida toda',
    body: 'Cara, nem sei quantas partidas a gente já jogou. Juntos e desavisados, carregando e sendo carregado. Você é o duo que não enjoa, que não flameia de verdade, que fala "mais uma" às 2 da manhã. Que a rift a gente continue rachando por muitos anos.'
  },
  {
    seal: 'S',
    label: 'sobre a saudade',
    title: 'Tô com saudade, mano',
    body: 'Esse ano você foi pra Portugal e o Brasil ficou meio vazio sem você por aqui. Tô com saudade de verdade. Saudade de marcar um LoL sem pensar no fuso, saudade de trocar ideia sem calcular horário, saudade de simplesmente saber que você tava por perto. Torço demais pra você nessa nova fase, que dê tudo certo aí. E quando você voltar, tô aqui. A amizade nossa atravessa oceano tranquilo.'
  },
  {
    seal: 'C',
    label: 'sobre o casamento',
    title: 'Muitas felicidades pro seu casamento',
    body: 'Te ver casando foi uma das coisas mais bonitas que eu já vivi. Saber que você achou uma pessoa pra andar a vida junto me deixa muito feliz. Desejo um casamento cheio de amor, de paciência, de risada boba no sofá, de viagem, de plano dando certo. Que seja uma vida inteira de parceria. Vocês merecem tudo de bom.'
  },
  {
    seal: '25',
    label: 'o recado final',
    title: 'Feliz 25, irmão',
    body: 'Um quarto de século. Você tá bem, tá lindo, tá casado, tá caminhando. Eu te desejo um ano novo do tamanho de tudo que você merece, que é muito. Saúde pra encarar o que vier, paz pra não surtar quando a vida apertar, e risada pra dividir comigo sempre que der. Te amo, mano. Feliz aniversário.'
  }
];

const grid = document.getElementById('envelopeGrid');
messages.forEach((m, i) => {
  const env = document.createElement('div');
  env.className = 'envelope';
  env.innerHTML = `
    <div class="seal">${m.seal}</div>
    <div class="envelope-label">${m.label}</div>
  `;
  env.addEventListener('click', () => {
    env.classList.add('opened');
    document.getElementById('msgTitle').textContent = m.title;
    document.getElementById('msgBody').textContent = m.body;
    document.getElementById('msgModal').classList.add('show');
    // Mini confetti from card
    const rect = env.getBoundingClientRect();
    burstConfetti(rect.left + rect.width/2, rect.top + rect.height/2, 30);
  });
  grid.appendChild(env);
});

document.getElementById('closeMsg').addEventListener('click', () => {
  document.getElementById('msgModal').classList.remove('show');
});
document.getElementById('msgModal').addEventListener('click', (e) => {
  if (e.target.id === 'msgModal') {
    document.getElementById('msgModal').classList.remove('show');
  }
});

// ============== GAME ==============
const gameCanvas = document.getElementById('gameCanvas');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const bestEl = document.getElementById('best');
const startBtn = document.getElementById('gameStart');
const resultEl = document.getElementById('gameResult');

let gameActive = false;
let score = 0;
let timeLeft = 20;
let spawnTimer = null;
let clockTimer = null;

const best = localStorage.getItem('matheus_best');
if (best) bestEl.textContent = best;

function spawnNexus() {
  if (!gameActive) return;
  const rect = gameCanvas.getBoundingClientRect();
  const n = document.createElement('div');
  n.className = 'nexus';
  const x = 20 + Math.random() * (rect.width - 80);
  const y = 20 + Math.random() * (rect.height - 80);
  n.style.left = x + 'px';
  n.style.top = y + 'px';
  n.innerHTML = '<div class="ring"></div><div class="core"></div>';
  n.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!gameActive) return;
    score++;
    scoreEl.textContent = score;
    // Poof
    const poof = document.createElement('div');
    poof.className = 'poof';
    poof.style.left = (x - 10) + 'px';
    poof.style.top = (y - 10) + 'px';
    gameCanvas.appendChild(poof);
    setTimeout(() => poof.remove(), 500);
    n.remove();
  });
  gameCanvas.appendChild(n);
  setTimeout(() => { if (n.parentNode) n.remove(); }, 1400);
}

startBtn.addEventListener('click', () => {
  if (gameActive) return;
  gameActive = true;
  score = 0;
  timeLeft = 20;
  scoreEl.textContent = 0;
  timeEl.textContent = 20;
  resultEl.textContent = '';
  gameCanvas.classList.remove('idle');
  gameCanvas.innerHTML = '';
  startBtn.textContent = 'Jogando...';
  startBtn.disabled = true;

  spawnTimer = setInterval(spawnNexus, 500);
  clockTimer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
});

function endGame() {
  gameActive = false;
  clearInterval(spawnTimer);
  clearInterval(clockTimer);
  gameCanvas.classList.add('idle');
  gameCanvas.innerHTML = '';
  startBtn.textContent = 'Jogar de novo';
  startBtn.disabled = false;

  const prevBest = parseInt(localStorage.getItem('matheus_best') || '0');
  if (score > prevBest) {
    localStorage.setItem('matheus_best', score);
    bestEl.textContent = score;
    resultEl.innerHTML = `Novo recorde: <b style="color:var(--gold)">${score}</b> nexus! 🏆`;
    burstConfetti(window.innerWidth / 2, window.innerHeight / 2, 150);
  } else {
    let msg;
    if (score >= 30) msg = `${score} nexus! Challenger confirmado.`;
    else if (score >= 20) msg = `${score} nexus. Diamante, no mínimo.`;
    else if (score >= 10) msg = `${score}. Nada mal. Bronze feliz.`;
    else msg = `${score}... tá fora de forma, hein? 😂`;
    resultEl.textContent = msg;
  }
}

// ============== Reveal on scroll for sections ==============
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.style.opacity = '1';
  });
}, { threshold: 0.1 });
