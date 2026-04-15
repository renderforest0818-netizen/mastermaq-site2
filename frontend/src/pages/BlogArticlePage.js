import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ChevronRight, ArrowLeft } from 'lucide-react';
import API from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function BlogArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/blog/${slug}`).then(({ data }) => setArticle(data)).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!article) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">Artigo nao encontrado.</p></div>;

  return (
    <div className="py-24 sm:py-32" data-testid="blog-article-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="text-sm text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center gap-1" data-testid="back-to-blog">
          <ArrowLeft className="w-3 h-3" /> Voltar ao Blog
        </Link>

        <motion.article initial="hidden" animate="visible" variants={fadeUp} className="mt-6">
          {article.category && (
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 block">{article.category}</span>
          )}
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-slate-900 mb-4" data-testid="article-title">{article.title}</h1>

          <div className="flex items-center gap-4 text-sm text-slate-400 mb-8 pb-8 border-b border-slate-200">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {article.author}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(article.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 whitespace-pre-line" data-testid="article-content">
            {article.content}
          </div>
        </motion.article>
      </div>
    </div>
  );
}
