// Cores oficiais aproximadas das montadoras — usadas apenas como gradiente
// decorativo dos placeholders de foto. Não representam identidade visual
// oficial e não substituem logotipos reais.

type CorMarca = {
  base: string;
  claro: string;
};

const CORES: Record<string, CorMarca> = {
  byd: { base: "#e63025", claro: "#ff5a4a" },
  caoa: { base: "#003478", claro: "#1f5aa8" },
  chery: { base: "#d61b22", claro: "#f04b4f" },
  chevrolet: { base: "#d4a017", claro: "#f1c04a" },
  citroen: { base: "#cc0033", claro: "#f04060" },
  fiat: { base: "#b31b1b", claro: "#e04646" },
  ford: { base: "#003478", claro: "#1f5aa8" },
  gwm: { base: "#0056b3", claro: "#2a7fd6" },
  honda: { base: "#cc0000", claro: "#f03030" },
  hyundai: { base: "#002c5f", claro: "#20548f" },
  jac: { base: "#e60012", claro: "#ff3344" },
  jeep: { base: "#4b5320", claro: "#7a8343" },
  mitsubishi: { base: "#e60012", claro: "#ff3344" },
  nissan: { base: "#c3002f", claro: "#eb3658" },
  peugeot: { base: "#00205b", claro: "#1e478a" },
  ram: { base: "#1a1a1a", claro: "#4a4a4a" },
  renault: { base: "#efdf00", claro: "#fff23d" },
  toyota: { base: "#eb0a1e", claro: "#ff3f52" },
  volkswagen: { base: "#001e50", claro: "#1f4683" },
  volvo: { base: "#003057", claro: "#1f5789" },
};

const CORES_FALLBACK: CorMarca[] = [
  { base: "#1e8bff", claro: "#4ea8ff" },
  { base: "#ff5722", claro: "#ff8a5c" },
  { base: "#6b46c1", claro: "#9273e0" },
  { base: "#059669", claro: "#34d399" },
  { base: "#dc2626", claro: "#f87171" },
];

function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function corDaMarca(slug: string | null | undefined): CorMarca {
  if (slug && CORES[slug]) return CORES[slug];
  if (!slug) return CORES_FALLBACK[0];
  return CORES_FALLBACK[hashSlug(slug) % CORES_FALLBACK.length];
}
