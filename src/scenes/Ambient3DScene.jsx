import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Ambient3DScene({ currentRound }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Device detection
    const width = window.innerWidth;
    const isMobile = width < 768;
    
    // 1. Setup Renderer & Scene
    const scene = new THREE.Scene();
    
    // Set initial background based on active round
    const getBgColor = (round) => {
      switch (round) {
        case 'movies': return 0x0a0104; // Deep cinematic maroon/black
        case 'gk': return 0x010c12;     // Deep teal/black
        case 'history': return 0x120e03; // Warm bronze/black
        case 'riddles': return 0x0c0114; // Mysterious indigo/black
        case 'tech': return 0x00080f;    // Futuristic dark blue/black
        default: return 0x030008;       // Landing space dark purple
      }
    };
    
    scene.background = new THREE.Color(getBgColor(currentRound));
    scene.fog = new THREE.FogExp2(getBgColor(currentRound), 0.05);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: !isMobile, // Disable antialiasing on mobile for performance
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 2. Setup Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xffffff, 1.5, 50);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const colorLight = new THREE.PointLight(0xaa3bff, 2, 30);
    colorLight.position.set(-5, -3, 2);
    scene.add(colorLight);

    // 3. Create Group for objects
    const group = new THREE.Group();
    scene.add(group);

    // Reusable structures
    let particles = null;
    let particleCount = isMobile ? 80 : 350; // Drastically reduced on mobile
    let particleGeometry = null;
    let particleMaterial = null;
    let gridHelper = null;

    // Track active rotation and updates in animation loop
    let customUpdate = () => {};

    // 4. Function to populate the scene based on the active round
    const buildSceneElements = (round) => {
      // Clear previous group items
      while (group.children.length > 0) {
        const obj = group.children[0];
        group.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      }

      // Clear particles if they exist
      if (particles) {
        scene.remove(particles);
        if (particleGeometry) particleGeometry.dispose();
        if (particleMaterial) particleMaterial.dispose();
        particles = null;
      }

      // Clear grid
      if (gridHelper) {
        scene.remove(gridHelper);
        gridHelper = null;
      }

      // Set target fog & light colors
      const bgColor = getBgColor(round);
      scene.background.setHex(bgColor);
      scene.fog.color.setHex(bgColor);

      const particlePositions = new Float32Array(particleCount * 3);
      const particleColors = new Float32Array(particleCount * 3);
      
      let mainLightColor = 0xffffff;
      let colorLightColor = 0xaa3bff;
      let particleColorHex = 0xaa3bff;

      // Build objects based on round
      if (round === 'landing' || !round) {
        // --- LANDING HERO ---
        mainLightColor = 0xffd700; // Gold
        colorLightColor = 0x8b5cf6; // Purple
        particleColorHex = 0xd8b4fe;

        // Trophy Mesh (simplified cylinder, ring, cone)
        const trophyGroup = new THREE.Group();
        
        const cupGeo = new THREE.CylinderGeometry(1.5, 0.8, 2.2, 16);
        const goldMat = new THREE.MeshPhongMaterial({
          color: 0xffd700,
          shininess: 100,
          specular: 0xffffff,
          emissive: 0x3a2d00
        });
        const cup = new THREE.Mesh(cupGeo, goldMat);
        cup.position.y = 0.5;
        trophyGroup.add(cup);

        const stemGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 8);
        const stem = new THREE.Mesh(stemGeo, goldMat);
        stem.position.y = -1;
        trophyGroup.add(stem);

        const baseGeo = new THREE.CylinderGeometry(1.2, 1.5, 0.6, 8);
        const baseMat = new THREE.MeshPhongMaterial({ color: 0x1f2937, shininess: 30 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = -1.8;
        trophyGroup.add(base);

        // Handles (torus cut in half)
        const handleGeo = new THREE.TorusGeometry(0.8, 0.15, 8, 24, Math.PI);
        const leftHandle = new THREE.Mesh(handleGeo, goldMat);
        leftHandle.position.set(-1.1, 0.6, 0);
        leftHandle.rotation.z = Math.PI / 2;
        trophyGroup.add(leftHandle);

        const rightHandle = leftHandle.clone();
        rightHandle.position.x = 1.1;
        rightHandle.rotation.z = -Math.PI / 2;
        trophyGroup.add(rightHandle);

        group.add(trophyGroup);

        // Ambient floating shapes
        if (!isMobile) {
          const shapes = [];
          const geos = [
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.IcosahedronGeometry(0.4),
            new THREE.TorusGeometry(0.3, 0.1, 8, 16)
          ];
          const shapeMat = new THREE.MeshPhongMaterial({ color: 0xaa3bff, shininess: 50, transparent: true, opacity: 0.7 });

          for (let i = 0; i < 6; i++) {
            const mesh = new THREE.Mesh(geos[i % geos.length], shapeMat);
            mesh.position.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 5 - 2);
            group.add(mesh);
            shapes.push(mesh);
          }

          customUpdate = (time) => {
            trophyGroup.rotation.y = time * 0.5;
            trophyGroup.rotation.x = Math.sin(time) * 0.1;
            trophyGroup.position.y = Math.sin(time * 2) * 0.15;
            
            shapes.forEach((s, idx) => {
              s.rotation.x += 0.01;
              s.rotation.y += 0.015;
              s.position.y += Math.sin(time + idx) * 0.003;
            });
          };
        } else {
          customUpdate = (time) => {
            trophyGroup.rotation.y = time * 0.4;
          };
        }

        // Particle cloud (Slow space dust)
        for (let i = 0; i < particleCount; i++) {
          particlePositions[i * 3] = (Math.random() - 0.5) * 20;
          particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
          particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;

          const color = new THREE.Color(i % 2 === 0 ? 0xffd700 : 0xaa3bff);
          particleColors[i * 3] = color.r;
          particleColors[i * 3 + 1] = color.g;
          particleColors[i * 3 + 2] = color.b;
        }

      } else if (round === 'movies') {
        // --- MOVIES ROUND (Red Accent, Spotlights & Reels) ---
        mainLightColor = 0xef4444; // Red
        colorLightColor = 0xeab308; // Gold
        particleColorHex = 0xef4444;

        // Film Reel mesh
        const reelGroup = new THREE.Group();
        const reelGeo = new THREE.CylinderGeometry(2, 2, 0.4, 32);
        const silverMat = new THREE.MeshPhongMaterial({ color: 0x9ca3af, shininess: 80, specular: 0xffffff });
        const mainReel = new THREE.Mesh(reelGeo, silverMat);
        mainReel.rotation.x = Math.PI / 2;
        reelGroup.add(mainReel);

        // Core/Film strip wrapped
        const innerGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.35, 16);
        const filmMat = new THREE.MeshPhongMaterial({ color: 0x111827, shininess: 10 });
        const innerFilm = new THREE.Mesh(innerGeo, filmMat);
        innerFilm.rotation.x = Math.PI / 2;
        reelGroup.add(innerFilm);

        // Spotlights (cones) representing projector rays
        const spotGroup = new THREE.Group();
        if (!isMobile) {
          const coneGeo = new THREE.ConeGeometry(1.5, 8, 16, 1, true);
          const coneMat = new THREE.MeshBasicMaterial({
            color: 0xeab308,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
          });
          
          const spot1 = new THREE.Mesh(coneGeo, coneMat);
          spot1.position.set(-4, 0, -3);
          spot1.rotation.z = -Math.PI / 6;
          spotGroup.add(spot1);

          const spot2 = new THREE.Mesh(coneGeo, coneMat);
          spot2.position.set(4, 0, -3);
          spot2.rotation.z = Math.PI / 6;
          spotGroup.add(spot2);

          group.add(spotGroup);
        }

        group.add(reelGroup);

        customUpdate = (time) => {
          reelGroup.rotation.z = time * 0.3;
          reelGroup.rotation.y = Math.sin(time * 0.5) * 0.2;
          
          if (!isMobile && spotGroup.children.length === 2) {
            spotGroup.children[0].rotation.y = Math.sin(time) * 0.15;
            spotGroup.children[1].rotation.y = Math.cos(time) * 0.15;
          }
        };

        // Rising golden/red carpet dust
        for (let i = 0; i < particleCount; i++) {
          particlePositions[i * 3] = (Math.random() - 0.5) * 18;
          particlePositions[i * 3 + 1] = Math.random() * 8 - 4;
          particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;

          const color = new THREE.Color(i % 3 === 0 ? 0xeab308 : 0xef4444);
          particleColors[i * 3] = color.r;
          particleColors[i * 3 + 1] = color.g;
          particleColors[i * 3 + 2] = color.b;
        }

      } else if (round === 'gk') {
        // --- GK ROUND (Teal/Blue Global Globe) ---
        mainLightColor = 0x14b8a6; // Teal
        colorLightColor = 0x3b82f6; // Blue
        particleColorHex = 0x14b8a6;

        // Wireframe Globe
        const globeGroup = new THREE.Group();
        const sphereGeo = new THREE.SphereGeometry(2, 16, 16);
        const sphereMat = new THREE.MeshBasicMaterial({
          color: 0x14b8a6,
          wireframe: true,
          transparent: true,
          opacity: 0.35
        });
        const globe = new THREE.Mesh(sphereGeo, sphereMat);
        globeGroup.add(globe);

        // Orbital ring
        const ringGeo = new THREE.TorusGeometry(2.6, 0.03, 8, 64);
        const ringMat = new THREE.MeshPhongMaterial({ color: 0x3b82f6, emissive: 0x002244 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 3;
        globeGroup.add(ring);

        group.add(globeGroup);

        customUpdate = (time) => {
          globeGroup.rotation.y = time * 0.2;
          globeGroup.rotation.x = time * 0.05;
          ring.rotation.z = -time * 0.4;
        };

        // Constellation stars/nodes
        for (let i = 0; i < particleCount; i++) {
          const u = Math.random();
          const v = Math.random();
          const theta = u * 2.0 * Math.PI;
          const phi = Math.acos(2.0 * v - 1.0);
          const r = 2.8 + Math.random() * 4; // Orbit around globe

          particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          particlePositions[i * 3 + 2] = r * Math.cos(phi) - 2;

          const color = new THREE.Color(i % 2 === 0 ? 0x14b8a6 : 0x3b82f6);
          particleColors[i * 3] = color.r;
          particleColors[i * 3 + 1] = color.g;
          particleColors[i * 3 + 2] = color.b;
        }

      } else if (round === 'history') {
        // --- HISTORY ROUND (Bronze Temple Columns) ---
        mainLightColor = 0xd97706; // Amber/Gold
        colorLightColor = 0xb45309; // Dark Bronze
        particleColorHex = 0xf59e0b;

        // Ancient pillars
        const columnGroup = new THREE.Group();
        const pillarGeo = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 8);
        const baseGeo = new THREE.BoxGeometry(0.8, 0.4, 0.8);
        const bronzeMat = new THREE.MeshPhongMaterial({ color: 0xb45309, shininess: 10 });

        // Build 2 columns on sides
        const col1 = new THREE.Group();
        col1.add(new THREE.Mesh(pillarGeo, bronzeMat));
        const base1 = new THREE.Mesh(baseGeo, bronzeMat);
        base1.position.y = -1.8;
        const cap1 = new THREE.Mesh(baseGeo, bronzeMat);
        cap1.position.y = 1.8;
        col1.add(base1);
        col1.add(cap1);
        col1.position.set(-4, -0.5, -2);
        columnGroup.add(col1);

        const col2 = col1.clone();
        col2.position.x = 4;
        columnGroup.add(col2);

        group.add(columnGroup);

        customUpdate = (time) => {
          columnGroup.position.y = Math.sin(time) * 0.1;
          col1.rotation.y = time * 0.15;
          col2.rotation.y = -time * 0.15;
        };

        // Rising ash/parchment particles
        for (let i = 0; i < particleCount; i++) {
          particlePositions[i * 3] = (Math.random() - 0.5) * 16;
          particlePositions[i * 3 + 1] = (Math.random() * 10) - 5; // Float upwards
          particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;

          const color = new THREE.Color(0xf59e0b);
          particleColors[i * 3] = color.r;
          particleColors[i * 3 + 1] = color.g;
          particleColors[i * 3 + 2] = color.b;
        }

      } else if (round === 'riddles') {
        // --- RIDDLES ROUND (Indigo Mysterious void with question marks) ---
        mainLightColor = 0xa855f7; // Purple
        colorLightColor = 0xec4899; // Pink
        particleColorHex = 0xa855f7;

        // Floating geometric question mark
        const riddleGroup = new THREE.Group();
        
        // Let's build a glowing dot and a hook
        const hookGeo = new THREE.TorusGeometry(0.8, 0.2, 8, 24, Math.PI * 1.3);
        const glowMat = new THREE.MeshPhongMaterial({ color: 0xa855f7, emissive: 0x220044, shininess: 80 });
        const hook = new THREE.Mesh(hookGeo, glowMat);
        hook.position.y = 0.5;
        riddleGroup.add(hook);

        const stemGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 8);
        const stem = new THREE.Mesh(stemGeo, glowMat);
        stem.position.set(0.5, -0.3, 0);
        stem.rotation.z = -Math.PI / 6;
        riddleGroup.add(stem);

        const dotGeo = new THREE.SphereGeometry(0.25, 12, 12);
        const dot = new THREE.Mesh(dotGeo, glowMat);
        dot.position.set(0.5, -1, 0);
        riddleGroup.add(dot);

        // Adjust anchor point so it spins nicely
        riddleGroup.position.set(-0.2, 0, 0);
        group.add(riddleGroup);

        customUpdate = (time) => {
          riddleGroup.rotation.y = time * 0.6;
          riddleGroup.rotation.x = Math.sin(time) * 0.15;
          riddleGroup.position.y = Math.sin(time * 1.5) * 0.2;
        };

        // Sparkling mystery stars
        for (let i = 0; i < particleCount; i++) {
          particlePositions[i * 3] = (Math.random() - 0.5) * 16;
          particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
          particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;

          const color = new THREE.Color(i % 2 === 0 ? 0xa855f7 : 0xec4899);
          particleColors[i * 3] = color.r;
          particleColors[i * 3 + 1] = color.g;
          particleColors[i * 3 + 2] = color.b;
        }

      } else if (round === 'tech') {
        // --- TECH ROUND (Neon Digital Matrix Grid) ---
        mainLightColor = 0x3b82f6; // Blue
        colorLightColor = 0x10b981; // Emerald Green
        particleColorHex = 0x10b981;

        // Ground Neon Grid
        gridHelper = new THREE.GridHelper(30, 20, 0x3b82f6, 0x10b981);
        gridHelper.position.y = -3;
        gridHelper.rotation.x = 0.1; // Slight angle
        scene.add(gridHelper);

        // Floating digital circuit ring
        const techGroup = new THREE.Group();
        const techRingGeo = new THREE.TorusGeometry(2, 0.05, 8, 64);
        const techRingMat = new THREE.MeshPhongMaterial({ color: 0x10b981, emissive: 0x003311 });
        const ring1 = new THREE.Mesh(techRingGeo, techRingMat);
        ring1.rotation.y = Math.PI / 2;
        techGroup.add(ring1);

        const ring2 = ring1.clone();
        ring2.rotation.x = Math.PI / 2;
        techGroup.add(ring2);

        group.add(techGroup);

        customUpdate = (time) => {
          techGroup.rotation.y = time * 0.4;
          techGroup.rotation.z = time * 0.2;
          gridHelper.position.z = (time * 2) % 1.5 - 0.75; // Simulate forward movement
        };

        // Falling digital code raindrops
        for (let i = 0; i < particleCount; i++) {
          particlePositions[i * 3] = (Math.random() - 0.5) * 18;
          particlePositions[i * 3 + 1] = (Math.random() * 12) - 6; // Start spread out
          particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;

          const color = new THREE.Color(i % 3 === 0 ? 0x3b82f6 : 0x10b981);
          particleColors[i * 3] = color.r;
          particleColors[i * 3 + 1] = color.g;
          particleColors[i * 3 + 2] = color.b;
        }
      }

      // Update lights
      mainLight.color.setHex(mainLightColor);
      colorLight.color.setHex(colorLightColor);

      // Create particle points
      particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

      // Custom square particle texture (programmatic canvas texture to avoid loading images)
      const particleCanvas = document.createElement('canvas');
      particleCanvas.width = 16;
      particleCanvas.height = 16;
      const ctx = particleCanvas.getContext('2d');
      const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 16, 16);
      const texture = new THREE.CanvasTexture(particleCanvas);

      particleMaterial = new THREE.PointsMaterial({
        size: isMobile ? 0.08 : 0.12,
        vertexColors: true,
        map: texture,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);
    };

    // Build initial scene
    buildSceneElements(currentRound);

    // 5. Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId = null;

    const animate = () => {
      const time = clock.getElapsedTime();

      // Slow group rotation for background drift
      group.rotation.y = Math.sin(time * 0.1) * 0.15;
      group.rotation.x = Math.cos(time * 0.1) * 0.08;

      // Update active scene custom motions
      customUpdate(time);

      // Rotate particle systems based on round
      if (particles) {
        if (currentRound === 'tech') {
          // Falling matrix-style digital rain
          const positions = particles.geometry.attributes.position.array;
          for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 1] -= 0.05; // Fall speed
            if (positions[i * 3 + 1] < -6) {
              positions[i * 3 + 1] = 6; // Reset at top
            }
          }
          particles.geometry.attributes.position.needsUpdate = true;
        } else if (currentRound === 'history') {
          // Rise like embers
          const positions = particles.geometry.attributes.position.array;
          for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 1] += 0.02; // Rise speed
            positions[i * 3] += Math.sin(time + i) * 0.005; // Swirl
            if (positions[i * 3 + 1] > 5) {
              positions[i * 3 + 1] = -5; // Reset at bottom
            }
          }
          particles.geometry.attributes.position.needsUpdate = true;
        } else {
          // Default slow drift
          particles.rotation.y = time * 0.03;
          particles.rotation.x = Math.sin(time * 0.05) * 0.05;
        }
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 6. Handle resize
    const handleResize = () => {
      if (!renderer || !camera) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      
      // Cleanup geometries & materials
      while (group.children.length > 0) {
        const obj = group.children[0];
        group.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      }

      if (particles) {
        scene.remove(particles);
        if (particleGeometry) particleGeometry.dispose();
        if (particleMaterial) particleMaterial.dispose();
      }

      if (gridHelper) {
        scene.remove(gridHelper);
      }

      renderer.dispose();
    };
  }, [currentRound]); // Run when round changes to fade/transition elements

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 transition-colors duration-1000"
      style={{ display: 'block' }}
    />
  );
}
