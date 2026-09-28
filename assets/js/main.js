const menuToggle = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');
if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => {
        menu.classList.toggle('open');
        document.body.classList.toggle('no-scroll', menu.classList.contains('open'));
    });
}

const slides = [...document.querySelectorAll('.slide')];
let slideIndex = 0;
function showSlide(index) {
    if (!slides.length) return;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
}
function nextSlide(direction = 1) {
    if (!slides.length) return;
    slideIndex = (slideIndex + direction + slides.length) % slides.length;
    showSlide(slideIndex);
}

document.querySelector('[data-next]')?.addEventListener('click', () => nextSlide(1));
document.querySelector('[data-prev]')?.addEventListener('click', () => nextSlide(-1));
if (slides.length) {
    showSlide(slideIndex);
    setInterval(() => nextSlide(1), 5200);
}

const revealItems = document.querySelectorAll('.product-card, .panel, .stat');
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.animate(
                [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }],
                { duration: 420, easing: 'ease-out', fill: 'forwards' }
            );
            observer.unobserve(entry.target);
        }
    });
}, { threshold: .12 });
revealItems.forEach(item => observer.observe(item));
