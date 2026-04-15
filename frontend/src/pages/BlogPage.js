import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import API from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/blog').then(({ data }) => setArticles(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div data-testid="blog-page">
      <section className="py-24 sm:py-32 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-4">Blog</p>
            <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-4">Artigos e Dicas</h1>
            <p className="text-base text-slate-300 max-w-lg">Dicas de manutencao, novidades e informacoes uteis sobre seus eletrodomesticos.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="relative max-w-md mb-12">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar artigos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 border-slate-300"
              data-testid="blog-search"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-slate-500 py-16">Nenhum artigo encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((article, i) => (
                <motion.div key={article.slug} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { delay: i * 0.05 } } }}>
                  <Link to={`/blog/${article.slug}`} className="block bg-white border border-slate-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group" data-testid={`blog-card-${article.slug}`}>
                    <div className="bg-blue-50 h-40 flex items-center justify-center">
                      <span className="font-heading text-4xl text-blue-200 font-bold">{article.title.charAt(0)}</span>
                    </div>
                    <div className="p-6">
                      {article.category && (
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">{article.category}</span>
                      )}
                      <h3 className="font-heading font-semibold text-base text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{article.title}</h3>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{article.summary}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(article.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        <span className="text-sm text-blue-600 flex items-center gap-1 font-medium">
                          Ler <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
