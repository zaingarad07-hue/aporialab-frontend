import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '@/services/api';
import type { DiscussionDetail, SearchUser } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Loader2,
  MessageCircle,
  Users,
  Heart,
  Eye,
  ArrowRight,
  X,
  FileSearch,
} from 'lucide-react';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<{
    discussions: DiscussionDetail[];
    users: SearchUser[];
  }>({ discussions: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'discussions' | 'users'>('all');

  useEffect(() => {
    document.title = query ? `${query} - بحث | AporiaLab` : 'بحث | AporiaLab';
  }, [query]);

  // Perform search when URL query changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q && q.length >= 2) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) return;
    
    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await api.search(searchQuery.trim());
      setResults({
        discussions: response.discussions || [],
        users: response.users || [],
      });
    } catch (err) {
      console.error('Search failed:', err);
      setResults({ discussions: [], users: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setSearchParams({ q: query.trim() });
  };

  const clearSearch = () => {
    setQuery('');
    setSearchParams({});
    setResults({ discussions: [], users: [] });
    setHasSearched(false);
  };

  const getLevelColor = (category: string) => {
    if (category === 'advanced') return 'bg-red-500/20 text-red-400';
    if (category === 'intermediate') return 'bg-amber-500/20 text-amber-400';
    return 'bg-emerald-500/20 text-emerald-400';
  };

  const getLevelText = (category: string) => {
    if (category === 'advanced') return 'متقدم';
    if (category === 'intermediate') return 'متوسط';
    return 'مبتدئ';
  };

  const totalResults = results.discussions.length + results.users.length;
  const showDiscussions = activeTab === 'all' || activeTab === 'discussions';
  const showUsers = activeTab === 'all' || activeTab === 'users';

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </Link>

        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-4">البحث</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في النقاشات والمستخدمين..."
              className="pr-12 pl-12 h-14 text-lg bg-card border-border/50 focus:border-primary/50"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
          
          <p className="text-xs text-muted-foreground mt-2 text-right">
            اكتب حرفين على الأقل ثم اضغط Enter
          </p>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        )}

        {/* Empty state (before search) */}
        {!isLoading && !hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-20"
          >
            <FileSearch className="w-20 h-20 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-bold mb-2">ابحث في AporiaLab</h2>
            <p className="text-muted-foreground">
              ابحث في النقاشات بالعنوان، المحتوى، أو الوسوم<br />
              أو ابحث عن المستخدمين بالاسم أو السيرة الذاتية
            </p>
          </motion.div>
        )}

        {/* No results */}
        {!isLoading && hasSearched && totalResults === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <FileSearch className="w-20 h-20 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-bold mb-2">لا توجد نتائج</h2>
            <p className="text-muted-foreground">
              لم نجد أي شيء يطابق <span className="text-primary font-bold">"{query}"</span>
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              جرّب كلمات مختلفة أو أكثر عمومية
            </p>
          </motion.div>
        )}

        {/* Results */}
        {!isLoading && hasSearched && totalResults > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <Button
                variant={activeTab === 'all' ? 'default' : 'outline'}
                onClick={() => setActiveTab('all')}
                className="gap-2"
              >
                الكل ({totalResults})
              </Button>
              <Button
                variant={activeTab === 'discussions' ? 'default' : 'outline'}
                onClick={() => setActiveTab('discussions')}
                className="gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                نقاشات ({results.discussions.length})
              </Button>
              <Button
                variant={activeTab === 'users' ? 'default' : 'outline'}
                onClick={() => setActiveTab('users')}
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                مستخدمون ({results.users.length})
              </Button>
            </div>

            {/* Users Section */}
            {showUsers && results.users.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
              >
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  المستخدمون
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.users.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -3 }}
                    >
                      <Link
                        to={`/profile/${user.id}`}
                        className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary overflow-hidden flex-shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold truncate">{user.name}</h3>
                          {user.bio && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{user.bio}</p>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex-shrink-0">
                          <span className="font-medium text-foreground">{(user.reputation || 0).toLocaleString()}</span>
                          <span className="block">نقطة</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Discussions Section */}
            {showDiscussions && results.discussions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  النقاشات
                </h2>
                <div className="space-y-3">
                  {results.discussions.map((discussion, index) => (
                    <motion.div
                      key={discussion._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -3 }}
                    >
                      <Link
                        to={`/discussion/${discussion._id}`}
                        className="block p-5 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all"
                      >
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <Badge variant="secondary" className={getLevelColor(discussion.category)}>
                            {getLevelText(discussion.category)}
                          </Badge>
                          {discussion.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
                          ))}
                        </div>
                        <h3 className="font-bold text-lg mb-2 hover:text-primary transition-colors">
                          {discussion.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {discussion.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>بواسطة {discussion.author.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {discussion.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {discussion.upvotes.length}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {discussion.commentCount}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
