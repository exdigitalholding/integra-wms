import { useMemo, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, Html, Edges, RoundedBox } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { MapPin, ArrowRight, CheckCircle2, Boxes, Move3d, RotateCcw, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Badge, PageHeader } from '../components/ui'
import { ownerColor, ownerName } from '../lib/mock'
import type { PosicaoEstoque } from '../lib/types'
import {
  RUAS,
  COLS,
  LEVELS,
  COL_W,
  LEVEL_H,
  RACK_DEPTH,
  RUA_SPAN,
  STATUS_INFO,
  buildSlots,
  buildOcupacao,
  addressToKey,
  slotLivreProximo,
  type Slot,
} from '../lib/warehouse'

type Focus = { x: number; y: number; z: number; nonce: number } | null

/* ============================ Câmera ============================ */
function CameraRig({
  focus,
  controls,
}: {
  focus: Focus
  controls: React.RefObject<OrbitControlsImpl | null>
}) {
  const { camera } = useThree()
  const lookAt = useRef(new THREE.Vector3())
  const camGoal = useRef(new THREE.Vector3())
  const active = useRef(false)

  useEffect(() => {
    if (!focus) return
    lookAt.current.set(focus.x, focus.y, focus.z)
    // observador parado no corredor, levemente acima do nível do slot
    camGoal.current.set(focus.x + 2.2, focus.y + 2.6, focus.z + 5.5)
    active.current = true
  }, [focus])

  useFrame(() => {
    if (!active.current || !controls.current) return
    camera.position.lerp(camGoal.current, 0.09)
    controls.current.target.lerp(lookAt.current, 0.09)
    controls.current.update()
    if (camera.position.distanceTo(camGoal.current) < 0.25) active.current = false
  })
  return null
}

/* ====================== Estrutura do rack ====================== */
function RackFrame({ ruaIdx }: { ruaIdx: number }) {
  const totalX = (COLS - 1) * COL_W
  const z = ruaIdx * RUA_SPAN - (RUAS.length - 1) * RUA_SPAN / 2
  const height = LEVELS * LEVEL_H + 0.2
  const posts = []
  for (let i = 0; i <= COLS; i++) {
    const x = (i - 0.5) * COL_W - totalX / 2
    posts.push(x)
  }
  return (
    <group>
      {/* montantes verticais (frente e fundo) */}
      {posts.map((x, i) =>
        [-RACK_DEPTH / 2, RACK_DEPTH / 2].map((dz, j) => (
          <mesh key={`p${i}-${j}`} position={[x, height / 2, z + dz]}>
            <boxGeometry args={[0.07, height, 0.07]} />
            <meshStandardMaterial color="#21274e" metalness={0.3} roughness={0.6} />
          </mesh>
        )),
      )}
      {/* longarinas (prateleiras) por nível */}
      {Array.from({ length: LEVELS + 1 }).map((_, lvl) => (
        <mesh key={`b${lvl}`} position={[0, lvl * LEVEL_H + 0.1, z]}>
          <boxGeometry args={[totalX + COL_W, 0.05, RACK_DEPTH]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.2} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

/* ====================== Slot / posição ====================== */
function SlotMesh({
  slot,
  item,
  isTarget,
  isSelected,
  isHovered,
  onClick,
  onHover,
}: {
  slot: Slot
  item: PosicaoEstoque | undefined
  isTarget: boolean
  isSelected: boolean
  isHovered: boolean
  onClick: () => void
  onHover: (h: boolean) => void
}) {
  const w = COL_W * 0.78
  const h = LEVEL_H * 0.7
  const d = RACK_DEPTH * 0.74

  if (item) {
    const color = STATUS_INFO[item.status].color
    return (
      <group position={[slot.x, slot.y, slot.z]}>
        <RoundedBox
          args={[w, h, d]}
          radius={0.05}
          smoothness={3}
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            onHover(true)
          }}
          onPointerOut={() => onHover(false)}
        >
          <meshStandardMaterial
            color={color}
            roughness={0.55}
            metalness={0.05}
            emissive={color}
            emissiveIntensity={isSelected || isHovered ? 0.4 : 0.12}
          />
          <Edges color={isSelected ? '#ffffff' : '#0f172a'} threshold={15} />
        </RoundedBox>
      </group>
    )
  }

  // slot vazio → base translúcida (clicável p/ escolher endereço alternativo)
  return (
    <group position={[slot.x, slot.y - h / 2 + 0.04, slot.z]}>
      {isTarget && <TargetMarker h={h} />}
      <mesh
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(true)
        }}
        onPointerOut={() => onHover(false)}
      >
        <boxGeometry args={[w, 0.08, d]} />
        <meshStandardMaterial
          color={isHovered ? '#00a88e' : '#cbd5e1'}
          transparent
          opacity={isHovered ? 0.85 : 0.45}
        />
      </mesh>
    </group>
  )
}

/* volume "fantasma" descendo no endereço-alvo do putaway */
function TargetMarker({ h }: { h: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) ref.current.position.y = h / 2 + 0.05 + Math.sin(t * 2) * 0.12 + 0.1
    if (mat.current) mat.current.emissiveIntensity = 0.5 + Math.sin(t * 4) * 0.35
  })
  const w = COL_W * 0.7
  return (
    <mesh ref={ref}>
      <boxGeometry args={[w, h * 0.8, RACK_DEPTH * 0.66]} />
      <meshStandardMaterial
        ref={mat}
        color="#00a88e"
        emissive="#00a88e"
        emissiveIntensity={0.6}
        transparent
        opacity={0.55}
      />
    </mesh>
  )
}

/* ====================== Cena ====================== */
function Cena({
  slots,
  ocupacao,
  targetKey,
  selectedKey,
  hoveredKey,
  focus,
  controls,
  onSlotClick,
  onHover,
}: {
  slots: Slot[]
  ocupacao: Map<string, PosicaoEstoque>
  targetKey: string | null
  selectedKey: string | null
  hoveredKey: string | null
  focus: Focus
  controls: React.RefObject<OrbitControlsImpl | null>
  onSlotClick: (s: Slot) => void
  onHover: (key: string | null) => void
}) {
  const hovered = hoveredKey ? slots.find((s) => s.key === hoveredKey) : null
  const hoveredItem = hovered ? ocupacao.get(hovered.key) : undefined

  return (
    <>
      <color attach="background" args={['#f1f5f9']} />
      <fog attach="fog" args={['#f1f5f9', 22, 48]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[8, 14, 8]} intensity={1.1} castShadow />
      <directionalLight position={[-10, 8, -6]} intensity={0.4} />

      <Grid
        position={[0, 0, 0]}
        args={[40, 40]}
        cellSize={1}
        cellColor="#cbd5e1"
        sectionSize={COL_W}
        sectionColor="#94a3b8"
        fadeDistance={40}
        infiniteGrid
      />

      {RUAS.map((_, i) => (
        <RackFrame key={i} ruaIdx={i} />
      ))}

      {slots.map((slot) => (
        <SlotMesh
          key={slot.key}
          slot={slot}
          item={ocupacao.get(slot.key)}
          isTarget={targetKey === slot.key}
          isSelected={selectedKey === slot.key}
          isHovered={hoveredKey === slot.key}
          onClick={() => onSlotClick(slot)}
          onHover={(h) => onHover(h ? slot.key : null)}
        />
      ))}

      {/* etiquetas de rua no piso */}
      {RUAS.map((rua, i) => {
        const z = i * RUA_SPAN - (RUAS.length - 1) * RUA_SPAN / 2
        const x = -((COLS - 1) * COL_W) / 2 - COL_W
        return (
          <Html key={rua} position={[x, 0.1, z]} center distanceFactor={14}>
            <div className="px-2 py-0.5 rounded-md bg-brand text-white text-xs font-semibold shadow">
              Rua {rua}
            </div>
          </Html>
        )
      })}

      {/* tooltip flutuante no hover */}
      {hovered && (
        <Html position={[hovered.x, hovered.y + 0.7, hovered.z]} center distanceFactor={12}>
          <div className="pointer-events-none whitespace-nowrap rounded-lg bg-white px-2.5 py-1.5 shadow-pop border border-line text-center">
            <p className="mono text-[11px] font-semibold text-brand">{hovered.label}</p>
            {hoveredItem ? (
              <p className="text-[10px] text-ink-muted">
                {hoveredItem.skuCodigo} · {hoveredItem.quantidade} un
              </p>
            ) : (
              <p className="text-[10px] text-accent">Livre</p>
            )}
          </div>
        </Html>
      )}

      <CameraRig focus={focus} controls={controls} />
      <OrbitControls
        ref={controls}
        makeDefault
        enableDamping
        dampingFactor={0.1}
        minDistance={4}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  )
}

/* ====================== Página ====================== */
export default function Mapa3D() {
  const { tarefas, estoque, assumirTarefa, concluirTarefa, toast } = useStore()
  const slots = useMemo(() => buildSlots(), [])

  // posições guardadas via putaway nesta sessão (overlay sobre o estoque)
  const [extra, setExtra] = useState<Map<string, PosicaoEstoque>>(new Map())

  const ocupacao = useMemo(() => {
    const base = buildOcupacao(estoque, slots)
    const merged = new Map(base.porKey)
    extra.forEach((v, k) => merged.set(k, v))
    return merged
  }, [estoque, slots, extra])

  const [putawayId, setPutawayId] = useState<string | null>(null)
  const [targetKey, setTargetKey] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [focus, setFocus] = useState<Focus>(null)
  const controls = useRef<OrbitControlsImpl | null>(null)

  const filaPutaway = tarefas.filter((t) => t.tipo === 'putaway')
  const tarefa = tarefas.find((t) => t.id === putawayId) ?? null
  const targetSlot = targetKey ? slots.find((s) => s.key === targetKey) ?? null : null
  const selectedSlot = selectedKey ? slots.find((s) => s.key === selectedKey) ?? null : null
  const selectedItem = selectedSlot ? ocupacao.get(selectedSlot.key) : undefined

  const flyTo = (slot: Slot) => setFocus({ x: slot.x, y: slot.y, z: slot.z, nonce: Math.random() })

  function iniciarPutaway(id: string) {
    const t = tarefas.find((x) => x.id === id)
    if (!t) return
    if (t.status === 'pendente') assumirTarefa(id, 'Operador Demo')
    setPutawayId(id)
    setSelectedKey(null)

    // endereço sugerido pelo sistema → clamp p/ planta; se ocupado, alternativa próxima
    let key = addressToKey(t.destino)
    if (ocupacao.has(key)) {
      const alt = slotLivreProximo(key, slots, ocupacao)
      if (alt) key = alt.key
    }
    setTargetKey(key)
    const slot = slots.find((s) => s.key === key)
    if (slot) flyTo(slot)
  }

  function onSlotClick(slot: Slot) {
    // com putaway ativo, clicar num slot livre redireciona o destino
    if (putawayId && !ocupacao.has(slot.key)) {
      setTargetKey(slot.key)
      flyTo(slot)
      toast({ tipo: 'info', titulo: 'Endereço alternativo', texto: `Destino ajustado para ${slot.label}` })
      return
    }
    setSelectedKey(slot.key)
    flyTo(slot)
  }

  function confirmarGuarda() {
    if (!tarefa || !targetSlot) return
    const novo: PosicaoEstoque = {
      id: `pa-${tarefa.id}`,
      skuCodigo: tarefa.sku,
      descricao: tarefa.descricao,
      endereco: targetSlot.label,
      lote: tarefa.lote ?? null,
      validade: null,
      ownerId: 'own-nano',
      curva: 'A',
      quantidade: tarefa.quantidade,
      status: 'disponivel',
    }
    setExtra((m) => new Map(m).set(targetSlot.key, novo))
    concluirTarefa(tarefa.id)
    toast({ tipo: 'sucesso', titulo: 'Volume guardado', texto: `${tarefa.sku} em ${targetSlot.label}` })
    setPutawayId(null)
    setTargetKey(null)
    setSelectedKey(targetSlot.key)
  }

  function cancelarPutaway() {
    setPutawayId(null)
    setTargetKey(null)
  }

  function resetCamera() {
    setFocus({ x: 0, y: 3, z: 0, nonce: Math.random() })
    if (controls.current) controls.current.target.set(0, 1.5, 0)
  }

  const pendentes = filaPutaway.filter((t) => t.status !== 'concluida').length
  const ocupados = ocupacao.size
  const totalSlots = slots.length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planta 3D do Armazém"
        subtitle="Visualize endereços, ocupação e execute o putaway diretamente sobre a planta"
      >
        <Badge tone="primary" dot>
          {Math.round((ocupados / totalSlots) * 100)}% ocupação
        </Badge>
        <Badge tone="info" dot>
          {pendentes} putaway pendentes
        </Badge>
      </PageHeader>

      <div className="grid xl:grid-cols-[1fr_340px] gap-4">
        {/* ---------------- Canvas 3D ---------------- */}
        <div className="card relative overflow-hidden p-0 h-[560px] xl:h-[640px]">
          <Canvas shadows camera={{ position: [11, 9, 13], fov: 42 }}>
            <Cena
              slots={slots}
              ocupacao={ocupacao}
              targetKey={targetKey}
              selectedKey={selectedKey}
              hoveredKey={hoveredKey}
              focus={focus}
              controls={controls}
              onSlotClick={onSlotClick}
              onHover={setHoveredKey}
            />
          </Canvas>

          {/* dica de navegação */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur px-2.5 py-1.5 text-[11px] text-ink-muted shadow">
            <Move3d className="h-3.5 w-3.5 text-accent" /> Arraste p/ girar · scroll p/ zoom · clique numa posição
          </div>
          <button
            onClick={resetCamera}
            className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur px-2.5 py-1.5 text-[11px] font-medium text-brand shadow hover:bg-white"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Visão geral
          </button>

          {/* legenda */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-x-3 gap-y-1 rounded-lg bg-white/90 backdrop-blur px-3 py-2 shadow">
            {Object.entries(STATUS_INFO).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5 text-[11px] text-ink-soft">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: v.color }} />
                {v.label}
              </span>
            ))}
          </div>
        </div>

        {/* ---------------- Painel lateral ---------------- */}
        <div className="space-y-4">
          {tarefa && targetSlot ? (
            /* modo putaway em execução */
            <div className="card p-4 ring-2 ring-accent/30">
              <div className="flex items-center justify-between">
                <span className="mono text-xs font-medium text-ink-muted">{tarefa.id}</span>
                <button onClick={cancelarPutaway} className="btn-ghost p-1 rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 font-semibold text-brand">Guardar volume</p>
              <p className="text-sm text-ink-soft">{tarefa.descricao}</p>
              <p className="text-xs text-ink-muted mono">{tarefa.sku} · {tarefa.quantidade} un</p>

              <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface-sub p-2.5 text-sm">
                <span className="mono text-ink-soft">{tarefa.origem}</span>
                <ArrowRight className="h-4 w-4 text-ink-muted" />
                <span className="mono font-semibold text-accent">{targetSlot.label}</span>
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-xl bg-accent-50 border border-accent/20 px-3 py-2 text-xs text-accent">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                Endereço sugerido pelo sistema. Para trocar, clique em qualquer posição{' '}
                <span className="font-semibold">livre</span> na planta.
              </div>

              <button onClick={confirmarGuarda} className="btn-primary w-full mt-3 py-2.5">
                <CheckCircle2 className="h-4 w-4" /> Confirmar guarda em {targetSlot.label}
              </button>
            </div>
          ) : selectedSlot ? (
            /* info da posição clicada */
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <span className="mono text-sm font-semibold text-brand">{selectedSlot.label}</span>
                <button onClick={() => setSelectedKey(null)} className="btn-ghost p-1 rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {selectedItem ? (
                <div className="mt-3 space-y-2 text-sm">
                  <p className="font-medium text-brand">{selectedItem.descricao}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Info label="SKU" value={selectedItem.skuCodigo} mono />
                    <Info label="Quantidade" value={`${selectedItem.quantidade} un`} />
                    <Info label="Curva" value={selectedItem.curva} />
                    <Info label="Lote" value={selectedItem.lote ?? '—'} mono />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span
                      className="chip"
                      style={{
                        background: `${STATUS_INFO[selectedItem.status].color}1a`,
                        color: STATUS_INFO[selectedItem.status].color,
                      }}
                    >
                      {STATUS_INFO[selectedItem.status].label}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: ownerColor(selectedItem.ownerId) }}
                      />
                      {ownerName(selectedItem.ownerId)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-accent flex items-center gap-2">
                  <Boxes className="h-4 w-4" /> Posição livre — disponível para guarda
                </p>
              )}
            </div>
          ) : null}

          {/* fila de putaway */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-brand mb-3 flex items-center gap-2">
              <Boxes className="h-4 w-4 text-accent" /> Fila de putaway
            </h3>
            <div className="space-y-2">
              {filaPutaway.map((t) => {
                const ativo = t.id === putawayId
                const concluida = t.status === 'concluida'
                return (
                  <button
                    key={t.id}
                    disabled={concluida}
                    onClick={() => iniciarPutaway(t.id)}
                    className={`w-full text-left rounded-xl border p-2.5 transition ${
                      ativo
                        ? 'border-accent bg-accent-50'
                        : concluida
                          ? 'border-line bg-surface-sub opacity-60'
                          : 'border-line hover:border-accent/50 hover:bg-surface-sub'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="mono text-xs text-ink-muted">{t.id}</span>
                      {concluida ? (
                        <Badge tone="ok" dot>Guardado</Badge>
                      ) : ativo ? (
                        <Badge tone="accent" dot>Selecionado</Badge>
                      ) : (
                        <Badge tone={t.prioridade === 'alta' ? 'bad' : 'neutral'}>{t.prioridade}</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-brand mt-1 truncate">{t.descricao}</p>
                    <p className="text-xs text-ink-muted mono">
                      {t.origem} → {t.destino} · {t.quantidade} un
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ocupação por rua */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-brand mb-3">Ocupação por rua</h3>
            <div className="space-y-2.5">
              {RUAS.map((rua) => {
                const total = COLS * LEVELS
                const ocup = slots.filter((s) => s.rua === rua && ocupacao.has(s.key)).length
                const pct = Math.round((ocup / total) * 100)
                return (
                  <div key={rua}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-ink-soft">Rua {rua}</span>
                      <span className="text-ink-muted mono">{ocup}/{total}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg bg-surface-sub px-2.5 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-ink-muted">{label}</p>
      <p className={`text-sm text-brand ${mono ? 'mono' : ''}`}>{value}</p>
    </div>
  )
}
