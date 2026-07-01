import { create } from 'zustand'
import type { FrameType, ImageFilter, ImageSlot, StickerLayer, TextLayer } from './frame.types'
import { FRAME_SLOT_COUNT } from './frame.types'

const createDefaultSlots = (count: number): ImageSlot[] =>
  Array.from({ length: count }, () => ({ imageUrl: null }))

interface EditorState {
  frameType: FrameType
  backgroundColor: string
  frameFilter: ImageFilter
  slots: ImageSlot[]
  texts: TextLayer[]
  stickers: StickerLayer[]
  selectedSlotIndex: number | null
  selectedTextId: string | null
  selectedStickerId: string | null
}

interface EditorActions {
  actions: {
    setFrameType: (type: FrameType) => void
    setBackgroundColor: (color: string) => void
    setFrameFilter: (filter: ImageFilter) => void
    setSlotImage: (index: number, imageUrl: string) => void
    clearSlotImage: (index: number) => void
    setSelectedSlotIndex: (index: number | null) => void
    addText: (text: Omit<TextLayer, 'id'>) => void
    updateText: (id: string, patch: Partial<Omit<TextLayer, 'id'>>) => void
    removeText: (id: string) => void
    setSelectedTextId: (id: string | null) => void
    addSticker: (sticker: Omit<StickerLayer, 'id'>) => void
    updateSticker: (id: string, patch: Partial<Omit<StickerLayer, 'id'>>) => void
    removeSticker: (id: string) => void
    setSelectedStickerId: (id: string | null) => void
  }
}

const defaultState: EditorState = {
  frameType: 'A',
  backgroundColor: '#ffffff',
  frameFilter: 'none',
  slots: createDefaultSlots(FRAME_SLOT_COUNT['A']),
  texts: [],
  stickers: [],
  selectedSlotIndex: null,
  selectedTextId: null,
  selectedStickerId: null,
}

export const useEditorStore = create<EditorState & EditorActions>((set) => ({
  ...defaultState,

  actions: {
    setFrameType: (frameType) =>
      set({ frameType, frameFilter: 'none', slots: createDefaultSlots(FRAME_SLOT_COUNT[frameType]), selectedSlotIndex: null }),

    setBackgroundColor: (backgroundColor) => set({ backgroundColor }),

    setFrameFilter: (frameFilter) => set({ frameFilter }),

    setSlotImage: (index, imageUrl) =>
      set((state) => {
        const slots = [...state.slots]
        slots[index] = { ...slots[index], imageUrl }
        return { slots }
      }),

    clearSlotImage: (index) =>
      set((state) => {
        const slots = [...state.slots]
        slots[index] = { imageUrl: null }
        return { slots, selectedSlotIndex: state.selectedSlotIndex === index ? null : state.selectedSlotIndex }
      }),

    setSelectedSlotIndex: (selectedSlotIndex) => set({ selectedSlotIndex }),

    addText: (text) =>
      set((state) => ({
        texts: [...state.texts, { ...text, id: crypto.randomUUID() }],
      })),

    updateText: (id, patch) =>
      set((state) => ({
        texts: state.texts.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      })),

    removeText: (id) =>
      set((state) => ({
        texts: state.texts.filter((t) => t.id !== id),
        selectedTextId: state.selectedTextId === id ? null : state.selectedTextId,
      })),

    setSelectedTextId: (selectedTextId) => set({ selectedTextId }),

    addSticker: (sticker) =>
      set((state) => ({
        stickers: [...state.stickers, { ...sticker, id: crypto.randomUUID() }],
      })),

    updateSticker: (id, patch) =>
      set((state) => ({
        stickers: state.stickers.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      })),

    removeSticker: (id) =>
      set((state) => ({
        stickers: state.stickers.filter((s) => s.id !== id),
        selectedStickerId: state.selectedStickerId === id ? null : state.selectedStickerId,
      })),

    setSelectedStickerId: (selectedStickerId) => set({ selectedStickerId }),
  },
}))
