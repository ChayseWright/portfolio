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
    scene.background = null; // transparent to blend with dark page

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

    // Grid helper with technical blueprint aesthetic
    const gridHelper = new THREE.GridHelper(24, 24, 0x00D2FF, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Circular radar ring on the base
    const ringGeo = new THREE.RingGeometry(3.8, 4.0, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00D2FF,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    scene.add(ringMesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(15, 25, 15);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const blueBackLight = new THREE.DirectionalLight(0x0062B8, 3.0);
    blueBackLight.position.set(-15, 10, -15);
    scene.add(blueBackLight);

    const cyanRimLight = new THREE.PointLight(0x00D2FF, 2.5, 30);
    cyanRimLight.position.set(0, 10, 5);
    scene.add(cyanRimLight);

    // Materials
    const carbonFiberMat = new THREE.MeshStandardMaterial({
      color: 0x161c28,
      roughness: 0.35,
      metalness: 0.85,
    });

    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x8fa3b8,
      roughness: 0.2,
      metalness: 0.95,
    });

    const byuNavyMat = new THREE.MeshStandardMaterial({
      color: 0x002E5D,
      roughness: 0.4,
      metalness: 0.6,
    });

    const cyanAccentMat = new THREE.MeshStandardMaterial({
      color: 0x00D2FF,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x005577,
      emissiveIntensity: 0.4
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });

    const materialsList = [carbonFiberMat, titaniumMat, byuNavyMat, cyanAccentMat];

    // ==========================================
    // Construct Articulated Biomechatronic Robotic Arm
    // ==========================================
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Pedestal / Base Mount
    const baseGroup = new THREE.Group();
    const basePlate = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.0, 0.6, 32), carbonFiberMat);
    basePlate.position.y = 0.3;
    basePlate.castShadow = true;
    basePlate.receiveShadow = true;
    baseGroup.add(basePlate);

    const baseTurntable = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.8, 32), titaniumMat);
    baseTurntable.position.y = 1.0;
    baseGroup.add(baseTurntable);

    // Base encoder ring
    const encoderRing = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.08, 16, 64), cyanAccentMat);
    encoderRing.position.y = 1.0;
    encoderRing.rotation.x = Math.PI / 2;
    baseGroup.add(encoderRing);

    rootGroup.add(baseGroup);

    // 2. Shoulder Assembly (Joint 1 - Yaw & Pitch)
    const shoulderGroup = new THREE.Group();
    shoulderGroup.position.y = 1.4;

    const shoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 32), titaniumMat);
    shoulderJoint.position.y = 1.0;
    shoulderGroup.add(shoulderJoint);

    const shoulderBearingCap = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.4, 32), byuNavyMat);
    shoulderBearingCap.position.set(0, 1.0, 0);
    shoulderBearingCap.rotation.z = Math.PI / 2;
    shoulderGroup.add(shoulderBearingCap);

    rootGroup.add(shoulderGroup);

    // 3. Upper Arm Link (Humeral Link) with Tendon Guides
    const upperArmGroup = new THREE.Group();
    upperArmGroup.position.set(0, 1.0, 0);
    shoulderGroup.add(upperArmGroup);

    // Dual carbon fiber spars
    const sparGeo = new THREE.BoxGeometry(0.5, 4.5, 0.8);
    const sparLeft = new THREE.Mesh(sparGeo, carbonFiberMat);
    sparLeft.position.set(-0.9, 2.4, 0);
    upperArmGroup.add(sparLeft);

    const sparRight = new THREE.Mesh(sparGeo, carbonFiberMat);
    sparRight.position.set(0.9, 2.4, 0);
    upperArmGroup.add(sparRight);

    // Central SEA Spring cylinder (Series Elastic Actuator)
    const seaCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 3.2, 24), byuNavyMat);
    seaCylinder.position.set(0, 2.4, 0);
    upperArmGroup.add(seaCylinder);

    // Actuator telemetry coil rings
    for (let i = 0; i < 5; i++) {
      const coil = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 12, 32), cyanAccentMat);
      coil.position.set(0, 1.4 + i * 0.5, 0);
      coil.rotation.x = Math.PI / 2;
      upperArmGroup.add(coil);
    }

    // 4. Elbow Assembly (Joint 2 - Pitch)
    const elbowGroup = new THREE.Group();
    elbowGroup.position.set(0, 4.8, 0);
    upperArmGroup.add(elbowGroup);

    const elbowPivot = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.4, 32), titaniumMat);
    elbowPivot.rotation.z = Math.PI / 2;
    elbowGroup.add(elbowPivot);

    const elbowCapL = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.2, 32), cyanAccentMat);
    elbowCapL.position.x = -1.25;
    elbowCapL.rotation.z = Math.PI / 2;
    elbowGroup.add(elbowCapL);

    const elbowCapR = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.2, 32), cyanAccentMat);
    elbowCapR.position.x = 1.25;
    elbowCapR.rotation.z = Math.PI / 2;
    elbowGroup.add(elbowCapR);

    // 5. Forearm Link (Radial/Ulnar segment)
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, 0, 0);
    elbowGroup.add(forearmGroup);

    // Tapered forearm housing
    const forearmGeo = new THREE.CylinderGeometry(0.8, 1.1, 4.0, 16);
    const forearmMesh = new THREE.Mesh(forearmGeo, carbonFiberMat);
    forearmMesh.position.set(0, 2.2, 0);
    forearmGroup.add(forearmMesh);

    // Embedded EMG Sensor Ring
    const emgRing = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.6, 24), byuNavyMat);
    emgRing.position.set(0, 1.2, 0);
    forearmGroup.add(emgRing);

    // Electrodes on the ring
    for (let e = 0; e < 8; e++) {
      const angle = (e / 8) * Math.PI * 2;
      const electrode = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.3, 0.18), cyanAccentMat);
      electrode.position.set(Math.cos(angle) * 1.18, 1.2, Math.sin(angle) * 1.18);
      forearmGroup.add(electrode);
    }

    // 6. Wrist & Biomechatronic Hand (End-Effector)
    const wristGroup = new THREE.Group();
    wristGroup.position.set(0, 4.2, 0);
    forearmGroup.add(wristGroup);

    const wristGimbal = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 24), titaniumMat);
    wristGroup.add(wristGimbal);

    // Palm structure
    const palm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 0.6), carbonFiberMat);
    palm.position.set(0, 1.0, 0);
    wristGroup.add(palm);

    // 4 Articulated Prosthetic Fingers + Thumb
    const fingers: THREE.Group[] = [];
    const fingerPositions = [-0.65, -0.22, 0.22, 0.65];

    fingerPositions.forEach((xPos) => {
      const fingerGroup = new THREE.Group();
      fingerGroup.position.set(xPos, 1.6, 0);

      // Proximal phalanx
      const prox = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.7, 0.32), titaniumMat);
      prox.position.y = 0.35;
      fingerGroup.add(prox);

      // Intermediate + Distal phalanx
      const distGroup = new THREE.Group();
      distGroup.position.set(0, 0.7, 0);
      const dist = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.6, 0.28), cyanAccentMat);
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
    const thumbProx = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.3), titaniumMat);
    thumbProx.position.y = 0.3;
    thumbGroup.add(thumbProx);
    const thumbDist = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.5, 0.26), cyanAccentMat);
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

    // Store state controls
    let currentMode = motionMode;
    let isExploded = exploded;

    controlsRef.current = {
      setWireframe: (val: boolean) => {
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh && (child as unknown) !== gridHelper && child !== ringMesh) {
            child.material = val ? wireMat : materialsList[Math.floor(Math.random() * materialsList.length)];
          }
        });
        // Restore standard assignments if not wireframe
        if (!val) {
          basePlate.material = carbonFiberMat;
          baseTurntable.material = titaniumMat;
          sparLeft.material = carbonFiberMat;
          sparRight.material = carbonFiberMat;
          seaCylinder.material = byuNavyMat;
          elbowPivot.material = titaniumMat;
          forearmMesh.material = carbonFiberMat;
          palm.material = carbonFiberMat;
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

      // Slow idle rotation of entire rig if animating
      if (isAnimating) {
        rootGroup.rotation.y = Math.sin(elapsed * 0.25) * 0.4;
      }

      // Kinematic Articulation based on Motion Mode
      if (currentMode === 'bci-cycle') {
        // Natural physiological reaching & grasping cycle
        const reachT = elapsed * 1.8;
        const shoulderPitch = Math.sin(reachT) * 0.35 + 0.1;
        const elbowPitch = Math.cos(reachT) * 0.55 - 0.4;
        const wristYaw = Math.sin(reachT * 1.2) * 0.25;

        upperArmGroup.rotation.z = shoulderPitch;
        elbowGroup.rotation.z = elbowPitch;
        wristGroup.rotation.y = wristYaw;

        // Synchronous finger grasp flexing
        const grasp = Math.max(0, Math.sin(reachT));
        fingers.forEach((f, i) => {
          f.rotation.z = grasp * (0.8 + i * 0.05);
        });

        // Update displayed telemetry
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
        // High frequency pathological tremor perturbation (6 Hz) actively suppressed
        const tremorFreq = elapsed * Math.PI * 2 * 6; // 6 Hz
        const rawTremor = Math.sin(tremorFreq) * 0.18;
        // Suppressed residual amplitude
        const suppressedAngle = rawTremor * 0.15; // 85% attenuation

        upperArmGroup.rotation.z = 0.2;
        elbowGroup.rotation.z = -0.4;
        wristGroup.rotation.z = suppressedAngle;

        setActiveJointAngle({
          shoulder: 12,
          elbow: -23,
          wrist: +(suppressedAngle * 180 / Math.PI).toFixed(2) as any
        });

        setTelemetry({
          eegPower: +(92 + Math.random() * 5).toFixed(1),
          decodingLatency: 35.4,
          actuatorTorque: +(4.8 + Math.sin(tremorFreq) * 1.6).toFixed(1),
          status: 'TREMOR_SUPPRESSION_ENGAGED'
        });

      } else {
        // Manual mode - relaxed steady pose
        upperArmGroup.rotation.z = 0.1;
        elbowGroup.rotation.z = -0.2;
        wristGroup.rotation.z = 0;
      }

      // Smooth Exploded View Interpolation
      const explodeFactor = isExploded ? 1.8 : 0.0;
      sparLeft.position.x = THREE.MathUtils.lerp(sparLeft.position.x, originalPositions.sparLeft.x - explodeFactor * 0.8, 0.1);
      sparRight.position.x = THREE.MathUtils.lerp(sparRight.position.x, originalPositions.sparRight.x + explodeFactor * 0.8, 0.1);
      elbowCapL.position.x = THREE.MathUtils.lerp(elbowCapL.position.x, -1.25 - explodeFactor * 0.7, 0.1);
      elbowCapR.position.x = THREE.MathUtils.lerp(elbowCapR.position.x, 1.25 + explodeFactor * 0.7, 0.1);
      wristGroup.position.y = THREE.MathUtils.lerp(wristGroup.position.y, originalPositions.wristGroup.y + explodeFactor * 1.5, 0.1);

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
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

  // Update controls upon React state changes
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
    <div className={`relative w-full rounded-2xl overflow-hidden border border-cyan-500/20 bg-slate-900/60 backdrop-blur-md shadow-2xl shadow-cyan-950/20 ${className}`}>
      {/* 3D Canvas Container */}
      <div 
        ref={containerRef} 
        className="w-full h-[460px] md:h-[540px] cursor-grab active:cursor-grabbing"
      />

      {/* Top Left: Lab Tag & Real-Time Status */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md text-xs font-mono text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>BYU NEURO-MECHATRONICS 3D TWIN</span>
        </div>
        <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded backdrop-blur-sm border border-slate-800 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Status: <strong className="text-cyan-200">{telemetry.status}</strong></span>
        </div>
      </div>

      {/* Top Right: Real-time Telemetry Overlay */}
      <div className="absolute top-4 right-4 hidden sm:flex flex-col gap-1.5 font-mono text-xs bg-slate-950/85 border border-slate-800 p-3 rounded-xl backdrop-blur-md pointer-events-none min-w-[170px]">
        <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-1 mb-1">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Zap className="w-3.5 h-3.5" /> BCI Telemetry
          </span>
          <span className="text-[10px] text-emerald-400">ONLINE</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Decoding Latency:</span>
          <span className="text-cyan-300 font-semibold">{telemetry.decodingLatency} ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Cortical Power:</span>
          <span className="text-blue-300 font-semibold">{telemetry.eegPower} µV²</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">SEA Torque:</span>
          <span className="text-indigo-300 font-semibold">{telemetry.actuatorTorque} Nm</span>
        </div>
        <div className="flex justify-between border-t border-slate-800/80 pt-1 mt-1 text-[11px]">
          <span className="text-slate-400">Joints [S/E/W]:</span>
          <span className="text-slate-200">{activeJointAngle.shoulder}° / {activeJointAngle.elbow}° / {activeJointAngle.wrist}°</span>
        </div>
      </div>

      {/* Bottom Center: Interactive Engineering Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/85 border border-slate-800/90 backdrop-blur-md">
        {/* Motion Modes */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMotionMode('bci-cycle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              motionMode === 'bci-cycle'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>BCI Reach Cycle</span>
          </button>

          <button
            onClick={() => setMotionMode('tremor-suppression')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              motionMode === 'tremor-suppression'
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Tremor Suppression</span>
          </button>
        </div>

        {/* CAD & View Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              wireframe 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Toggle Wireframe CAD Mode"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Wireframe</span>
          </button>

          <button
            onClick={() => setExploded(!exploded)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              exploded 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Exploded Mechanical Assembly View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Exploded CAD</span>
          </button>

          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
            title={isAnimating ? "Pause Auto-Rotation" : "Resume Auto-Rotation"}
          >
            {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => controlsRef.current?.resetView()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
            title="Reset Camera View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
