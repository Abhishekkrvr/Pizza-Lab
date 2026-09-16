"use client";

import { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  PizzaState,
  getBase,
  getSauce,
  getCheese,
  getToppings,
  Topping,
} from "@/lib/pizza";

const PIZZA_RADIUS = 2;

/** Deterministic pseudo-random from a seed string — so a given
 *  topping always lands in the same spots instead of jumping around
 *  on every React re-render. */
function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function scatterPositions(seed: string, count: number, maxRadius: number) {
  const rng = seededRandom(seed);
  const out: { x: number; z: number; rot: number; tilt: number }[] = [];
  for (let i = 0; i < count; i++) {
    // sqrt keeps distribution even instead of clustering at center
    const r = Math.sqrt(rng()) * maxRadius;
    const theta = rng() * Math.PI * 2;
    out.push({
      x: Math.cos(theta) * r,
      z: Math.sin(theta) * r,
      rot: rng() * Math.PI * 2,
      tilt: (rng() - 0.5) * 0.35,
    });
  }
  return out;
}

function ToppingMesh({
  topping,
  position,
  rot,
  tilt,
  yBase,
}: {
  topping: Topping;
  position: [number, number];
  rot: number;
  tilt: number;
  yBase: number;
}) {
  const { shape, size, color } = topping;
  const [x, z] = position;

  const geometry = useMemo(() => {
    switch (shape) {
      case "disc":
        return <cylinderGeometry args={[size, size, 0.035, 20]} />;
      case "ring":
        return <torusGeometry args={[size * 0.75, size * 0.3, 8, 18]} />;
      case "chunk":
        return <boxGeometry args={[size * 1.5, size * 0.7, size * 1.2]} />;
      case "sphere":
        return <sphereGeometry args={[size, 12, 10]} />;
      case "strip":
        return <boxGeometry args={[size * 2.4, size * 0.28, size * 0.45]} />;
      case "leaf":
        return <sphereGeometry args={[size, 10, 8]} />;
      default:
        return <sphereGeometry args={[size, 10, 8]} />;
    }
  }, [shape, size]);

  const rotation: [number, number, number] =
    shape === "ring"
      ? [Math.PI / 2 + tilt * 0.4, rot, 0]
      : shape === "leaf"
      ? [tilt, rot, 0.3]
      : [tilt, rot, 0];

  const scale: [number, number, number] =
    shape === "leaf" ? [1.6, 0.25, 0.9] : [1, 1, 1];

  return (
    <mesh position={[x, yBase + size * 0.5, z]} rotation={rotation} scale={scale} castShadow>
      {geometry}
      <meshStandardMaterial color={color} roughness={0.65} metalness={0.02} />
    </mesh>
  );
}

function Pizza({ state, baked }: { state: PizzaState; baked: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const crustMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const cheeseMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const base = getBase(state.baseId);
  const sauce = getSauce(state.sauceId);
  const cheese = getCheese(state.cheeseId);
  const toppings = getToppings(state.toppingIds);

  const crustTop = base.thickness / 2;
  const sauceY = crustTop + 0.005;
  const cheeseY = sauceY + 0.02;
  const toppingY = cheeseY + 0.03;

  const cheeseBlobs = useMemo(
    () => scatterPositions(`cheese-${state.cheeseId}`, cheese.blobCount, PIZZA_RADIUS * 0.82),
    [state.cheeseId, cheese.blobCount]
  );

  // bake transition: crust browns, cheese turns golden, everything
  // settles slightly — driven per-frame rather than as a one-shot so
  // it also reverses cleanly if you go back to editing
  useFrame(() => {
    const targetCrust = new THREE.Color(baked ? "#B07A3F" : base.color);
    const targetCheese = new THREE.Color(baked ? "#E8B54A" : "#F5E2A8");

    if (crustMatRef.current) {
      crustMatRef.current.color.lerp(targetCrust, 0.04);
    }
    if (cheeseMatRef.current) {
      cheeseMatRef.current.color.lerp(targetCheese, 0.04);
    }
  });

  return (
    <group ref={groupRef}>
      {/* raised outer crust ring */}
      <mesh position={[0, crustTop - base.thickness * 0.1, 0]} castShadow receiveShadow>
        <torusGeometry args={[PIZZA_RADIUS - 0.12, base.thickness * 0.75, 12, 48]} />
        <meshStandardMaterial ref={crustMatRef} color={base.color} roughness={0.9} />
      </mesh>

      {/* main dough disc */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[PIZZA_RADIUS, PIZZA_RADIUS * 0.97, base.thickness, 48]} />
        <meshStandardMaterial color={base.color} roughness={0.9} />
      </mesh>

      {/* sauce layer */}
      <mesh position={[0, sauceY, 0]}>
        <cylinderGeometry args={[PIZZA_RADIUS * 0.88, PIZZA_RADIUS * 0.88, 0.02, 48]} />
        <meshStandardMaterial color={sauce.color} roughness={0.75} />
      </mesh>

      {/* cheese — irregular overlapping blobs rather than a flat disc,
          so it reads as melted cheese instead of a coloured plate */}
      <group>
        <mesh position={[0, cheeseY, 0]}>
          <cylinderGeometry args={[PIZZA_RADIUS * 0.85, PIZZA_RADIUS * 0.85, 0.018, 48]} />
          <meshStandardMaterial
            ref={cheeseMatRef}
            color="#F5E2A8"
            roughness={0.55}
            transparent
            opacity={cheese.opacity}
          />
        </mesh>
        {cheeseBlobs.map((b, i) => (
          <mesh key={i} position={[b.x, cheeseY + 0.015, b.z]} rotation={[0, b.rot, 0]}>
            <sphereGeometry args={[0.12 + (i % 3) * 0.04, 10, 8]} />
            <meshStandardMaterial
              color={baked ? "#EFC25C" : "#F7E9BC"}
              roughness={0.5}
              transparent
              opacity={cheese.opacity * 0.85}
            />
          </mesh>
        ))}
      </group>

      {/* toppings */}
      {toppings.map((topping) => {
        const spots = scatterPositions(`${topping.id}-${topping.count}`, topping.count, PIZZA_RADIUS * 0.78);
        return (
          <group key={topping.id}>
            {spots.map((s, i) => (
              <ToppingMesh
                key={i}
                topping={topping}
                position={[s.x, s.z]}
                rot={s.rot}
                tilt={s.tilt}
                yBase={toppingY}
              />
            ))}
          </group>
        );
      })}
    </group>
  );
}

function SteamParticles({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = 40;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = Math.random() * 1.6;
      const theta = Math.random() * Math.PI * 2;
      arr[i * 3] = Math.cos(theta) * r;
      arr[i * 3 + 1] = Math.random() * 2;
      arr[i * 3 + 2] = Math.sin(theta) * r;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current || !active) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + delta * 0.4;
      if (y > 2.4) y = 0.2;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.09} color="#FFFFFF" transparent opacity={0.16} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function RotatingGroup({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current && enabled) ref.current.rotation.y += delta * 0.18;
  });
  return <group ref={ref}>{children}</group>;
}

export default function PizzaScene({
  state,
  baked,
  autoRotate = true,
}: {
  state: PizzaState;
  baked: boolean;
  autoRotate?: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 3.6, 4.4], fov: 42 }}
      shadows
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.8]}
    >
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[4, 7, 4]}
        intensity={1.25}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4, 3, -3]} intensity={0.35} color="#FFD9A0" />

      <RotatingGroup enabled={autoRotate}>
        <Pizza state={state} baked={baked} />
        <SteamParticles active={baked} />
      </RotatingGroup>

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={3.2}
        maxDistance={8}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.15}
      />
    </Canvas>
  );
}
