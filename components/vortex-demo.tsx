'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Slider } from '@/components/ui/slider';

export interface ModelParameters { progress: number; h: number; viscosity: number; swirl: number; pulseStrength: number; }

export function computePhysics({ progress, h, viscosity, swirl, pulseStrength }: ModelParameters) {
  const tau = Math.max(0.005, 1 - progress);
  const radialScale = Math.pow(tau, 0.5);
  const axialScale = Math.pow(tau, 0.5 - h);
  const tangentialSpeed = swirl * Math.pow(tau, -0.5 - h);
  const radialSpeed = Math.pow(tau, -0.5);
  const coreVolume = radialScale * radialScale * axialScale;
  const energyScale = swirl * swirl * Math.pow(tau, 0.5 - 3 * h);
  const angularReynolds = (swirl / viscosity) * Math.pow(tau, -h);
  const radialReynolds = 1 / viscosity;
  const residualFraction = Math.max(0, 1 - pulseStrength);
  return { tau, radialScale, axialScale, tangentialSpeed, radialSpeed, coreVolume, energyScale, angularReynolds, radialReynolds, residualFraction };
}

function VortexParticles({ physics, pulseStrength }: { physics: ReturnType<typeof computePhysics>; pulseStrength: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 180;
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => ({ phase: ((i * 37) % count) / count * Math.PI * 2, layer: ((i * 53) % count) / (count - 1) * 2 - 1, band: 0.35 + ((i * 29) % 71) / 100 })), []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const spin = Math.min(11, 0.65 + Math.log1p(physics.tangentialSpeed));
    seeds.forEach((seed, i) => {
      const angle = seed.phase + time * spin * (0.45 + seed.band);
      const radius = (0.7 + seed.band * 1.25) * (0.55 + physics.radialScale * 0.95);
      const z = seed.layer * (0.95 + physics.axialScale * 1.6);
      dummy.position.set(Math.cos(angle + seed.layer * 2.8) * radius, z, Math.sin(angle + seed.layer * 2.8) * radius);
      dummy.scale.setScalar(0.025 + 0.035 * pulseStrength);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[undefined, undefined, count]}><sphereGeometry args={[1, 8, 8]} /><meshBasicMaterial color="#6ce5d5" transparent opacity={0.78} /></instancedMesh>;
}

function Scene({ physics, pulseStrength }: { physics: ReturnType<typeof computePhysics>; pulseStrength: number }) {
  const core = useRef<THREE.Mesh>(null!);
  const pulseGroup = useRef<THREE.Group>(null!);
  const coreRadius = 0.42 + physics.radialScale * 0.72;
  const coreHeight = 1.2 + physics.axialScale * 2.6;

  useFrame(({ clock }) => {
    core.current.rotation.y = clock.getElapsedTime() * Math.min(5.5, 0.3 + Math.log1p(physics.tangentialSpeed));
    pulseGroup.current.rotation.y = -clock.getElapsedTime() * 0.42;
  });

  return <>
    <color attach="background" args={['#050d0c']} /><fog attach="fog" args={['#050d0c', 8, 19]} />
    <ambientLight intensity={0.65} /><directionalLight position={[4, 6, 5]} intensity={2.4} color="#d8ff73" /><pointLight position={[-4, -1, 3]} intensity={24} color="#6ce5d5" distance={10} />
    <mesh ref={core} scale={[coreRadius, coreHeight, coreRadius]}><cylinderGeometry args={[1, 0.66, 1, 48, 12, true]} /><meshPhysicalMaterial color="#1f8277" emissive="#0b3c37" emissiveIntensity={0.7} transparent opacity={0.32} roughness={0.15} metalness={0.1} side={THREE.DoubleSide} wireframe /></mesh>
    <group ref={pulseGroup}>{[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[0, (i - 2) * 0.62, 0]} rotation={[Math.PI / 2, 0, i * 0.38]} scale={[1 + i * 0.11, 1 + i * 0.11, 1]}><torusGeometry args={[1.45 + coreRadius * 0.55, 0.016 + pulseStrength * 0.025, 8, 96]} /><meshBasicMaterial color={i % 2 ? '#ffb866' : '#d8ff73'} transparent opacity={0.18 + pulseStrength * 0.56} /></mesh>)}</group>
    <VortexParticles physics={physics} pulseStrength={pulseStrength} /><gridHelper args={[18, 36, '#193c37', '#0b2421']} position={[0, -3.25, 0]} /><OrbitControls enableDamping dampingFactor={0.07} minDistance={5.5} maxDistance={15} />
  </>;
}

const defaults: ModelParameters = { progress: 0.8, h: 0.008, viscosity: 1, swirl: 1, pulseStrength: 0.88 };
const controls: Array<{ key: keyof ModelParameters; label: string; min: number; max: number; step: number; format: (v: number) => string }> = [
  { key: 'progress', label: 'Time toward blowup', min: 0, max: 0.995, step: 0.005, format: (v) => `${(v * 100).toFixed(1)}%` },
  { key: 'h', label: 'Anisotropy exponent h', min: 0.001, max: 0.009, step: 0.001, format: (v) => v.toFixed(3) },
  { key: 'viscosity', label: 'Normalized viscosity ν', min: 0.25, max: 2, step: 0.05, format: (v) => v.toFixed(2) },
  { key: 'swirl', label: 'Swirl coefficient', min: 0.4, max: 1.8, step: 0.05, format: (v) => v.toFixed(2) },
  { key: 'pulseStrength', label: 'Pulse stress cancellation', min: 0, max: 1, step: 0.02, format: (v) => `${(v * 100).toFixed(0)}%` },
];
function ReadoutRow({ label, value }: { label: string; value: string }) { return <div className="readout-row"><span>{label}</span><strong>{value}</strong></div>; }

function StaticFallback({ physics }: { physics: ReturnType<typeof computePhysics> }) {
  const radius = 42 + physics.radialScale * 55;
  const height = 95 + physics.axialScale * 120;
  return <div className="fallback-vortex" role="img" aria-label="Interactive two-dimensional fallback view of the contracting vortex">
    <svg viewBox="0 0 520 440" aria-hidden="true">
      <defs><linearGradient id="coreGlow" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#6ce5d5" stopOpacity=".72"/><stop offset="1" stopColor="#0b3c37" stopOpacity=".1"/></linearGradient></defs>
      <g transform="translate(260 220)">
        {[1.75, 1.45, 1.15].map((factor, i) => <ellipse key={factor} rx={radius * factor} ry={18 + i * 4} fill="none" stroke={i % 2 ? '#ffb866' : '#d8ff73'} strokeOpacity={0.45} strokeWidth="2" transform={`translate(0 ${(i - 1) * 58}) rotate(${i * 8 - 7})`} />)}
        <path d={`M ${-radius} ${-height/2} C ${-radius*1.25} 0 ${-radius*.8} ${height/2} 0 ${height/2} C ${radius*.8} ${height/2} ${radius*1.25} 0 ${radius} ${-height/2} Z`} fill="url(#coreGlow)" stroke="#6ce5d5" strokeOpacity=".65" />
        {[0,1,2,3,4].map((i) => <path key={i} d={`M ${-radius*1.35} ${-height*.38+i*height*.19} C ${-radius*.4} ${-height*.55+i*height*.2} ${radius*.45} ${-height*.2+i*height*.17} ${radius*1.35} ${-height*.37+i*height*.19}`} fill="none" stroke="#6ce5d5" strokeOpacity={0.28 + i*.08} strokeWidth="2" />)}
      </g>
    </svg>
    <span>WebGL is unavailable here; sliders and scaling readouts remain live.</span>
  </div>;
}

export default function VortexDemo() {
  const [params, setParams] = useState(defaults);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const physics = computePhysics(params);
  useEffect(() => {
    const canvas = document.createElement('canvas');
    setHasWebGL(Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')));
  }, []);
  return <div className="demo-frame">
    <div className="canvas-wrap"><span className="canvas-label">{hasWebGL ? 'Drag to orbit · scroll to zoom' : 'Live scaling view'}</span>{hasWebGL ? <Canvas camera={{ position: [6.8, 3.4, 7.2], fov: 47 }} dpr={[1, 1.6]}><Scene physics={physics} pulseStrength={params.pulseStrength} /></Canvas> : <StaticFallback physics={physics} />}</div>
    <aside className="control-panel" aria-label="Vortex model controls">
      <div><div className="section-kicker">Parameters</div><h3>Approach τ = 0</h3></div>
      <div className="control-block">{controls.map((control) => <label className="slider-row" key={control.key}><span className="slider-head"><span>{control.label}</span><output>{control.format(params[control.key])}</output></span><Slider value={[params[control.key]]} min={control.min} max={control.max} step={control.step} onValueChange={(value) => setParams((current) => ({ ...current, [control.key]: value[0] }))} aria-label={control.label} /></label>)}</div>
      <div className="model-note">Illustrative reduced-order model. It shows the theorem’s asymptotic exponents, not the complete constructed velocity, pressure, or forcing fields.</div>
      <div className="readout" aria-live="polite"><ReadoutRow label="τ = 1 − t" value={physics.tau.toExponential(3)} /><ReadoutRow label="Radial scale ℓᵣ" value={physics.radialScale.toExponential(3)} /><ReadoutRow label="Axial scale ℓ𝓏" value={physics.axialScale.toExponential(3)} /><ReadoutRow label="Tangential speed" value={physics.tangentialSpeed.toExponential(3)} /><ReadoutRow label="Core energy scale" value={physics.energyScale.toExponential(3)} /><ReadoutRow label="Angular Reynolds" value={physics.angularReynolds.toFixed(3)} /><ReadoutRow label="Residual after pulses" value={`${(physics.residualFraction * 100).toFixed(0)}%`} /></div>
    </aside>
  </div>;
}
