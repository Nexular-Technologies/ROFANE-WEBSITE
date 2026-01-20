const SEPARATION = 40, AMOUNTX = 230, AMOUNTY = 35; 
let container;
let camera, scene, renderer;
let particles, count = 0;

// Mouse tracking
let mouseX = 0, mouseY = 0;

init();
animate();

function init() {
    container = document.getElementById('vanta-canvas');

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
    camera.position.y = 400;

    scene = new THREE.Scene();

    const numParticles = AMOUNTX * AMOUNTY;
    const positions = new Float32Array(numParticles * 3);

    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
            positions[i + 1] = 0;
            positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
            i += 3;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // UPDATED: Color changed to white (0xffffff) and size increased to 4.2 (40% bigger)
    const material = new THREE.PointsMaterial({
        color: 0xffffff, 
        size: 5.2, 
        transparent: true,
        opacity: 0.8,
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Clear the container before appending to avoid duplicate canvases
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);
}

function onDocumentMouseMove(event) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    // Parallax camera movement
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY + 400 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    const positions = particles.geometry.attributes.position.array;

    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            // Wave Math
            positions[i + 1] = (Math.sin((ix + count) * 0.3) * 50) +
                               (Math.sin((iy + count) * 0.5) * 50);
            i += 3;
        }
    }

    particles.geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
    count += 0.05;
}