'use client' // WAJIB: Menandakan ini berjalan di sisi browser

type DeleteButtonProps = {
  id: string
  // Kita terima Server Action sebagai properti biasa
  deleteAction: (formData: FormData) => Promise<void>
}

export default function DeleteButton({ id, deleteAction }: DeleteButtonProps) {
  return (
    <form 
      action={deleteAction} 
      onSubmit={(e) => {
        if (!confirm('Yakin ingin menghapus total konten ini beserta semua episodenya?')) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button 
        type="submit"
        className="bg-red-950/40 hover:bg-red-900 border border-red-900/50 text-[11px] font-bold px-3 py-1.5 rounded-md text-red-400 transition cursor-pointer"
      >
        🗑️ Hapus
      </button>
    </form>
  )
}