import React from 'react';

interface DocumentPreviewModalProps {
  document: {
    type: string;
    url: string;
    fileName?: string;
  };
  onClose: () => void;
}

const getReadableType = (type: string) => {
  if (!type) return 'Unknown Document';
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const isImage = (url: string, fileName?: string) => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.startsWith('data:image') || 
    lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i) || 
    fileName?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|avif)$/i) ||
    // Fallback for base64 without prefix (common in some DB storage)
    (lowerUrl.length > 100 && !lowerUrl.includes('%') && !lowerUrl.includes(' '))
  );
};

const isPdf = (url: string, fileName?: string) => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.startsWith('data:application/pdf') || 
    lowerUrl.match(/\.pdf$/i) || 
    fileName?.toLowerCase().match(/\.pdf$/i)
  );
};

export default function DocumentPreviewModal({ document, onClose }: DocumentPreviewModalProps) {
  const imageUrl = isImage(document.url, document.fileName) ? document.url : null;
  const pdfUrl = isPdf(document.url, document.fileName) ? document.url : null;

  const handleDownload = () => {
    if (!document.url) return;
    const link = window.document.createElement('a');
    // Ensure data URI prefix if it's raw base64
    let href = document.url;
    if (!href.startsWith('data:') && !href.startsWith('http') && !href.startsWith('/')) {
      const mime = isPdf(document.url, document.fileName) ? 'application/pdf' : 
                   isImage(document.url, document.fileName) ? 'image/png' : 'application/octet-stream';
      href = `data:${mime};base64,${document.url}`;
    }
    link.href = href;
    link.download = document.fileName || `${document.type.toLowerCase()}.${isPdf(document.url, document.fileName) ? 'pdf' : 'doc'}`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  console.log('Rendering Document:', { 
    type: document.type, 
    isImage: !!imageUrl, 
    isPdf: !!pdfUrl,
    urlLength: document.url?.length 
  });

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-10 animate-in fade-in zoom-in duration-300">
      <div className="absolute inset-0 bg-navy/95 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="bg-[#1A253D] border border-white/10 rounded-[3.5rem] w-full max-w-5xl h-[85vh] relative shadow-2xl flex flex-col overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h3 className="text-xl font-black italic text-white">{getReadableType(document.type)}</h3>
            <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest mt-1">
              {document.fileName || 'Document Preview'}
            </p>
          </div>
          <div className="flex gap-4">
            {document.url && (
              <button 
                onClick={handleDownload}
                className="w-12 h-12 bg-green/10 text-green rounded-full flex items-center justify-center hover:bg-green/20 transition-all shadow-lg shadow-green/5"
                title="Download for Printing"
              >
                <span className="material-icons-outlined">download</span>
              </button>
            )}
            <button onClick={onClose} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all">
              <span className="material-icons-outlined text-white">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 bg-black/40 flex items-center justify-center p-8 overflow-hidden relative">
          {imageUrl ? (
            <img 
              src={imageUrl.startsWith('data:') ? imageUrl : `data:image/png;base64,${imageUrl}`} 
              alt={document.type} 
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              onError={(e) => {
                console.error('Image render failed');
              }}
            />
          ) : pdfUrl ? (
            <div className="w-full h-full flex flex-col items-center">
              <object 
                data={pdfUrl} 
                type="application/pdf" 
                className="w-full h-full rounded-lg bg-white"
              >
                 <iframe 
                   src={pdfUrl} 
                   className="w-full h-full rounded-lg border-0 bg-white"
                   title={document.type}
                 />
              </object>
              <div className="absolute bottom-12 right-12">
                 <button 
                   onClick={handleDownload}
                   className="bg-green text-navy px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
                 >
                   Download PDF
                 </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
               <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="material-icons-outlined text-5xl text-white/20">
                   {document.url ? 'description' : 'error_outline'}
                 </span>
               </div>
               <div className="space-y-2">
                 <p className="text-white font-bold">{document.url ? 'Unable to render preview' : 'No data payload'}</p>
                 <p className="text-soft-grey text-sm max-w-xs mx-auto">
                   {document.url 
                    ? 'This document uses a format that cannot be displayed directly.' 
                    : 'This record was submitted without a valid document payload.'}
                 </p>
               </div>
               
               <div className="bg-black/20 p-6 rounded-2xl border border-white/5 text-left max-w-md mx-auto">
                  <p className="text-[9px] text-soft-grey uppercase font-black mb-2 tracking-widest">Diagnostic Details:</p>
                  <div className="space-y-1">
                    <p className="text-[10px] text-white/40 font-mono">TYPE: {document.type}</p>
                    <p className="text-[10px] text-white/40 font-mono">FILE: {document.fileName || 'N/A'}</p>
                    <p className="text-[10px] text-white/40 break-all font-mono">
                      URL: {document.url ? `${document.url.substring(0, 30)}... (${document.url.length} chars)` : 'EMPTY'}
                    </p>
                  </div>
               </div>

               {document.url && (
                 <div className="flex gap-4 justify-center">
                   <button 
                     onClick={handleDownload}
                     className="inline-block bg-green text-navy px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-green/20"
                   >
                     Download & Print
                   </button>
                 </div>
               )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 flex justify-center bg-white/5">
           <button 
             onClick={onClose}
             className="bg-white/5 text-white/60 px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
           >
             Dismiss Preview
           </button>
        </div>
      </div>
    </div>
  );
}


