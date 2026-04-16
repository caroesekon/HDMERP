import { HiX } from 'react-icons/hi';

export default function LegalModal({ isOpen, onClose, title, content }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <HiX className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[60vh] prose prose-sm">
            {content ? (
              <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
            ) : (
              <p className="text-gray-500 text-center py-8">No content available.</p>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}