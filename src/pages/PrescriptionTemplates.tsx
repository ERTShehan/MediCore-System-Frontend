import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../hooks/useTheme";
import { 
  searchMedicalImage, 
  createTemplate, 
  getMyTemplates, 
  deleteTemplate 
} from "../services/template";
import { notify, ToastContainer } from "../components/ToastNotification";
import { 
  Search, Save, Trash2, Image as ImageIcon, 
  Loader2, ArrowLeft, ChevronUp, Plus,
  Upload, Grid, List,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";

interface Template {
  _id: string;
  name: string;
  imageUrl?: string;
  createdAt?: string;
}

const TemplateSkeleton = () => {
    const { theme } = useTheme();
    return (
        <div className={`rounded-xl border overflow-hidden animate-pulse ${
            theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'
        }`}>
            <div className={`h-40 w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-2">
                    <div className={`h-4 rounded w-1/3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    <div className={`h-8 w-8 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
                </div>
                <div className={`h-3 rounded w-2/3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </div>
        </div>
    );
};

export default function PrescriptionTemplates() {
  const { theme } = useTheme();
  
  // Form States
  const [query, setQuery] = useState("");
  const [searchedImage, setSearchedImage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // List & Data States
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchLocalQuery, setSearchLocalQuery] = useState("");

  // Loading & Pagination States
  const [isInitialLoading, setIsInitialLoading] = useState(true); 
  const [isLoadingMore, setIsLoadingMore] = useState(false);      
  const [visibleCount, setVisibleCount] = useState(6); // Initial load
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const loadMoreRef = useRef<HTMLDivElement>(null);


  // Initial Load
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Filter Logic
  useEffect(() => {
    const filtered = templates.filter(t => 
        t.name.toLowerCase().includes(searchLocalQuery.toLowerCase())
    );
    setFilteredTemplates(filtered);
  }, [searchLocalQuery, templates]);

  // Scroll Listener
  useEffect(() => {
      const handleScroll = () => {
          if (window.scrollY > 300) setShowScrollTop(true);
          else setShowScrollTop(false);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Infinite Scroll Observer
  useEffect(() => {
      const observer = new IntersectionObserver((entries) => {
          const target = entries[0];
          
          // Load more only if not currently loading, not initial loading, and has more items
          if (target.isIntersecting && !isLoadingMore && !isInitialLoading && visibleCount < filteredTemplates.length) {
              loadMoreItems();
          }
      }, { threshold: 0.5 });

      if (loadMoreRef.current) {
          observer.observe(loadMoreRef.current);
      }

      return () => {
          if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
      }
  }, [isLoadingMore, isInitialLoading, visibleCount, filteredTemplates]);



  const fetchTemplates = async () => {
    setIsInitialLoading(true);
    try {
      const res = await getMyTemplates();
      setTemplates(res.data);
      setFilteredTemplates(res.data);
    } catch (error) {
      notify.error("Failed to load templates");
    } finally {
      setTimeout(() => setIsInitialLoading(false), 1000); // Initial delay
    }
  };

  // Load exactly ONE row at a time with wireframe delay
  const loadMoreItems = () => {
      setIsLoadingMore(true);
      setTimeout(() => {
          setVisibleCount(prev => prev + 6); // Load)
          setIsLoadingMore(false);
      }, 1500); // 1.5 second wireframe display
  };

  // Scroll to Top AND Reset to Wireframe Loading State
  const scrollToTopAndReload = () => {
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Reset visible count to initial state
      setVisibleCount(6); 
      
      // Trigger initial loading state to show Wireframe again
      setIsInitialLoading(true);
      
      // Remove loading state after delay (Simulating reload)
      setTimeout(() => {
          setIsInitialLoading(false);
      }, 1200);
  };

  const handleSearchImage = async () => {
    if (!query.trim()) return notify.warning("Please enter a medicine name");
    setIsSearching(true);
    setSearchedImage(null);
    try {
      const res = await searchMedicalImage(query);
      if (res.imageUrl) {
        setSearchedImage(res.imageUrl);
        notify.success("Image found!");
      }
    } catch (error) {
      notify.error("No image found.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async (withImage: boolean) => {
    if (!query.trim()) return notify.warning("Name is required");
    setIsSaving(true);
    try {
      await createTemplate({
        name: query,
        imageUrl: withImage ? searchedImage : null
      });
      notify.success("Template saved successfully");
      setQuery("");
      setSearchedImage(null);
      fetchTemplates(); 
    } catch (error) {
      notify.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Delete this template?")) return;
    try {
      await deleteTemplate(id);
      const newTemplates = templates.filter(t => t._id !== id);
      setTemplates(newTemplates);
      setFilteredTemplates(newTemplates); 
      notify.success("Deleted");
    } catch (error) {
      notify.error("Failed to delete");
    }
  };

  // Stats calculation
  const stats = {
    total: templates.length,
    withImages: templates.filter(t => t.imageUrl).length,
    withoutImages: templates.filter(t => !t.imageUrl).length
  };

  return (
    <Layout>
      <ToastContainer />
      <div className={`min-h-screen pb-20 ${theme === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        
        {/* Header */}
        <div className={`sticky top-0 z-50 backdrop-blur-xl border-b ${theme === 'dark' ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
          <div className="px-6 py-4 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/doctor-dashboard" className={`p-2 rounded-lg transition-all hover:scale-105 ${
                  theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}>
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                    Prescription Templates
                  </h1>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Manage your medicine repository and prescription templates
                  </p>
                </div>
              </div>
              
              {/* Stats */}
              <div className={`hidden md:flex items-center gap-6 px-4 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
              }`}>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{stats.total}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div className="h-6 w-px bg-gray-700" />
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600">{stats.withImages}</div>
                  <div className="text-xs text-gray-500">With Images</div>
                </div>
                <div className="h-6 w-px bg-gray-700" />
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-600">{stats.withoutImages}</div>
                  <div className="text-xs text-gray-500">Text Only</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">
          
          {/* Create Template Card */}
          <div className={`rounded-2xl border shadow-lg overflow-hidden ${
            theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'
          }`}>
            <div className={`px-6 py-4 border-b ${
              theme === 'dark' ? 'border-gray-800 bg-linear-to-r from-gray-900 to-gray-800' : 'bg-linear-to-r from-blue-50 to-emerald-50 border-gray-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Create New Template</h2>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Search and add new medicine templates to your repository
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Medicine Name
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter medicine name (e.g., Paracetamol 500mg)..."
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-all ${
                          theme === 'dark' 
                            ? 'bg-gray-800 border-gray-700 focus:border-blue-500 text-white' 
                            : 'bg-white border-gray-300 focus:border-blue-500'
                        }`}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchImage()}
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        {isSearching ? (
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        ) : (
                          <Search className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <button
                        onClick={handleSearchImage}
                        disabled={isSearching || !query.trim()}
                        className={`absolute right-2 top-2 px-4 py-1.5 rounded-lg font-medium transition-all ${
                          isSearching || !query.trim()
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
                        }`}
                      >
                        Search
                      </button>
                    </div>
                    <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Press Enter or click Search to find medicine image
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <button
                      onClick={() => handleSave(false)}
                      disabled={isSaving || !query.trim()}
                      className={`group flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 transition-all ${
                        theme === 'dark'
                          ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      } ${isSaving || !query.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Save className="w-4 h-4" />
                      <span className="font-medium">Save as Text Template</span>
                    </button>
                    
                    <button
                      onClick={() => handleSave(true)}
                      disabled={isSaving || !query.trim() || !searchedImage}
                      className={`group flex items-center justify-center gap-3 py-3.5 rounded-xl font-medium transition-all relative overflow-hidden ${
                        isSaving || !query.trim() || !searchedImage
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Upload className="w-4 h-4" />
                        <span>Save with Image</span>
                      </div>
                      {searchedImage && (
                        <CheckCircle className="absolute right-4 w-4 h-4 text-white/80" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Preview Section */}
                <div className={`rounded-xl border-2 p-4 ${theme === 'dark' ? 'border-gray-800 bg-gray-900/30' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Image Preview
                    </h3>
                    {searchedImage && (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        Found
                      </span>
                    )}
                  </div>
                  
                  <div className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    searchedImage 
                      ? 'border-emerald-500/30' 
                      : theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
                  }`}>
                    {searchedImage ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full h-full"
                      >
                        <img 
                          src={searchedImage} 
                          alt="Preview" 
                          className="w-full h-full object-contain p-2"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/50 to-transparent p-3">
                          <p className="text-xs text-white truncate">{query}</p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                        }`}>
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className={`text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Search for medicine to preview image
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Saved Templates Grid */}
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                 <h2 className="text-lg font-semibold flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">2</span>
                    Saved Templates ({filteredTemplates.length})
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="relative w-full md:w-96">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input 
                        type="text" 
                        value={searchLocalQuery}
                        onChange={(e) => setSearchLocalQuery(e.target.value)}
                        placeholder="Search saved templates..."
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                            theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                        }`}
                    />
                </div>
                  
                  {/* View Toggle */}
                  {/* <div className={`flex items-center rounded-lg border overflow-hidden ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
                  }`}>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2.5 transition-all ${viewMode === 'grid' 
                        ? theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500 text-white'
                        : theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2.5 transition-all ${viewMode === 'list' 
                        ? theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500 text-white'
                        : theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div> */}
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Show Initial Skeletons (On Page Load or Scroll-To-Top Reset) */}
                {isInitialLoading && Array.from({ length: 9 }).map((_, i) => (
                   <TemplateSkeleton key={`init-skel-${i}`} />
                ))}

                {/* Show Real Data (After Loading) */}
                {!isInitialLoading && (
                    <AnimatePresence mode="popLayout">
                        {filteredTemplates.slice(0, visibleCount).map((template) => (
                            <motion.div 
                                key={template._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`relative group rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-xl ${
                                    theme === 'dark' ? 'bg-gray-900/30 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                {/* Image Part */}
                                <div className={`h-40 w-full flex items-center justify-center overflow-hidden p-4 ${
                                    theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
                                }`}>
                                    {template.imageUrl ? (
                                        <img src={template.imageUrl} alt={template.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-gray-400 opacity-50">
                                            <span className="text-3xl font-bold mb-1">Rx</span>
                                            <span className="text-xs">No Image</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content Part */}
                                <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                                    <h3 className={`font-semibold text-center truncate text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                        {template.name}
                                    </h3>
                                </div>

                                {/* Delete Button */}
                                <button 
                                    onClick={() => handleDelete(template._id)}
                                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-md transform scale-90 group-hover:scale-100"
                                    title="Delete Template"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                {/* Status Badge */}
                                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
                                  template.imageUrl 
                                    ? 'bg-emerald-500/20 text-emerald-300' 
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {template.imageUrl ? 'With Image' : 'Text Only'}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {!isInitialLoading && isLoadingMore && Array.from({ length: 6 }).map((_, i) => (
                    <TemplateSkeleton key={`more-skel-${i}`} />
                ))}

            </div>

            {/* Empty State */}
            {!isInitialLoading && filteredTemplates.length === 0 && (
                <div className={`text-center py-16 border-2 border-dashed rounded-2xl ${theme === 'dark' ? 'border-gray-800 bg-gray-900/20' : 'border-gray-200 bg-gray-50'}`}>
                    <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <ImageIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                    <p className={`max-w-md mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {searchLocalQuery 
                        ? `No templates match "${searchLocalQuery}". Try a different search.`
                        : "Start by creating your first prescription template above."}
                    </p>
                </div>
            )}

            {/* Sentinel Element for Infinite Scroll */}
            <div ref={loadMoreRef} className="h-10 w-full" />
          </div>

        </div>

        <AnimatePresence>
            {showScrollTop && (
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    onClick={scrollToTopAndReload}
                    className="fixed bottom-8 right-8 p-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-colors z-50 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                >
                    <ChevronUp className="w-6 h-6" />
                </motion.button>
            )}
        </AnimatePresence>

        <button
          onClick={() => {
            (document.querySelector('input[type="text"]') as HTMLInputElement | null)?.focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`fixed bottom-24 right-8 p-4 rounded-full shadow-2xl z-40 transition-all hover:scale-110 ${
            theme === 'dark'
              ? 'bg-linear-to-br from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white'
              : 'bg-linear-to-br from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white'
          }`}
        >
          <Plus className="w-6 h-6" />
        </button>

      </div>
    </Layout>
  );
}