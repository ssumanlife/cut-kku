export interface BuiltinSticker {
  id: string
  src: string
  label: string
}

export interface StickerCategory {
  id: string
  label: string
  stickers: BuiltinSticker[]
}

const sanrio: BuiltinSticker[] = [
  { id: '포차코', src: '/stickers/포차코.png', label: '포차코' },
  { id: '시나모롤', src: '/stickers/시나모롤.png', label: '시나모롤' },
  { id: '마이멜로디', src: '/stickers/마이멜로디.png', label: '마이멜로디' },
  { id: '쿠로미', src: '/stickers/쿠로미.png', label: '쿠로미' },
  { id: '키티', src: '/stickers/키티.png', label: '키티' },
  { id: '품품푸린', src: '/stickers/품품푸린.png', label: '품품푸린' },
  { id: '우사하나', src: '/stickers/우사하나.png', label: '우사하나' },
  { id: '스누피', src: '/stickers/스누피.png', label: '스누피' },
  { id: '한교동', src: '/stickers/한교동.png', label: '한교동' },
]

const wedding: BuiltinSticker[] = Array.from({ length: 19 }, (_, i) => ({
  id: `결혼-${i + 1}`,
  src: `/stickers/결혼/${i + 1}.png`,
  label: `${i + 1}`,
}))

const birthday: BuiltinSticker[] = Array.from({ length: 29 }, (_, i) => ({
  id: `생일-${i + 1}`,
  src: `/stickers/생일/${i + 1}.png`,
  label: `${i + 1}`,
}))

export const STICKER_CATEGORIES: StickerCategory[] = [
  { id: 'birthday', label: '생일', stickers: birthday },
  { id: 'wedding', label: '결혼', stickers: wedding },
  { id: 'sanrio', label: '산리오', stickers: sanrio },
]

// 기존 호환용
export const BUILTIN_STICKERS: BuiltinSticker[] = [...sanrio, ...wedding, ...birthday]
