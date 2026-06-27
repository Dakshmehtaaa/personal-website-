/* ======================================
   Smooth Scrolling
====================================== */

document.querySelectorAll('nav a, .button').forEach(link => {

    link.addEventListener('click', e => {

        const href = link.getAttribute('href');

        if (!href.startsWith('#')) return;

        e.preventDefault();

        document.querySelector(href).scrollIntoView({

            behavior: 'smooth'

        });

    });

});


/* ======================================
   Fade In Sections
====================================== */

const observer = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add("show");

        }

    });

},{
    threshold:.15
});

document.querySelectorAll("section").forEach(section=>{

    section.classList.add("hidden");

    observer.observe(section);

});


/* ======================================
   Floating Navbar
====================================== */

const nav=document.querySelector("nav");

window.addEventListener("scroll",()=>{

    if(window.scrollY>60){

        nav.style.background="rgba(16,35,29,.92)";

        nav.style.boxShadow="0 18px 45px rgba(0,0,0,.30)";

    }

    else{

        nav.style.background="rgba(255,255,255,.08)";

        nav.style.boxShadow="none";

    }

});


/* ======================================
   Hero Parallax
====================================== */

const hero=document.querySelector(".hero");

window.addEventListener("scroll",()=>{

    hero.style.backgroundPositionY=window.scrollY*.35+"px";

});


/* ======================================
   Pause Logo Belt On Hover
====================================== */

const track=document.querySelector(".logo-track");

track.addEventListener("mouseenter",()=>{

    track.style.animationPlayState="paused";

});

track.addEventListener("mouseleave",()=>{

    track.style.animationPlayState="running";

});


/* ======================================
   Cursor Glow
====================================== */

const glow=document.createElement("div");

glow.className="cursor-glow";

document.body.appendChild(glow);

window.addEventListener("mousemove",(e)=>{

    glow.style.left=e.clientX+"px";

    glow.style.top=e.clientY+"px";

});


/* ======================================
   Active Navbar Link
====================================== */

const sections=document.querySelectorAll("section");

const navLinks=document.querySelectorAll("nav a");

window.addEventListener("scroll",()=>{

    let current="";

    sections.forEach(section=>{

        const top=section.offsetTop-150;

        const height=section.clientHeight;

        if(scrollY>=top){

            current=section.getAttribute("id");

        }

    });

    navLinks.forEach(link=>{

        link.classList.remove("active");

        if(link.getAttribute("href")==="#"+current){

            link.classList.add("active");

        }

    });

});
