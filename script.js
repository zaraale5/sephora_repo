// ----- Smooth Scroll -----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth', block:'start'});
      if(target.hasAttribute('tabindex')) target.focus();
      if(window.innerWidth < 800) closeMobileMenu();
    }
  });
});

// ----- Sticky mobile nav -----
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');
navToggle && navToggle.addEventListener('click', () => {
  mobileMenu.style.display = mobileMenu.style.display==='flex'?'none':'flex';
  mobileMenu.setAttribute('aria-hidden', mobileMenu.style.display!=='flex');
  navToggle.setAttribute('aria-expanded', mobileMenu.style.display==='flex');
  document.body.classList.toggle('no-scroll', mobileMenu.style.display==='flex');
});
function closeMobileMenu(){
  mobileMenu.style.display='none';
  navToggle.setAttribute('aria-expanded','false');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
}
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') closeMobileMenu();
});

// ----- Section scroll-in animations -----
const inViewElements = document.querySelectorAll('section, .product-card, .offer-card, .testimonial-card, .faq-item');
const io = new IntersectionObserver((entries, obs) => {
  entries.forEach(ent => {
    if (ent.isIntersecting) {
      ent.target.classList.add('section-in');
      obs.unobserve(ent.target);
    }
  });
}, { threshold: .14 });
inViewElements.forEach(el => { io.observe(el); });

// ----- Accessibility: High Contrast Mode toggle -----
document.getElementById('contrast-toggle').addEventListener('click', () => {
  document.body.classList.toggle('high-contrast');
});

// ----- Personalize modal logic -----
const personalize = {
  trigger: document.getElementById('personalize-trigger'),
  modal: document.getElementById('personalize-modal'),
  close: null,
  form: null,
  result: null
};
personalize.close = personalize.modal.querySelector('.close-modal');
personalize.form = document.getElementById('personalize-form');
personalize.result = document.getElementById('personalize-result');
personalize.trigger.addEventListener('click', () => {
  personalize.modal.classList.add('open');
  personalize.modal.focus();
});
personalize.close.addEventListener('click', () => {
  personalize.modal.classList.remove('open');
  personalize.result.textContent='';
  personalize.form.reset();
  personalize.trigger.focus();
});
personalize.form.addEventListener('submit', e => {
  e.preventDefault();
  const tone = personalize.form.skintone.value, type = personalize.form.skintype.value, pref = personalize.form.preference.value;
  let msg = '';
  if (!tone || !type || !pref) {
    personalize.result.textContent = 'Please complete all fields.';
    return;
  }
  // Extremely simplified example matcher
  if(tone==='Fair'||tone==='Light')
    msg = 'Try light, dewy SPF-infused bases; soft coral and rose blushes; and gentle cleansers for ' + type + ' skin.';
  else if(tone==='Deep'||tone==='Rich')
    msg = 'Go bold: rich berry or gold highlighters, deep earth-tone shadows. Look for hydrating, non-ashy formulas for deep skin.';
  else
    msg = 'Try universal neutrals in blush and clean formulas (esp. for sensitive/combination skin). Multi-taskers can simplify your routine.';
  personalize.result.textContent = msg;
});
personalize.modal.addEventListener('keydown', e => {
  if (e.key === 'Escape') personalize.close.click();
});

// ----- Chat widget -----
(function chat() {
  const chatContainer = document.getElementById('chat-widget');
  let expanded = false;
  let panel, input, sendBtn, history;

  function icon() {
    return '<svg width="28" height="28" aria-hidden="true" fill="none" viewBox="0 0 28 28"><rect x="2.5" y="2.5" width="23" height="18" rx="5" stroke="#fff" stroke-width="2.3"/><circle cx="8.5" cy="13.5" r="1.7" fill="#fff"/><circle cx="14" cy="13.5" r="1.7" fill="#fff"/><circle cx="19.5" cy="13.5" r="1.7" fill="#fff"/></svg>';
  }

  function render() {
    chatContainer.innerHTML = '<button class="chat-fab" aria-label="Open chat">'+icon()+'</button>';
    const fab = chatContainer.querySelector('.chat-fab');
    fab.onclick = openPanel;
  }
  function openPanel() {
    expanded = true;
    chatContainer.innerHTML = '<div class="chat-panel" aria-label="Chat widget"><div class="chat-header">Beauty Chat <button class="chat-close" aria-label="Close chat">&times;</button></div><div class="chat-history"></div><form class="chat-input-row" autocomplete="off"><input class="chat-input" type="text" placeholder="Ask me anything…" aria-label="Chat input" required /><button class="chat-send-btn" title="Send" aria-label="Send message">➤</button></form></div>';
    panel = chatContainer.querySelector('.chat-panel');
    input = chatContainer.querySelector('.chat-input');
    sendBtn = chatContainer.querySelector('.chat-send-btn');
    history = chatContainer.querySelector('.chat-history');
    chatContainer.querySelector('.chat-close').onclick = closePanel;
    chatContainer.querySelector('.chat-input-row').onsubmit = send;
    input.focus();
    // Open with friendly welcome if blank
    history.innerHTML = '<div class="chat-message">Hi! Ask me anything about our services 👋</div>';
  }
  function closePanel(){
    expanded = false;
    render();
  }
  function addMsg(text, who) {
    const div = document.createElement('div');
    div.className = 'chat-message'+(who==='user' ? ' user' : '');
    div.textContent = text;
    history.appendChild(div);
    history.scrollTop = history.scrollHeight;
  }
  function send(e) {
    e && e.preventDefault();
    const val = input.value.trim();
    if(!val) return;
    addMsg(val,'user');
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;
    fetch('https://overstay-choosy-succulent.ngrok-free.dev/webhook/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ message:val, companyId: 'sephora-repo', companyName:'sephora' })
    }).then(r=>r.json()).then(data => {
      addMsg(data.reply||'Sorry, I\'m not sure.');
    }).catch(()=>{addMsg('Sorry, there was a problem.');})
      .finally(()=>{ input.disabled=false; sendBtn.disabled=false; input.focus(); });
  }
  render();
  // Keyboard accessibility
  chatContainer.addEventListener('keydown', (e)=>{
    if(e.key==='Escape' && expanded) closePanel();
  });
})();
