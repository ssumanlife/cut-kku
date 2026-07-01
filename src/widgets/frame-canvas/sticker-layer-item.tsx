import Image from 'next/image'
import type { StickerLayer } from '@entities/frame'

export const StickerLayerItem = ({ sticker }: { sticker: StickerLayer }) => {
  const size = 120 * sticker.scale

  return (
    <div
      className="absolute select-none pointer-events-none"
      style={{
        left: sticker.x,
        top: sticker.y,
        width: size,
        height: size,
        transform: `rotate(${sticker.rotate}deg)`,
        transformOrigin: 'center',
      }}
    >
      <Image
        src={sticker.src}
        alt="sticker"
        fill
        className="object-contain"
        draggable={false}
        unoptimized
      />
    </div>
  )
}
