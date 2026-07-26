// scatter speckle dots to echo the ink-splatter logo
document.querySelectorAll('.speckles').forEach(function(container){
  var count = 14;
  for(var i=0;i<count;i++){
    var s = document.createElement('i');
    var size = 3 + Math.random()*9;
    s.style.width = size+'px';
    s.style.height = size+'px';
    s.style.top = Math.random()*100+'%';
    s.style.left = Math.random()*100+'%';
    s.style.opacity = (0.12 + Math.random()*0.28).toFixed(2);
    container.appendChild(s);
  }
});

// ---------- language toggle ----------
window.currentLang = localStorage.getItem('siteLang') || 'ko';

function applyLang(lang){
  window.currentLang = lang;
  localStorage.setItem('siteLang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-ko]').forEach(function(el){
    el.textContent = lang === 'ko' ? el.dataset.ko : el.dataset.en;
  });
  document.querySelectorAll('[data-ko-html]').forEach(function(el){
    el.innerHTML = lang === 'ko' ? el.dataset.koHtml : el.dataset.enHtml;
  });
  document.querySelectorAll('[data-ko-placeholder]').forEach(function(el){
    el.placeholder = lang === 'ko' ? el.dataset.koPlaceholder : el.dataset.enPlaceholder;
  });
  document.querySelectorAll('[data-ko-alt]').forEach(function(el){
    el.alt = lang === 'ko' ? el.dataset.koAlt : el.dataset.enAlt;
  });

  var koBtn = document.getElementById('lang-ko');
  var enBtn = document.getElementById('lang-en');
  if(koBtn && enBtn){
    koBtn.classList.toggle('active', lang === 'ko');
    enBtn.classList.toggle('active', lang === 'en');
    koBtn.setAttribute('aria-pressed', lang === 'ko');
    enBtn.setAttribute('aria-pressed', lang === 'en');
  }

  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
}

document.addEventListener('DOMContentLoaded', function(){
  var koBtn = document.getElementById('lang-ko');
  var enBtn = document.getElementById('lang-en');
  if(koBtn) koBtn.addEventListener('click', function(){ applyLang('ko'); });
  if(enBtn) enBtn.addEventListener('click', function(){ applyLang('en'); });
  applyLang(window.currentLang);
});
