import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Ambient3DScene({ currentRound }) {
  const canvasRef = useRef(null);
  const roundRef = useRef(currentRound);
  
  // Track mouse coordinates for interactive parallax drift
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Update round ref whenever prop changes
  useEffect(() => {
    roundRef.current = currentRound;
  }, [currentRound]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const width = window.innerWidth;
    const isMobile = width < 768;

    // 1. Scene setup
    const scene = new THREE.Scene();
    
    const getBgColor = (round) => {
      switch (round) {
        case 'movies': return 0x070002;
        case 'gk': return 0x00060a;
        case 'history': return 0x0a0701;
        case 'riddles': return 0x05000a;
        case 'tech': return 0x000408;
        default: return 0x020005; // Landing page
      }
    };

    const initialBg = getBgColor(currentRound);
    scene.background = new THREE.Color(initialBg);
    scene.fog = new THREE.FogExp2(initialBg, 0.06);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    // Start with a default position
    camera.position.set(0, 0, 8);
    let targetCameraZ = 8;
    let transitionAngle = 0;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: !isMobile,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xffffff, 2.0, 40);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const colorLight = new THREE.PointLight(0xaa3bff, 3.0, 30);
    colorLight.position.set(-6, -4, 2);
    scene.add(colorLight);

    // 5. Asset Groups
    // We maintain a container that holds the mesh group for the active round
    const environmentGroup = new THREE.Group();
    scene.add(environmentGroup);

    // Grid helper for Tech round
    let gridHelper = null;

    // Particle system
    const particleCount = isMobile ? 60 : 300;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    // Set initial particles
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 16;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;

      const col = new THREE.Color(0xaa3bff);
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Programmatic round soft particle texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 16;
    pCanvas.height = 16;
    const pCtx = pCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 16, 16);
    const pTexture = new THREE.CanvasTexture(pCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: isMobile ? 0.08 : 0.12,
      vertexColors: true,
      map: pTexture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Reusable Materials
    const goldMat = new THREE.MeshPhongMaterial({ color: 0xffd700, shininess: 100, specular: 0xffffff });
    const silverMat = new THREE.MeshPhongMaterial({ color: 0x9ca3af, shininess: 90, specular: 0xffffff });
    const bronzeMat = new THREE.MeshPhongMaterial({ color: 0xd97706, shininess: 30, specular: 0x553300 });
    const crystalMat = new THREE.MeshPhongMaterial({ color: 0xa855f7, shininess: 100, transparent: true, opacity: 0.8 });
    const holographicMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.4 });

    // Track active round and transition phase
    let activeEnvironment = null;
    let transitionProgress = 1.0; // 1.0 = transition complete
    let previousBgColor = new THREE.Color(initialBg);
    let targetBgColor = new THREE.Color(initialBg);
    let customUpdate = () => {};

    // 6. Build themed visual assets
    const buildEnvironment = (round) => {
      // Clear current elements
      while (environmentGroup.children.length > 0) {
        const obj = environmentGroup.children[0];
        environmentGroup.remove(obj);
        // Safely dispose geometries/materials
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      }

      if (gridHelper) {
        scene.remove(gridHelper);
        gridHelper = null;
      }

      customUpdate = () => {};
      let mainLightColor = 0xffffff;
      let colorLightColor = 0xaa3bff;
      let pColor1 = 0xaa3bff;
      let pColor2 = 0x8b5cf6;

      if (round === 'landing' || !round) {
        // --- LANDING Environment (Trophy & Orbits) ---
        mainLightColor = 0xffd700;
        colorLightColor = 0xa855f7;
        pColor1 = 0xffd700;
        pColor2 = 0xaa3bff;

        const trophy = new THREE.Group();
        
        // Base
        const baseGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.5, 8);
        const base = new THREE.Mesh(baseGeo, bronzeMat);
        base.position.y = -1.6;
        trophy.add(base);

        // Stem
        const stemGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.0, 8);
        const stem = new THREE.Mesh(stemGeo, goldMat);
        stem.position.y = -0.9;
        trophy.add(stem);

        // Cup
        const cupGeo = new THREE.CylinderGeometry(1.4, 0.7, 1.8, 16);
        const cup = new THREE.Mesh(cupGeo, goldMat);
        cup.position.y = 0.5;
        trophy.add(cup);

        // Handles
        const handleGeo = new THREE.TorusGeometry(0.7, 0.12, 8, 24, Math.PI);
        const leftH = new THREE.Mesh(handleGeo, goldMat);
        leftH.position.set(-1.0, 0.6, 0);
        leftH.rotation.z = Math.PI / 2;
        trophy.add(leftH);

        const rightH = leftH.clone();
        rightH.position.x = 1.0;
        rightH.rotation.z = -Math.PI / 2;
        trophy.add(rightH);

        environmentGroup.add(trophy);

        // Drifting geometric nodes
        const floatingObjects = [];
        if (!isMobile) {
          const torusGeo = new THREE.TorusGeometry(0.3, 0.08, 6, 16);
          const cubeGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
          for (let i = 0; i < 5; i++) {
            const mesh = new THREE.Mesh(i % 2 === 0 ? torusGeo : cubeGeo, crystalMat);
            mesh.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6 - 2);
            environmentGroup.add(mesh);
            floatingObjects.push(mesh);
          }
        }

        customUpdate = (time) => {
          trophy.rotation.y = time * 0.4;
          trophy.position.y = Math.sin(time * 1.5) * 0.15;
          floatingObjects.forEach((m, i) => {
            m.rotation.x += 0.01;
            m.rotation.y += 0.012;
            m.position.y += Math.sin(time + i) * 0.002;
          });
        };

      } else if (round === 'movies') {
        // --- MOVIES Environment (Spotlights & Reels) ---
        mainLightColor = 0xef4444;
        colorLightColor = 0xf59e0b;
        pColor1 = 0xef4444;
        pColor2 = 0xf59e0b;

        const reelGroup = new THREE.Group();
        const reelGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.35, 24);
        const reel = new THREE.Mesh(reelGeo, silverMat);
        reel.rotation.x = Math.PI / 2;
        reelGroup.add(reel);

        // Inside dark film core
        const coreGeo = new THREE.CylinderGeometry(1.65, 1.65, 0.3, 16);
        const coreMat = new THREE.MeshPhongMaterial({ color: 0x111827, shininess: 15 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.rotation.x = Math.PI / 2;
        reelGroup.add(core);

        // Decorative film holes
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const holeGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 12);
          const hole = new THREE.Mesh(holeGeo, new THREE.MeshBasicMaterial({ color: getBgColor('movies') }));
          hole.position.set(Math.cos(angle) * 1.0, 0, Math.sin(angle) * 1.0);
          reelGroup.add(hole);
        }

        reelGroup.position.set(0, 0, -2);
        environmentGroup.add(reelGroup);

        // Spotlights
        const spots = [];
        if (!isMobile) {
          const coneGeo = new THREE.ConeGeometry(1.2, 8, 16, 1, true);
          const coneMat = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            transparent: true,
            opacity: 0.12,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
          });
          
          for (let i = 0; i < 2; i++) {
            const spot = new THREE.Mesh(coneGeo, coneMat);
            spot.position.set(i === 0 ? -4 : 4, -1, -4);
            spot.rotation.z = i === 0 ? -Math.PI / 8 : Math.PI / 8;
            scene.add(spot);
            spots.push(spot);
            // Ensure they clean up when unmounting
            environmentGroup.add(spot);
          }
        }

        customUpdate = (time) => {
          reelGroup.rotation.z = time * 0.3;
          reelGroup.rotation.y = Math.sin(time * 0.5) * 0.1;
          spots.forEach((spot, i) => {
            spot.rotation.x = Math.sin(time + i) * 0.1;
            spot.rotation.y = Math.cos(time + i) * 0.15;
          });
        };

      } else if (round === 'gk') {
        // --- GK Environment (Wireframe Globe & Constellation Rings) ---
        mainLightColor = 0x14b8a6;
        colorLightColor = 0x3b82f6;
        pColor1 = 0x14b8a6;
        pColor2 = 0x3b82f6;

        const globe = new THREE.Group();

        // Core Sphere
        const coreGeo = new THREE.SphereGeometry(1.8, 18, 18);
        const globeMesh = new THREE.Mesh(coreGeo, holographicMat);
        globe.add(globeMesh);

        // Orbital ring loops
        const loopGeo = new THREE.TorusGeometry(2.3, 0.03, 6, 48);
        const loop1 = new THREE.Mesh(loopGeo, new THREE.MeshPhongMaterial({ color: 0x3b82f6, emissive: 0x001133 }));
        loop1.rotation.x = Math.PI / 4;
        globe.add(loop1);

        const loop2 = loop1.clone();
        loop2.rotation.y = Math.PI / 2;
        loop2.rotation.x = -Math.PI / 4;
        globe.add(loop2);

        environmentGroup.add(globe);

        customUpdate = (time) => {
          globe.rotation.y = time * 0.18;
          globe.rotation.x = time * 0.04;
          loop1.rotation.z = time * 0.1;
          loop2.rotation.z = -time * 0.15;
        };

      } else if (round === 'history') {
        // --- HISTORY Environment (Temple columns & warm lighting) ---
        mainLightColor = 0xd97706;
        colorLightColor = 0xb45309;
        pColor1 = 0xd97706;
        pColor2 = 0x78350f;

        const pillars = new THREE.Group();
        const capGeo = new THREE.BoxGeometry(0.7, 0.3, 0.7);
        const shaftGeo = new THREE.CylinderGeometry(0.22, 0.22, 3.2, 8);

        // Draw 3 pillars left, center back, right
        const spawnPillar = (x, z) => {
          const pil = new THREE.Group();
          const shaft = new THREE.Mesh(shaftGeo, bronzeMat);
          const cap = new THREE.Mesh(capGeo, bronzeMat);
          cap.position.y = 1.6;
          const base = new THREE.Mesh(capGeo, bronzeMat);
          base.position.y = -1.6;

          pil.add(shaft, cap, base);
          pil.position.set(x, -0.6, z);
          pillars.add(pil);
        };

        spawnPillar(-3.5, -2);
        spawnPillar(3.5, -2);
        if (!isMobile) {
          spawnPillar(0, -5);
        }

        environmentGroup.add(pillars);

        customUpdate = (time) => {
          pillars.position.y = Math.sin(time * 0.8) * 0.05;
          // Flickering torch lighting simulation
          mainLight.intensity = 1.8 + Math.sin(time * 10) * 0.2 + Math.random() * 0.1;
          colorLight.intensity = 2.5 + Math.cos(time * 8) * 0.3;
        };

      } else if (round === 'riddles') {
        // --- RIDDLES Environment (Puzzle Pieces & Glowing Question Marks) ---
        mainLightColor = 0xa855f7;
        colorLightColor = 0xec4899;
        pColor1 = 0xa855f7;
        pColor2 = 0xec4899;

        const riddlesGroup = new THREE.Group();
        
        // Large Question Mark shape
        const qMark = new THREE.Group();
        const hookGeo = new THREE.TorusGeometry(0.7, 0.16, 6, 20, Math.PI * 1.3);
        const hook = new THREE.Mesh(hookGeo, crystalMat);
        hook.position.y = 0.4;
        qMark.add(hook);

        const stemGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.35, 8);
        const stem = new THREE.Mesh(stemGeo, crystalMat);
        stem.position.set(0.48, -0.3, 0);
        stem.rotation.z = -Math.PI / 6;
        qMark.add(stem);

        const dotGeo = new THREE.SphereGeometry(0.2, 10, 10);
        const dot = new THREE.Mesh(dotGeo, crystalMat);
        dot.position.set(0.48, -0.9, 0);
        qMark.add(dot);

        qMark.position.set(-0.24, 0, -1);
        riddlesGroup.add(qMark);

        // Drifting Puzzle pieces (floating rings/toruses)
        const pieces = [];
        if (!isMobile) {
          const knotGeo = new THREE.TorusKnotGeometry(0.25, 0.07, 32, 6);
          for (let i = 0; i < 4; i++) {
            const piece = new THREE.Mesh(knotGeo, new THREE.MeshPhongMaterial({ color: 0xec4899, shininess: 40 }));
            piece.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 5 - 2);
            riddlesGroup.add(piece);
            pieces.push(piece);
          }
        }

        environmentGroup.add(riddlesGroup);

        customUpdate = (time) => {
          qMark.rotation.y = time * 0.55;
          qMark.rotation.x = Math.sin(time) * 0.1;
          pieces.forEach((piece, i) => {
            piece.rotation.x += 0.015;
            piece.rotation.y += 0.01;
            piece.position.y += Math.sin(time * 1.2 + i) * 0.002;
          });
        };

      } else if (round === 'tech') {
        // --- TECH Environment (Holo-grid & Matrix Streams) ---
        mainLightColor = 0x3b82f6;
        colorLightColor = 0x10b981;
        pColor1 = 0x3b82f6;
        pColor2 = 0x10b981;

        // Perspectival Grid helper (Emerald/Blue)
        gridHelper = new THREE.GridHelper(30, 20, 0x10b981, 0x111827);
        gridHelper.position.y = -3.2;
        gridHelper.rotation.x = 0.08;
        scene.add(gridHelper);

        const techCore = new THREE.Group();
        const hexGeo = new THREE.IcosahedronGeometry(1.6, 1);
        const hex = new THREE.Mesh(hexGeo, holographicMat);
        techCore.add(hex);

        techCore.position.set(0, 0, -2);
        environmentGroup.add(techCore);

        customUpdate = (time) => {
          techCore.rotation.y = time * 0.3;
          techCore.rotation.x = time * 0.1;
          gridHelper.position.z = (time * 2.5) % 1.5 - 0.75; // Scrolling motion
        };
      }

      // 7. Transition background particles colors
      const colors = particles.geometry.attributes.color.array;
      for (let i = 0; i < particleCount; i++) {
        const c = new THREE.Color(i % 2 === 0 ? pColor1 : pColor2);
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      particles.geometry.attributes.color.needsUpdate = true;

      // Update light targets
      mainLight.color.setHex(mainLightColor);
      colorLight.color.setHex(colorLightColor);
    };

    // Build initial
    buildEnvironment(currentRound);

    // Mouse movement listener
    const onMouseMove = (e) => {
      // Scale coordinates from -1 to 1
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // 8. Animation loop
    const clock = new THREE.Clock();
    let animId = null;
    let lastRound = currentRound;

    const tick = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Detect round switches
      if (roundRef.current !== lastRound) {
        lastRound = roundRef.current;
        // Start transition phase
        transitionProgress = 0.0;
        previousBgColor.setHex(getBgColor(lastRound === 'landing' ? 'landing' : lastRound));
        targetBgColor.setHex(getBgColor(roundRef.current));
      }

      // Smoothly update transition progress
      if (transitionProgress < 1.0) {
        transitionProgress += delta * 1.5; // ~0.66 seconds transition duration
        if (transitionProgress >= 1.0) {
          transitionProgress = 1.0;
          buildEnvironment(lastRound); // Fully instantiate the new meshes
        }

        // 9. Camera Sweep Transition animation
        // Pull camera way back (Z=14) and rotate, then slide back in (Z=8)
        const t = transitionProgress;
        // Cosine ease-in-out curve
        const ease = 0.5 - Math.cos(t * Math.PI) * 0.5;

        // Zoom camera back & in
        if (ease < 0.5) {
          // First half: zoom out and spin
          targetCameraZ = 8 + (ease * 2) * 6; // Move back up to 14
          transitionAngle = (ease * 2) * Math.PI; // Spin 180 degrees
        } else {
          // Second half: slide back in
          targetCameraZ = 14 - ((ease - 0.5) * 2) * 6; // Slide back to 8
          transitionAngle = Math.PI + ((ease - 0.5) * 2) * Math.PI; // Complete spin
        }

        // Interpolate ambient color and fog color
        const lerpColor = previousBgColor.clone().lerp(targetBgColor, ease);
        scene.background.copy(lerpColor);
        scene.fog.color.copy(lerpColor);
      } else {
        // Calm steady camera state
        targetCameraZ = 8;
        transitionAngle = 0;
      }

      // 10. Interactive mouse-drift parallax (Lerping)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Combine transition zoom, rotation, and mouse drift
      camera.position.x = mouseRef.current.x * 1.2 + Math.sin(transitionAngle) * 2;
      camera.position.y = mouseRef.current.y * 0.8;
      camera.position.z = targetCameraZ + Math.cos(transitionAngle) * 1.5;
      camera.lookAt(0, 0, 0);

      // Background mesh drift rotation
      environmentGroup.rotation.y = Math.sin(time * 0.05) * 0.1;
      environmentGroup.rotation.x = Math.cos(time * 0.05) * 0.05;

      // Update custom animations (film reels spin, columns flicker, hex spins, tech scrolls)
      customUpdate(time);

      // Animate particles
      if (particles) {
        if (lastRound === 'tech') {
          // Fall down (matrix code rain)
          const positions = particles.geometry.attributes.position.array;
          for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 1] -= 0.06;
            if (positions[i * 3 + 1] < -5) {
              positions[i * 3 + 1] = 5;
            }
          }
          particles.geometry.attributes.position.needsUpdate = true;
        } else if (lastRound === 'history') {
          // Warm embers rise up
          const positions = particles.geometry.attributes.position.array;
          for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 1] += 0.025;
            positions[i * 3] += Math.sin(time * 0.5 + i) * 0.006;
            if (positions[i * 3 + 1] > 5) {
              positions[i * 3 + 1] = -5;
            }
          }
          particles.geometry.attributes.position.needsUpdate = true;
        } else {
          // Slow floating dust
          particles.rotation.y = time * 0.02;
          particles.rotation.x = Math.sin(time * 0.04) * 0.04;
        }
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    tick();

    // Handle resize
    const handleResize = () => {
      if (!renderer || !camera) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      
      // Dispose meshes
      while (environmentGroup.children.length > 0) {
        const obj = environmentGroup.children[0];
        environmentGroup.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      }

      if (particles) {
        scene.remove(particles);
        particleGeometry.dispose();
        particleMaterial.dispose();
      }

      renderer.dispose();
    };
  }, []); // Run ONCE at mount, internally listens to roundRef

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 transition-colors duration-700"
      style={{ display: 'block' }}
    />
  );
}
