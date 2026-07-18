import { Html, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { floorLayout, getWaypoint, type Chair } from "../domain/floor-layout";
import type { AtlasState } from "../domain/atlas-machine";

type CareFloorProps = {
  atlas: AtlasState;
  selectedChair: string | null;
  onChairSelect: (chairId: string) => void;
  onAtlasArrive: () => void;
};

const statusColor = {
  stable: "#42d3a4",
  watch: "#f2bd53",
  attention: "#ff6b78"
};

function TreatmentChair({ chair, selected, onSelect }: { chair: Chair; selected: boolean; onSelect: () => void }) {
  const [x, z] = chair.position;
  return (
    <group position={[x, 0, z]} onClick={(event) => { event.stopPropagation(); onSelect(); }}>
      <RoundedBox args={[2.25, 0.45, 2.9]} radius={0.18} position={[0, 0.65, 0]} rotation={[-0.08, 0, 0]}>
        <meshStandardMaterial color={selected ? "#dcecff" : "#d4dde9"} roughness={0.72} />
      </RoundedBox>
      <RoundedBox args={[2.15, 0.4, 1.5]} radius={0.16} position={[0, 1.16, 0.78]} rotation={[-0.62, 0, 0]}>
        <meshStandardMaterial color="#e7edf4" roughness={0.75} />
      </RoundedBox>
      <mesh position={[-0.78, 0.3, 0]}><cylinderGeometry args={[0.12, 0.12, 0.6, 18]} /><meshStandardMaterial color="#738296" /></mesh>
      <mesh position={[0.78, 0.3, 0]}><cylinderGeometry args={[0.12, 0.12, 0.6, 18]} /><meshStandardMaterial color="#738296" /></mesh>
      <mesh position={[1.45, 0.85, 0.35]}>
        <boxGeometry args={[0.8, 1.55, 0.62]} />
        <meshStandardMaterial color="#eff5f8" />
      </mesh>
      <mesh position={[1.45, 1.05, 0.02]}>
        <boxGeometry args={[0.58, 0.48, 0.05]} />
        <meshStandardMaterial color="#17495d" emissive="#0b3949" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.6, 1.72, 48]} />
        <meshBasicMaterial color={statusColor[chair.status]} transparent opacity={selected ? 0.95 : 0.45} />
      </mesh>
      <Html position={[-0.95, 2.15, 0]} center distanceFactor={11} occlude={false}>
        <button className={`chair-label ${chair.status}`} onClick={onSelect}>
          <span>CHAIR {chair.number}</span>
          <strong>{chair.patient}</strong>
          <small>{chair.bp} · HR {chair.heartRate}</small>
        </button>
      </Html>
    </group>
  );
}

function NurseStation() {
  return (
    <group position={[0, 0, 6.7]}>
      <RoundedBox args={[6.8, 1.1, 2]} radius={0.25} position={[0, 0.65, 0]}>
        <meshStandardMaterial color="#164d60" roughness={0.58} />
      </RoundedBox>
      {[-1.6, 0, 1.6].map((x) => (
        <group key={x} position={[x, 1.5, 0]}>
          <mesh><boxGeometry args={[1.25, 0.78, 0.12]} /><meshStandardMaterial color="#082c3d" emissive="#0f536c" emissiveIntensity={0.5} /></mesh>
          <mesh position={[0, -0.46, 0]}><cylinderGeometry args={[0.07, 0.07, 0.35]} /><meshStandardMaterial color="#8299a6" /></mesh>
        </group>
      ))}
      <mesh position={[2.7, 1.32, -0.36]}><cylinderGeometry args={[0.18, 0.22, 0.42, 24]} /><meshStandardMaterial color="#f2c46d" /></mesh>
      <Html position={[0, 2.45, 0]} center distanceFactor={12}>
        <div className="station-label"><span>OPERATIONS CENTER</span><strong>Mira + Human RN</strong></div>
      </Html>
    </group>
  );
}

function AtlasRobot({ state, onArrive }: { state: AtlasState; onArrive: () => void }) {
  const group = useRef<THREE.Group>(null);
  const arrivedRef = useRef(false);
  const current = getWaypoint(state.location)!;
  const destination = state.destination ? getWaypoint(state.destination) : undefined;

  useEffect(() => { arrivedRef.current = false; }, [state.destination]);

  useFrame((_, delta) => {
    if (!group.current || !destination) return;
    const target = new THREE.Vector3(destination.position[0], 0, destination.position[1]);
    const distance = group.current.position.distanceTo(target);
    if (distance < 0.08) {
      group.current.position.copy(target);
      if (!arrivedRef.current) {
        arrivedRef.current = true;
        onArrive();
      }
      return;
    }
    const direction = target.clone().sub(group.current.position).normalize();
    group.current.position.addScaledVector(direction, Math.min(delta * 2.35, distance));
    group.current.rotation.y = Math.atan2(direction.x, direction.z);
  });

  return (
    <group ref={group} position={[current.position[0], 0, current.position[1]]}>
      <mesh position={[0, 0.28, 0]}><cylinderGeometry args={[0.58, 0.7, 0.55, 28]} /><meshStandardMaterial color="#1cc6bf" metalness={0.35} roughness={0.32} /></mesh>
      <RoundedBox args={[0.82, 0.82, 0.72]} radius={0.16} position={[0, 0.88, 0]}>
        <meshStandardMaterial color="#e9f7f7" metalness={0.18} roughness={0.36} />
      </RoundedBox>
      <mesh position={[0, 0.95, 0.37]}><boxGeometry args={[0.52, 0.25, 0.04]} /><meshStandardMaterial color="#062b38" emissive="#1cc6bf" emissiveIntensity={0.6} /></mesh>
      <mesh position={[-0.24, 0.03, 0.35]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.18, 0.08, 12, 24]} /><meshStandardMaterial color="#172534" /></mesh>
      <mesh position={[0.24, 0.03, 0.35]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.18, 0.08, 12, 24]} /><meshStandardMaterial color="#172534" /></mesh>
      {state.item && (
        <group position={[0, 1.47, 0]}>
          <mesh><boxGeometry args={[0.64, 0.16, 0.52]} /><meshStandardMaterial color="#f6c764" /></mesh>
          <mesh position={[0, 0.18, 0]}><cylinderGeometry args={[0.13, 0.16, 0.34, 20]} /><meshStandardMaterial color={state.item === "coffee" ? "#8a5137" : state.item === "water" ? "#87c9f4" : "#bd91df"} /></mesh>
        </group>
      )}
      <pointLight position={[0, 1.1, 0.45]} intensity={1.2} color="#46eee7" distance={2} />
      <Html position={[0, 1.95, 0]} center distanceFactor={10}>
        <div className="atlas-label"><strong>ATLAS</strong><span>{state.item ? `Carrying ${state.item}` : state.status}</span></div>
      </Html>
    </group>
  );
}

function FloorScene(props: CareFloorProps) {
  return (
    <>
      <color attach="background" args={["#07111f"]} />
      <fog attach="fog" args={["#07111f", 20, 35]} />
      <ambientLight intensity={1.3} />
      <directionalLight position={[6, 14, 8]} intensity={2.2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 19]} />
        <meshStandardMaterial color="#122434" roughness={0.88} />
      </mesh>
      <gridHelper args={[18, 18, "#214658", "#193343"]} position={[0, 0.015, 0]} />
      <NurseStation />
      {floorLayout.chairs.map((chair) => (
        <TreatmentChair key={chair.id} chair={chair} selected={props.selectedChair === chair.id} onSelect={() => props.onChairSelect(chair.id)} />
      ))}
      <AtlasRobot state={props.atlas} onArrive={props.onAtlasArrive} />
    </>
  );
}

export function CareFloor(props: CareFloorProps) {
  const sceneVersion = [
    props.atlas.status,
    props.atlas.location,
    props.atlas.destination ?? "none",
    props.atlas.item ?? "empty"
  ].join(":");

  return (
    <Canvas key={sceneVersion} frameloop="always" dpr={1} gl={{ preserveDrawingBuffer: true, antialias: true, powerPreference: "high-performance" }} orthographic camera={{ position: [13, 17, 18], zoom: 47, near: 0.1, far: 100 }}>
      <FloorScene {...props} />
    </Canvas>
  );
}
