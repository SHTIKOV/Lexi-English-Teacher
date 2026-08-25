import { useEffect, useState } from 'react'
import type { RewardPhoto } from '../types'

interface Props {
  photos: RewardPhoto[]
  baseUrl: string
}

export function PhotoSlider({ photos, baseUrl }: Props) {
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const current = photos[index]
  if (!photos.length || !current) return null

  const src = `${baseUrl}${current.src}`

  const prev = () => setIndex(i => (i - 1 + photos.length) % photos.length)
  const next = () => setIndex(i => (i + 1) % photos.length)

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowLeft') setIndex(i => (i - 1 + photos.length) % photos.length)
      if (e.key === 'ArrowRight') setIndex(i => (i + 1) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, photos.length])

  return (
    <>
      <div className="mt-3">
        <p className="text-xs font-bold text-amber-800/80 mb-2">
          Настоящие фото из Universal Beijing · нажми, чтобы увеличить
        </p>
        <div className="relative rounded-2xl overflow-hidden bg-black/5 shadow-inner">
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="block w-full cursor-zoom-in"
            aria-label="Открыть фото на весь экран"
          >
            <img
              src={src}
              alt={current.caption}
              className="w-full h-40 sm:h-48 object-cover"
            />
          </button>

          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-amber-900 font-bold shadow active:scale-95"
            aria-label="Предыдущее фото"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-amber-900 font-bold shadow active:scale-95"
            aria-label="Следующее фото"
          >
            ›
          </button>

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2">
            <p className="text-white text-xs sm:text-sm font-bold leading-snug">{current.caption}</p>
            <p className="text-white/80 text-[10px]">
              {index + 1} / {photos.length}
            </p>
          </div>
        </div>

        <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setIndex(i)}
              className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                i === index ? 'border-amber-500 scale-105' : 'border-transparent opacity-70'
              }`}
              aria-label={photo.caption}
            >
              <img
                src={`${baseUrl}${photo.src}`}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[70] bg-black/92 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={current.caption}
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-2 text-white">
            <div className="min-w-0 pr-3">
              <p className="font-bold text-sm sm:text-base truncate">{current.caption}</p>
              <p className="text-xs text-white/70">
                {index + 1} / {photos.length}
                {current.credit ? ` · фото: ${current.credit}` : ''}
                {current.license ? ` · ${current.license}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-white/15 text-white text-xl font-bold active:scale-95"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 min-h-0 relative flex items-center justify-center px-2">
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 z-10 w-10 h-10 rounded-full bg-white/20 text-white text-2xl font-bold active:scale-95"
              aria-label="Предыдущее фото"
            >
              ‹
            </button>
            <img
              src={src}
              alt={current.caption}
              className="max-h-full max-w-full object-contain"
              onClick={() => setLightbox(false)}
            />
            <button
              type="button"
              onClick={next}
              className="absolute right-2 z-10 w-10 h-10 rounded-full bg-white/20 text-white text-2xl font-bold active:scale-95"
              aria-label="Следующее фото"
            >
              ›
            </button>
          </div>

          <div className="flex gap-2 px-4 py-3 overflow-x-auto justify-center">
            {photos.map((photo, i) => (
              <button
                key={`lb-${photo.src}`}
                type="button"
                onClick={() => setIndex(i)}
                className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 ${
                  i === index ? 'border-amber-300' : 'border-white/20 opacity-60'
                }`}
              >
                <img src={`${baseUrl}${photo.src}`} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
