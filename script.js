const canvas = document.getElementById('circuit-board');
const ctx = canvas.getContext('2d');

let width, height;
let circuits = [];

// Resize canvas to fill window
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
        this.length = Math.random() * 200 + 50; // Total length of the path
        this.segments = []; // Array of {x, y} points
        this.speed = Math.random() * 2 + 0.5;
        this.progress = 0; // Current position of the 'electron'
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
            // Randomly choose a direction: Horizontal or Vertical
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

        // Reset if it finished the path
        if (this.progress >= this.length) {
            this.progress = 0;
            // Optionally respawn at a new location for variety
            if (Math.random() < 0.1) {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.segments = [];
                this.generatePath();
            }
        }
    }

    draw() {
        // Draw the static path slightly visible
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 243, 255, 0.05)`;
        ctx.lineWidth = this.width;
        ctx.moveTo(this.segments[0].x, this.segments[0].y);

        for (let i = 1; i < this.segments.length; i++) {
            ctx.lineTo(this.segments[i].x, this.segments[i].y);
        }
        ctx.stroke();

        // Draw the moving electron
        let traveled = 0;
        let p = this.progress;

        for (let i = 0; i < this.segments.length - 1; i++) {
            let start = this.segments[i];
            let end = this.segments[i + 1];

            // Calculate distance of this segment
            let dx = end.x - start.x;
            let dy = end.y - start.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (p <= traveled + dist) {
                // Electron is on this segment
                let ratio = (p - traveled) / dist;
                let ex = start.x + dx * ratio;
                let ey = start.y + dy * ratio;

                // Draw glowing head
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha + 0.5})`;
                ctx.arc(ex, ey, 2, 0, Math.PI * 2);
                ctx.fill();

                // Draw trail
                // Simple trail: just draw from start of this segment to current point
                // For better trail, we would need to look back at previous segments
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
    const count = Math.floor((width * height) / 20000); // Density based on screen area
    for (let i = 0; i < count; i++) {
        circuits.push(new Circuit());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw background overlay if needed (style.css handles the main gradient)

    circuits.forEach(circuit => {
        circuit.update();
        circuit.draw();
    });

    requestAnimationFrame(animate);
}

resize();
animate();

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return; // Ignore empty links

        document.querySelector(targetId).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Intersection Observer for Futuristic Transitions
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

// Active Navigation Link Tracker
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserverOptions = {
    threshold: 0.5 // Trigger when 50% of the section is visible
};

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));

            // Add active class to corresponding link
            const id = entry.target.getAttribute('id');
            const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}, navObserverOptions);

sections.forEach(section => {
    navObserver.observe(section);
});
