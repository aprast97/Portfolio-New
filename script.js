const canvas = document.getElementById('circuit-board');
const ctx = canvas.getContext('2d');

let width, height;
let circuits = [];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initCircuits();
}

window.addEventListener('resize', resize);

class Circuit {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.length = Math.random() * 200 + 50;
        this.segments = [];
        this.speed = Math.random() * 2 + 0.5;
        this.progress = 0;
        this.color = '#00f3ff';
        this.width = Math.random() * 1.5 + 0.5;
        this.generatePath();
        this.alpha = Math.random() * 0.5 + 0.1;
    }

    generatePath() {
        let currentX = this.x;
        let currentY = this.y;
        this.segments.push({ x: currentX, y: currentY });

        let remainingLength = this.length;

        while (remainingLength > 0) {
            const dir = Math.random() > 0.5 ? 'H' : 'V';
            const segLen = Math.min(remainingLength, Math.random() * 50 + 20);

            if (dir === 'H') {
                currentX += Math.random() > 0.5 ? segLen : -segLen;
            } else {
                currentY += Math.random() > 0.5 ? segLen : -segLen;
            }

            this.segments.push({ x: currentX, y: currentY });
            remainingLength -= segLen;
        }
    }

    update() {
        this.progress += this.speed;

        if (this.progress >= this.length) {
            this.progress = 0;
            if (Math.random() < 0.1) {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.segments = [];
                this.generatePath();
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 243, 255, 0.05)`;
        ctx.lineWidth = this.width;
        ctx.moveTo(this.segments[0].x, this.segments[0].y);

        for (let i = 1; i < this.segments.length; i++) {
            ctx.lineTo(this.segments[i].x, this.segments[i].y);
        }
        ctx.stroke();

        let traveled = 0;
        let p = this.progress;

        for (let i = 0; i < this.segments.length - 1; i++) {
            let start = this.segments[i];
            let end = this.segments[i + 1];

            let dx = end.x - start.x;
            let dy = end.y - start.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (p <= traveled + dist) {
                let ratio = (p - traveled) / dist;
                let ex = start.x + dx * ratio;
                let ey = start.y + dy * ratio;

                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha + 0.5})`;
                ctx.arc(ex, ey, 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;

                break;
            }
            traveled += dist;
        }
        ctx.shadowBlur = 0;
    }
}

function initCircuits() {
    circuits = [];
    const count = Math.floor((width * height) / 20000);
    for (let i = 0; i < count; i++) {
        circuits.push(new Circuit());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);


    circuits.forEach(circuit => {
        circuit.update();
        circuit.draw();
    });

    requestAnimationFrame(animate);
}

resize();
animate();

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        document.querySelector(targetId).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

const observerOptions = {
    threshold: 0.2,
    rootMargin: "0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            entry.target.classList.remove('hidden');
        }
    });
}, observerOptions);

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));

const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

function highlightMenu() {
    let scrollPosition = window.scrollY;

    sections.forEach(section => {
        let top = section.offsetTop - 150;
        let bottom = top + section.offsetHeight;
        let id = section.getAttribute('id');
        let activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);

        if (scrollPosition >= top && scrollPosition < bottom) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', highlightMenu);

highlightMenu();

const menuToggle = document.querySelector('#mobile-menu');
const navLinksContainer = document.querySelector('.nav-links');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('is-active');
        navLinksContainer.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('is-active');
            navLinksContainer.classList.remove('active');
        });
    });
}
