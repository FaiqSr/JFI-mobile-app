// Peta alias job description -> nama machine group (namaMc) pada katalog LHP.
//
// SUMBER KEBENARAN: csServices/src/db/seed/mesin-alias.data.ts (tabel `cs_mesin_alias`).
// Sinkronkan manual bila data di backend berubah. Baris dengan namaMc kosong
// sengaja tidak disertakan karena tidak punya size pada katalog.
//
// Label job description yang dilihat operator (mis. "BUBUT 1") berbeda dengan
// nama machine group di master (mis. "TURNING1"); peta ini menjembatani keduanya
// agar field Size dapat menampilkan saran dari catalog.machines[].sizes.

export const JOB_DESC_TO_NAMA_MC: Record<string, Record<string, string>> = {
  RING_1: {
    'LASER CUTTING': 'PLASMA',
    'P. PRESS 1': 'PRESS1',
    'P. PRESS 2': 'PRESS2',
    'P. PRESS 3': 'PRESS3',
    DEBURING: 'GERINDA AMPLAS',
  },
  RING_2: {
    'LAS PAHAT - ASAH PAHAT': 'GERINDA',
    'BUBUT 1': 'TURNING1',
    'BUBUT 2': 'TURNING2',
    'BUBUT 3': 'TURNING3',
    'BUBUT 4': 'TURNING4',
    'BUBUT 5': 'TURNING5',
    'BUBUT 6': 'TURNING6',
    'BUBUT 7': 'TURNING7',
    'BUBUT 8': 'TURNING8',
    'BUBUT 9': 'TURNING8',
    'BUBUT 10': 'TURNING8',
    'BUBUT 11': 'TURNING8',
    CNC: 'TURNING8',
    'TURET 1': 'TURET1',
    'TURET 2': 'TURET2',
    'TURET 3': 'TURET3',
    'TURET 4': 'TURET4',
    'TURET 5': 'TURET5',
  },
  RING_3: {
    'LASER CUTTING': 'PLASMA',
    'CUT STRIP': 'SHERING STRIP',
    STRAIGHTENING: 'PELURUSAN',
    'BENDING (AUTOMATIC)': 'AUTOMATIC BENDING',
    'BENDING (MANUAL)': 'BENDING',
    WELDING: 'WELDING',
    GRINDING: 'GERINDA',
    'GRINDING (WELDING)': 'GERINDA WELDING',
    'GRINDING (SOLID)': 'GERINDA SOLID',
    'ANGLING IR': 'ANGLING VERTICAL',
    'GROVE OR': 'GROVE1',
    POLESHING: 'POLESING',
    BUBUT: 'TURNING5',
  },
  SE: {
    MARKING: 'MARKING',
    'WINDING 01': 'WINDING1',
    'WINDING 03': 'WINDING3',
    'WINDING 05': 'WINDING5',
    'WINDING 06': 'WINDING6',
    'WINDING 07': 'WINDING7',
    'WINDING 09': 'WINDING9',
    'WINDING 10': 'WINDING10',
    'WINDING 11': 'WINDING11',
    'WINDING 13': 'WINDING13',
    'ASSY MANUAL': 'ASSEMBLING',
    'ASSY MACHINE': 'ASSEMBLING',
    CLEANING: 'CLEANING',
    ROLLING: 'ROLLING',
    PACKAGING: 'PACKING',
  },
};

/** trim + rapatkan spasi internal + uppercase; replikasi normalizeJobdesc() backend. */
export function normalizeJobdesc(raw: string | null | undefined): string {
  return String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

interface CatalogLike {
  machines: { namaMc: string; sizes: string[] }[];
}

/**
 * Resolve daftar saran size untuk job description terpilih:
 *   1. job desc dinormalisasi -> namaMc via peta alias (per area)
 *   2. fallback: cocokkan langsung job desc ternormalisasi dengan namaMc katalog
 *   3. ambil `sizes` dari machine yang namanya cocok (ternormalisasi)
 */
export function resolveMachineSizes(
  catalog: CatalogLike | null | undefined,
  area: string,
  jobDescription: string | null | undefined
): string[] {
  if (!catalog) return [];
  const norm = normalizeJobdesc(jobDescription);
  if (norm === '') return [];

  const aliasMc = JOB_DESC_TO_NAMA_MC[area]?.[norm];
  const target = aliasMc ?? norm;

  return (
    catalog.machines.find(
      ({ namaMc }) =>
        namaMc === target || normalizeJobdesc(namaMc) === normalizeJobdesc(target)
    )?.sizes ?? []
  );
}
