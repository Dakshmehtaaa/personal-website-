// Smooth scroll highlight
document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();

        const target = document.querySelector(link.getAttribute("href"));

        target.scrollIntoView({
            behavior: "smooth"
        });
    });
});

// Fade in sections

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if(entry.isIntersecting){

            entry.target.classList.add("show");

        }

    });

},{
    threshold:0.2
});

document.querySelectorAll("section").forEach(section=>{

    section.classList.add("hidden");

    observer.observe(section);

});

// Floating navbar

window.addEventListener("scroll",()=>{

    const nav=document.querySelector("nav");

    if(window.scrollY>50){

        nav.style.background="rgba(8,17,31,.85)";
        nav.style.boxShadow="0 20px 40px rgba(0,0,0,.35)";

    }else{

        nav.style.background="rgba(255,255,255,.08)";
        nav.style.boxShadow="none";

    }

});
