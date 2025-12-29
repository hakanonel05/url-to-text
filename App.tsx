
import React, { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { AppStatus, ExtractionResult } from './types';
import { extractWebContent } from './services/geminiService';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !url.startsWith('http')) {
      setError('Lütfen geçerli bir URL girin.');
      return;
    }

    setStatus(AppStatus.LOADING);
    setError(null);
    setResult(null);

    try {
      // Hızlandırılmış servis çağrısı
      const data = await extractWebContent(url);
      setResult(data);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || 'Hata: Sayfa içeriği kopyalanamadı.');
      setStatus(AppStatus.ERROR);
    }
  }, [url]);

  const handleClear = () => {
    setUrl('');
    setResult(null);
    setStatus(AppStatus.IDLE);
    setError(null);
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = `${result.title}\n\n${result.sections.map(s => `${s.heading}\n${s.content}`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
    alert('Birebir metin kopyalandı!');
  };

  return (
    <Layout>
      <section className="mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold mb-4 text-slate-800 flex items-center">
            <span className="mr-2">⚡</span> Hızlı Metin Çıkarıcı
          </h2>
          <p className="text-slate-600 mb-6">
            Gemini 3 Flash ile optimize edildi. Sayfayı saniyeler içinde ziyaret eder ve asıl metni birebir getirir.
          </p>
          
          <form onSubmit={handleExtract} className="space-y-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-lg transition-all"
              disabled={status === AppStatus.LOADING}
            />
            
            <button
              type="submit"
              disabled={status === AppStatus.LOADING || !url}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-95 ${
                status === AppStatus.LOADING ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
              }`}
            >
              {status === AppStatus.LOADING ? (
                <span className="flex items-center justify-center">
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Yıldırım Hızında Çıkarılıyor...
                </span>
              ) : 'Hızlı Çıkar'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 animate-pulse">
              {error}
            </div>
          )}
        </div>
      </section>

      {status === AppStatus.SUCCESS && result && (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-ping"></span>
                Birebir Aktarıldı
              </span>
              <button onClick={copyToClipboard} className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-slate-600 hover:text-indigo-600 font-bold text-xs shadow-sm transition-all">
                Hızlı Kopyala
              </button>
            </div>

            <article className="px-8 md:px-16 py-10 prose-content">
              <h1 className="text-3xl font-bold mb-6 text-slate-900 leading-tight">{result.title}</h1>
              <div className="space-y-8">
                {result.sections.map((section, idx) => (
                  <div key={idx} className="border-l-2 border-slate-100 pl-6">
                    <h2 className="text-lg font-bold text-slate-500 mb-2 uppercase tracking-wide text-xs">{section.heading}</h2>
                    <p className="text-slate-800 leading-relaxed whitespace-pre-wrap text-lg">{section.content}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default App;
