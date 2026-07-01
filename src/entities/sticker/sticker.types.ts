export interface BuiltinSticker {
  id: string
  src: string
  label: string
}

export const BUILTIN_STICKERS: BuiltinSticker[] = [
  { id: 'star', src: '/stickers/star.svg', label: '별' },
  { id: 'heart', src: '/stickers/heart.svg', label: '하트' },
  { id: 'flower', src: '/stickers/flower.svg', label: '꽃' },
  { id: 'sparkle', src: '/stickers/sparkle.svg', label: '반짝이' },
  { id: 'ribbon', src: '/stickers/ribbon.svg', label: '리본' },
]
