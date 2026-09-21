(() => {
 'use strict';
 const body=document.body, reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 const read=key=>{try{return localStorage.getItem(key)}catch{return null}};
 const save=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
 const translated=[...document.querySelectorAll('[data-fr]')].map(el=>({el,en:el.textContent,fr:el.dataset.fr}));
 let lang=read('concept-language')==='fr'?'fr':'en',manualPause=read('concept-motion')==='paused';
 const videos=[...document.querySelectorAll('video')].map(video=>({video,button:video.parentElement.querySelector('.video-toggle'),visible:false,playing:!reduced.matches&&!manualPause}));
 const motionButton=document.querySelector('.motion-toggle');
 const paused=()=>manualPause||reduced.matches;
 const videoLabel=state=>{state.button.textContent=lang==='fr'?(state.video.paused?'Lire le film':'Pause'):(state.video.paused?'Play film':'Pause film');state.button.setAttribute('aria-label',state.button.textContent)};
 const syncVideo=state=>{if(state.playing&&state.visible&&!document.hidden)state.video.play().catch(()=>videoLabel(state));else state.video.pause();videoLabel(state)};
 const applyLanguage=()=>{
  document.documentElement.lang=lang;
  translated.forEach(({el,en,fr})=>el.textContent=lang==='fr'?fr:en);
  document.querySelectorAll('.language-toggle').forEach(button=>{button.textContent=lang==='fr'?'EN':'FR';button.setAttribute('aria-label',lang==='fr'?'Switch to English':'Passer en français')});
  videos.forEach(videoLabel);
  if(motionButton)motionButton.setAttribute('aria-label',lang==='fr'?(paused()?'Activer les animations':'Suspendre les animations'):(paused()?'Enable animations':'Pause animations'));
 };
 document.querySelectorAll('.language-toggle').forEach(button=>button.addEventListener('click',()=>{lang=lang==='en'?'fr':'en';save('concept-language',lang);applyLanguage()}));
 const header=document.querySelector('.site-header'),menu=document.querySelector('.menu-toggle');
 const closeMenu=()=>{header?.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false')};
 menu?.addEventListener('click',()=>{const open=header.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open))});
 header?.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',closeMenu));
 addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();menu?.focus()}});
 videos.forEach(state=>{
  const {video,button}=state;button.hidden=false;video.controls=false;
  button.addEventListener('click',()=>{state.playing=video.paused;state.visible=true;syncVideo(state)});
  video.addEventListener('play',()=>videoLabel(state));video.addEventListener('pause',()=>videoLabel(state));
  const failed=()=>{button.hidden=true;video.controls=true};video.addEventListener('error',failed);video.querySelector('source')?.addEventListener('error',failed);
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting;syncVideo(state)},{threshold:.3}).observe(video);
  else{state.visible=true;syncVideo(state)}
 });
 document.addEventListener('visibilitychange',()=>videos.forEach(syncVideo));
 const setMotion=()=>{body.classList.toggle('motion-paused',paused());if(motionButton){motionButton.textContent=paused()?'▶':'Ⅱ';motionButton.setAttribute('aria-pressed',String(paused()))}videos.forEach(state=>{state.playing=!paused();syncVideo(state)});applyLanguage();schedule()};
 motionButton?.addEventListener('click',()=>{manualPause=!manualPause;save('concept-motion',manualPause?'paused':'on');setMotion()});
 reduced.addEventListener('change',setMotion);
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
 const entering=[...document.querySelectorAll('[data-enter]')],hero=document.querySelector('.hero'),dock=document.querySelector('.concept-dock');
 let frame=0;
 function render(){
  frame=0;const y=scrollY,h=innerHeight;
  dock?.style.setProperty('--progress',clamp(y/Math.max(1,document.documentElement.scrollHeight-h)));
  if(paused())return;
  entering.forEach(el=>{const box=el.getBoundingClientRect();if(box.top<h+150&&box.bottom>0)el.style.setProperty('--enter-y',`${clamp((box.top-h*.7)/(h*.4))*28}px`)});
  if(hero){hero.style.setProperty('--photo-scale',String(1.02+clamp(y/h)*.09));hero.style.setProperty('--photo-y',`${clamp(y/h)*22}px`);hero.style.setProperty('--landscape-y',`${Math.min(y*.16,130)}px`);hero.style.setProperty('--cross-turn',`${y*.05}deg`);hero.style.setProperty('--name-x',`${-Math.min(y*.08,70)}px`)}
  if(innerWidth>1000)document.querySelectorAll('.hobby-photo').forEach((el,i)=>{const r=el.getBoundingClientRect();if(r.top<h&&r.bottom>0)el.style.setProperty('--drift',`${clamp((h-r.top)/h)*((i%2?1:-1)*24)}px`)});
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(render)}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});addEventListener('load',schedule,{once:true});
 document.querySelectorAll('[data-tilt],.signal-deck').forEach(el=>{
  el.addEventListener('pointermove',event=>{if(paused()||!fine.matches)return;const r=el.getBoundingClientRect();el.style.setProperty('--rx',`${(.5-(event.clientY-r.top)/r.height)*5}deg`);el.style.setProperty('--ry',`${((event.clientX-r.left)/r.width-.5)*6}deg`);el.style.setProperty('--deck-y',`${((event.clientX-r.left)/r.width-.5)*12}deg`)});
  el.addEventListener('pointerleave',()=>{el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg');el.style.setProperty('--deck-y','0deg')});
 });
 const deepLink=()=>{let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)))}catch{return}if(target?.matches('.project')){target.open=true;const more=target.closest('.more-work');if(more)more.open=true;requestAnimationFrame(()=>target.scrollIntoView())}};
 addEventListener('hashchange',deepLink);deepLink();setMotion();
})();
