import { useRef } from 'react';
import { Upload, X, GripVertical } from 'lucide-react';

export default function PhotoUpload({ photos, onChange }) {
  const inputRef = useRef(null);

  function addFiles(files) {
    const valid = Array.from(files).filter(f =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) && f.size <= 10 * 1024 * 1024
    );
    onChange([...photos, ...valid].slice(0, 10));
  }

  function remove(i) {
    onChange(photos.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {photos.map((file, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
            <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={11} />
            </button>
            {i === 0 && (
              <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-brand-500/80 text-white py-0.5">Cover</span>
            )}
          </div>
        ))}

        {photos.length < 10 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-400 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-500 transition-colors"
          >
            <Upload size={18} />
            <span className="text-[10px] font-medium">Add</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={e => addFiles(e.target.files)}
      />
      <p className="text-xs text-gray-400">Up to 10 photos · JPG, PNG, WEBP · Max 10MB each · First photo is cover</p>
    </div>
  );
}
