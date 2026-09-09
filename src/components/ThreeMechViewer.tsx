import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Layers, 
  Maximize2, 
  Activity, 
  Zap, 
  Gauge, 
  Play, 
  Pause,
  RotateCcw
} from 'lucide-react';

interface ThreeMechViewerProps {
  className?: string;
}

export const ThreeMechViewer: React.FC<ThreeMechViewerProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for user controls
  const [wireframe, setWireframe] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [motionMode, setMotionMode] = useState<'bci-cycle' | 'tremor-suppression' | 'manual'>('bci-cycle');
  const [activeJointAngle, setActiveJointAngle] = useState({ shoulder: 0, elbow: 0, wrist: 0 });
  const [telemetry, setTelemetry] = useState({
    eegPower: 84.5,
    decodingLatency: 38.2,
    actuatorTorque: 3.4,
    status: 'ACTIVE_CLOSED_LOOP'
  });

  const controlsRef = useRef<{
    setWireframe: (val: boolean) => void;
    setExploded: (val: boolean) => void;
    setMode: (mode: 'bci-cycle' | 'tremor-suppression' | 'manual') => void;
    resetView: () => void;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(14, 12, 16);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Orbit controls
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.maxDistance = 35;
    orbitControls.minDistance = 6;
    orbitControls.target.set(0, 4, 0);

    // Grid helper with Royal Green and Gold aesthetic
    const gridHelper = new THREE.GridHelper(24, 24, 0xCBA95D, 0x1c3a27);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Circular radar ring on the base
    const ringGeo = new THREE.RingGeometry(3.8, 4.0, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xCBA95D,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    scene.add(ringMesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff8ee, 2.2);
    mainLight.position.set(15, 25, 15);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const greenBackLight = new THREE.DirectionalLight(0x2C5F3E, 3.5);
    greenBackLight.position.set(-15, 10, -15);
    scene.add(greenBackLight);

    const goldRimLight = new THREE.PointLight(0xCBA95D, 2.5, 30);
    goldRimLight.position.set(0, 10, 5);
    scene.add(goldRimLight);

    // Materials: Royal Green (#2C5F3E), Polished Gold (#CBA95D), Forest Dark (#112116)
    const forestDarkMat = new THREE.MeshStandardMaterial({
      color: 0x112116,
      roughness: 0.4,
      metalness: 0.8,
    });

    const polishedGoldMat = new THREE.MeshStandardMaterial({
      color: 0xCBA95D,
      roughness: 0.25,
      metalness: 0.9,
    });

    const royalGreenMat = new THREE.MeshStandardMaterial({
      color: 0x2C5F3E,
      roughness: 0.35,
      metalness: 0.65,
    });

    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xddc6a4,
      roughness: 0.2,
      metalness: 0.85,
      emissive: 0x3d2e11,
      emissiveIntensity: 0.3
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xCBA95D,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });

    const materialsList = [forestDarkMat, polishedGoldMat, royalGreenMat, goldAccentMat];

    // ==========================================
    // Construct Articulated Biomechatronic Robotic Arm
    // ==========================================
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Pedestal / Base Mount
    const baseGroup = new THREE.Group();
    const basePlate = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.0, 0.6, 32), forestDarkMat);
    basePlate.position.y = 0.3;
    basePlate.castShadow = true;
    basePlate.receiveShadow = true;
    baseGroup.add(basePlate);

    const baseTurntable = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.8, 32), polishedGoldMat);
    baseTurntable.position.y = 1.0;
    baseGroup.add(baseTurntable);

    // Base encoder ring
    const encoderRing = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.08, 16, 64), goldAccentMat);
    encoderRing.position.y = 1.0;
    encoderRing.rotation.x = Math.PI / 2;
    baseGroup.add(encoderRing);

    rootGroup.add(baseGroup);

    // 2. Shoulder Assembly (Joint 1 - Yaw & Pitch)
    const shoulderGroup = new THREE.Group();
    shoulderGroup.position.y = 1.4;

    const shoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 32), polishedGoldMat);
    shoulderJoint.position.y = 1.0;
    shoulderGroup.add(shoulderJoint);

    const shoulderBearingCap = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.4, 32), royalGreenMat);
    shoulderBearingCap.position.set(0, 1.0, 0);
    shoulderBearingCap.rotation.z = Math.PI / 2;
    shoulderGroup.add(shoulderBearingCap);

    rootGroup.add(shoulderGroup);

    // 3. Upper Arm Link (Humeral Link) with Tendon Guides
    const upperArmGroup = new THREE.Group();
    upperArmGroup.position.set(0, 1.0, 0);
    shoulderGroup.add(upperArmGroup);

    // Dual forest green spars
    const sparGeo = new THREE.BoxGeometry(0.5, 4.5, 0.8);
    const sparLeft = new THREE.Mesh(sparGeo, royalGreenMat);
    sparLeft.position.set(-0.9, 2.4, 0);
    upperArmGroup.add(sparLeft);

    const sparRight = new THREE.Mesh(sparGeo, royalGreenMat);
    sparRight.position.set(0.9, 2.4, 0);
    upperArmGroup.add(sparRight);

    // Central SEA Spring cylinder (Series Elastic Actuator)
    const seaCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 3.2, 24), forestDarkMat);
    seaCylinder.position.set(0, 2.4, 0);
    upperArmGroup.add(seaCylinder);

    // Actuator telemetry coil rings (Gold)
    for (let i = 0; i < 5; i++) {
      const coil = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 12, 32), polishedGoldMat);
      coil.position.set(0, 1.4 + i * 0.5, 0);
      coil.rotation.x = Math.PI / 2;
      upperArmGroup.add(coil);
    }

    // 4. Elbow Assembly (Joint 2 - Pitch)
    const elbowGroup = new THREE.Group();
    elbowGroup.position.set(0, 4.8, 0);
    upperArmGroup.add(elbowGroup);

    const elbowPivot = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.4, 32), polishedGoldMat);
    elbowPivot.rotation.z = Math.PI / 2;
    elbowGroup.add(elbowPivot);

    const elbowCapL = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.2, 32), royalGreenMat);
    elbowCapL.position.x = -1.25;
    elbowCapL.rotation.z = Math.PI / 2;
    elbowGroup.add(elbowCapL);

    const elbowCapR = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.2, 32), royalGreenMat);
    elbowCapR.position.x = 1.25;
    elbowCapR.rotation.z = Math.PI / 2;
    elbowGroup.add(elbowCapR);

    // 5. Forearm Link (Radial/Ulnar segment)
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, 0, 0);
    elbowGroup.add(forearmGroup);

    const forearmGeo = new THREE.CylinderGeometry(0.8, 1.1, 4.0, 16);
    const forearmMesh = new THREE.Mesh(forearmGeo, royalGreenMat);
    forearmMesh.position.set(0, 2.2, 0);
    forearmGroup.add(forearmMesh);

    // Embedded EMG Sensor Ring
    const emgRing = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.6, 24), forestDarkMat);
    emgRing.position.set(0, 1.2, 0);
    forearmGroup.add(emgRing);

    // Electrodes on the ring
    for (let e = 0; e < 8; e++) {
      const angle = (e / 8) * Math.PI * 2;
      const electrode = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.3, 0.18), polishedGoldMat);
      electrode.position.set(Math.cos(angle) * 1.18, 1.2, Math.sin(angle) * 1.18);
      forearmGroup.add(electrode);
    }

    // 6. Wrist & Biomechatronic Hand (End-Effector)
    const wristGroup = new THREE.Group();
    wristGroup.position.set(0, 4.2, 0);
    forearmGroup.add(wristGroup);

    const wristGimbal = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 24), polishedGoldMat);
    wristGroup.add(wristGimbal);

    // Palm structure
    const palm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 0.6), royalGreenMat);
    palm.position.set(0, 1.0, 0);
    wristGroup.add(palm);

    // 4 Articulated Prosthetic Fingers + Thumb
    const fingers: THREE.Group[] = [];
    const fingerPositions = [-0.65, -0.22, 0.22, 0.65];

    fingerPositions.forEach((xPos) => {
      const fingerGroup = new THREE.Group();
      fingerGroup.position.set(xPos, 1.6, 0);

      // Proximal phalanx
      const prox = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.7, 0.32), polishedGoldMat);
      prox.position.y = 0.35;
      fingerGroup.add(prox);

      // Distal phalanx
      const distGroup = new THREE.Group();
      distGroup.position.set(0, 0.7, 0);
      const dist = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.6, 0.28), goldAccentMat);
      dist.position.y = 0.3;
      distGroup.add(dist);
      fingerGroup.add(distGroup);

      wristGroup.add(fingerGroup);
      fingers.push(fingerGroup);
    });

    // Thumb (Opposable)
    const thumbGroup = new THREE.Group();
    thumbGroup.position.set(-0.95, 0.8, 0.2);
    thumbGroup.rotation.z = 0.6;
    thumbGroup.rotation.y = 0.4;
    const thumbProx = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.3), polishedGoldMat);
    thumbProx.position.y = 0.3;
    thumbGroup.add(thumbProx);
    const thumbDist = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.5, 0.26), goldAccentMat);
    thumbDist.position.set(0, 0.8, 0);
    thumbGroup.add(thumbDist);
    wristGroup.add(thumbGroup);
    fingers.push(thumbGroup);

    // Exploded positions tracking
    const originalPositions = {
      baseTurntable: baseTurntable.position.clone(),
      shoulderGroup: shoulderGroup.position.clone(),
      sparLeft: sparLeft.position.clone(),
      sparRight: sparRight.position.clone(),
      seaCylinder: seaCylinder.position.clone(),
      elbowGroup: elbowGroup.position.clone(),
      forearmGroup: forearmGroup.position.clone(),
      wristGroup: wristGroup.position.clone(),
      palm: palm.position.clone()
    };

    let currentMode = motionMode;
    let isExploded = exploded;

    controlsRef.current = {
      setWireframe: (val: boolean) => {
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh && (child as unknown) !== gridHelper && child !== ringMesh) {
            child.material = val ? wireMat : materialsList[Math.floor(Math.random() * materialsList.length)];
          }
        });
        if (!val) {
          basePlate.material = forestDarkMat;
          baseTurntable.material = polishedGoldMat;
          sparLeft.material = royalGreenMat;
          sparRight.material = royalGreenMat;
          seaCylinder.material = forestDarkMat;
          elbowPivot.material = polishedGoldMat;
          forearmMesh.material = royalGreenMat;
          palm.material = royalGreenMat;
        }
      },
      setExploded: (val: boolean) => {
        isExploded = val;
      },
      setMode: (mode) => {
        currentMode = mode;
      },
      resetView: () => {
        camera.position.set(14, 12, 16);
        orbitControls.target.set(0, 4, 0);
      }
    };

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      orbitControls.update();

      if (isAnimating) {
        rootGroup.rotation.y = Math.sin(elapsed * 0.25) * 0.4;
      }

      if (currentMode === 'bci-cycle') {
        const reachT = elapsed * 1.8;
        const shoulderPitch = Math.sin(reachT) * 0.35 + 0.1;
        const elbowPitch = Math.cos(reachT) * 0.55 - 0.4;
        const wristYaw = Math.sin(reachT * 1.2) * 0.25;

        upperArmGroup.rotation.z = shoulderPitch;
        elbowGroup.rotation.z = elbowPitch;
        wristGroup.rotation.y = wristYaw;

        const grasp = Math.max(0, Math.sin(reachT));
        fingers.forEach((f, i) => {
          f.rotation.z = grasp * (0.8 + i * 0.05);
        });

        setActiveJointAngle({
          shoulder: Math.round((shoulderPitch * 180) / Math.PI),
          elbow: Math.round((elbowPitch * 180) / Math.PI),
          wrist: Math.round((wristYaw * 180) / Math.PI)
        });

        setTelemetry({
          eegPower: +(78 + Math.sin(elapsed * 4) * 12).toFixed(1),
          decodingLatency: +(38 + Math.cos(elapsed * 3) * 4).toFixed(1),
          actuatorTorque: +(3.2 + Math.abs(Math.sin(reachT)) * 2.8).toFixed(1),
          status: 'ACTIVE_CLOSED_LOOP'
        });

      } else if (currentMode === 'tremor-suppression') {
        const tremorFreq = elapsed * Math.PI * 2 * 6;
        const rawTremor = Math.sin(tremorFreq) * 0.18;
        const suppressedAngle = rawTremor * 0.15;

        upperArmGroup.rotation.z = 0.2;
        elbowGroup.rotation.z = -0.4;
        wristGroup.rotation.z = suppressedAngle;

        setActiveJointAngle({
          shoulder: 12,
          elbow: -23,
          wrist: Math.round(suppressedAngle * 180 / Math.PI)
        });

        setTelemetry({
          eegPower: +(92 + Math.random() * 5).toFixed(1),
          decodingLatency: 35.4,
          actuatorTorque: +(4.8 + Math.sin(tremorFreq) * 1.6).toFixed(1),
          status: 'TREMOR_SUPPRESSION_ENGAGED'
        });

      } else {
        upperArmGroup.rotation.z = 0.1;
        elbowGroup.rotation.z = -0.2;
        wristGroup.rotation.z = 0;
      }

      const explodeFactor = isExploded ? 1.8 : 0.0;
      sparLeft.position.x = THREE.MathUtils.lerp(sparLeft.position.x, originalPositions.sparLeft.x - explodeFactor * 0.8, 0.1);
      sparRight.position.x = THREE.MathUtils.lerp(sparRight.position.x, originalPositions.sparRight.x + explodeFactor * 0.8, 0.1);
      elbowCapL.position.x = THREE.MathUtils.lerp(elbowCapL.position.x, -1.25 - explodeFactor * 0.7, 0.1);
      elbowCapR.position.x = THREE.MathUtils.lerp(elbowCapR.position.x, 1.25 + explodeFactor * 0.7, 0.1);
      wristGroup.position.y = THREE.MathUtils.lerp(wristGroup.position.y, originalPositions.wristGroup.y + explodeFactor * 1.5, 0.1);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    controlsRef.current?.setWireframe(wireframe);
  }, [wireframe]);

  useEffect(() => {
    controlsRef.current?.setExploded(exploded);
  }, [exploded]);

  useEffect(() => {
    controlsRef.current?.setMode(motionMode);
  }, [motionMode]);

  return (
    <div className={`relative w-full border border-[#CBA95D]/30 bg-[#0e1e15] shadow-2xl ${className}`}>
      {/* 3D Canvas */}
      <div 
        ref={containerRef} 
        className="w-full h-[460px] md:h-[540px] cursor-grab active:cursor-grabbing"
      />

      {/* Top Left: Lab Tag & Status (Sharp, Classical Border) */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none font-serif">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0a160f]/90 border border-[#CBA95D]/40 text-xs font-mono text-[#CBA95D] tracking-wider">
          <span className="w-2 h-2 bg-[#CBA95D] animate-ping" />
          <span>BYU NEURO-MECHATRONICS 3D TWIN</span>
        </div>
        <div className="text-[11px] font-mono text-[#DDC6A4] bg-[#0a160f]/80 px-2.5 py-1 border border-[#2C5F3E] flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#CBA95D]" />
          <span>Status: <strong className="text-[#F1F1F1]">{telemetry.status}</strong></span>
        </div>
      </div>

      {/* Top Right: Telemetry (Sharp, Classical) */}
      <div className="absolute top-4 right-4 hidden sm:flex flex-col gap-1.5 font-mono text-xs bg-[#0a160f]/90 border border-[#CBA95D]/30 p-3.5 pointer-events-none min-w-[180px]">
        <div className="flex justify-between items-center text-[#DDC6A4] border-b border-[#2C5F3E] pb-1.5 mb-1 font-serif">
          <span className="flex items-center gap-1.5 text-[#CBA95D] font-bold">
            <Zap className="w-3.5 h-3.5" /> BCI Telemetry
          </span>
          <span className="text-[10px] text-[#CBA95D] tracking-wider">ONLINE</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#DDC6A4]/70">Decoding Latency:</span>
          <span className="text-[#CBA95D] font-semibold">{telemetry.decodingLatency} ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#DDC6A4]/70">Cortical Power:</span>
          <span className="text-[#F1F1F1] font-semibold">{telemetry.eegPower} µV²</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#DDC6A4]/70">SEA Torque:</span>
          <span className="text-[#CBA95D] font-semibold">{telemetry.actuatorTorque} Nm</span>
        </div>
        <div className="flex justify-between border-t border-[#2C5F3E] pt-1.5 mt-1 text-[11px]">
          <span className="text-[#DDC6A4]/70">Joints [S/E/W]:</span>
          <span className="text-[#F1F1F1]">{activeJointAngle.shoulder}° / {activeJointAngle.elbow}° / {activeJointAngle.wrist}°</span>
        </div>
      </div>

      {/* Bottom: Professional Architectural Controls (Sharp Corners) */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#0a160f]/95 border border-[#CBA95D]/30">
        {/* Motion Modes */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMotionMode('bci-cycle')}
            className={`px-3 py-1.5 text-xs font-mono transition-all flex items-center gap-1.5 ${
              motionMode === 'bci-cycle'
                ? 'bg-[#2C5F3E] text-[#F1F1F1] border border-[#CBA95D]/70 font-semibold'
                : 'text-[#DDC6A4] hover:text-[#F1F1F1] hover:bg-[#162e20] border border-transparent'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#CBA95D]" />
            <span>BCI Reach Cycle</span>
          </button>

          <button
            onClick={() => setMotionMode('tremor-suppression')}
            className={`px-3 py-1.5 text-xs font-mono transition-all flex items-center gap-1.5 ${
              motionMode === 'tremor-suppression'
                ? 'bg-[#2C5F3E] text-[#F1F1F1] border border-[#CBA95D]/70 font-semibold'
                : 'text-[#DDC6A4] hover:text-[#F1F1F1] hover:bg-[#162e20] border border-transparent'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-[#CBA95D]" />
            <span>Tremor Suppression</span>
          </button>
        </div>

        {/* CAD & View Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-2.5 py-1.5 text-xs font-mono transition-all flex items-center gap-1.5 ${
              wireframe 
                ? 'bg-[#2C5F3E] text-[#CBA95D] border border-[#CBA95D]' 
                : 'text-[#DDC6A4] hover:text-[#F1F1F1] hover:bg-[#162e20] border border-transparent'
            }`}
            title="Toggle Wireframe CAD Mode"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Wireframe</span>
          </button>

          <button
            onClick={() => setExploded(!exploded)}
            className={`px-2.5 py-1.5 text-xs font-mono transition-all flex items-center gap-1.5 ${
              exploded 
                ? 'bg-[#2C5F3E] text-[#CBA95D] border border-[#CBA95D]' 
                : 'text-[#DDC6A4] hover:text-[#F1F1F1] hover:bg-[#162e20] border border-transparent'
            }`}
            title="Exploded Mechanical Assembly View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Exploded CAD</span>
          </button>

          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="p-1.5 text-[#DDC6A4] hover:text-[#CBA95D] hover:bg-[#162e20] transition-all border border-transparent hover:border-[#2C5F3E]"
            title={isAnimating ? "Pause Rotation" : "Resume Rotation"}
          >
            {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => controlsRef.current?.resetView()}
            className="p-1.5 text-[#DDC6A4] hover:text-[#CBA95D] hover:bg-[#162e20] transition-all border border-transparent hover:border-[#2C5F3E]"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
