import lexiHello from '../assets/lexi-hello.png'

interface Props {
  onConfirm: () => void
  onCancel: () => void
}

export function ExitConfirm({ onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6 animate-bounce-in">
      <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full flex flex-col items-center gap-4">
        <img src={lexiHello} alt="Lexi" className="w-28 h-28 object-contain drop-shadow-lg" />
        <div className="bg-purple-50 rounded-2xl px-4 py-3 relative w-full text-center">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-purple-50 rotate-45" />
          <p className="text-lg font-bold text-purple-600">Уже уходишь? 😢</p>
          <p className="text-sm text-gray-500 mt-1">Точно хочешь вернуться в меню?</p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg active:scale-95 transition-transform cursor-pointer"
          >
            Остаюсь!
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl text-lg font-bold text-gray-600 bg-white border-2 border-gray-200 shadow active:scale-95 transition-transform cursor-pointer"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  )
}
