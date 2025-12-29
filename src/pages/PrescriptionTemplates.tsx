import React, { useState, useEffect } from "react";
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
  Loader2, ArrowLeft 
} from "lucide-react";
import { Link } from "react-router-dom";

interface Template {
  _id: string;
  name: string;
  imageUrl?: string;
}

export default function PrescriptionTemplates() {
  const { theme } = useTheme();
  
  // States
  const [query, setQuery] = useState("");
  const [searchedImage, setSearchedImage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Load saved templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await getMyTemplates();
      setTemplates(res.data);
    } catch (error) {
      notify.error("Failed to load templates");
    } finally {
      setLoadingTemplates(false);
    }
  };

  // 1. Search Image
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
      notify.error("No image found. Try a different name.");
    } finally {
      setIsSearching(false);
    }
  };

  // 2. Save Template
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
      fetchTemplates(); // Refresh list
    } catch (error) {
      notify.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Delete Template
  const handleDelete = async (id: string) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await deleteTemplate(id);
      setTemplates(templates.filter(t => t._id !== id));
      notify.success("Deleted successfully");
    } catch (error) {
      notify.error("Failed to delete");
    }
  };

  return (
    <Layout>
      <ToastContainer />
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        
        {/* Header */}
        <div className={`border-b px-8 py-6 ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center gap-4">
            <Link to="/doctor-dashboard" className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Prescription Templates</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Manage medicine names and images for quick access</p>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className={`p-6 rounded-xl border shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className="text-lg font-semibold mb-4">Add New Template</h2>
              
              {/* Input Area */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Medicine / Template Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="E.g. Panadol 500mg"
                      className={`w-full pl-4 pr-12 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <button 
                      onClick={handleSearchImage}
                      disabled={isSearching || !query}
                      className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSearching ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4"/>}
                    </button>
                  </div>
                </div>

                {/* Image Preview Area */}
                <div className={`aspect-video rounded-lg flex items-center justify-center border-2 border-dashed overflow-hidden relative ${
                   theme === 'dark' ? 'border-gray-600 bg-gray-900' : 'border-gray-300 bg-gray-50'
                }`}>
                  {searchedImage ? (
                    <img src={searchedImage} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <span className="text-xs">Image preview will appear here</span>
                    </div>
                  )}
                </div>

                {/* Save Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleSave(false)}
                    disabled={isSaving || !query}
                    className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
                      theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    Only Name
                  </button>
                  <button
                    onClick={() => handleSave(true)}
                    disabled={isSaving || !query || !searchedImage}
                    className="px-4 py-2 rounded-lg font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    With Image
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Saved List */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Saved Templates ({templates.length})</h2>
            
            {loadingTemplates ? (
               <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500"/></div>
            ) : templates.length === 0 ? (
               <div className={`text-center py-12 border-2 border-dashed rounded-xl ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                 <p className="text-gray-500">No templates added yet.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {templates.map((template) => (
                    <motion.div 
                      key={template._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`relative group rounded-xl border overflow-hidden transition-shadow hover:shadow-lg ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      }`}
                    >
                      {/* Image Part */}
                      <div className={`h-32 w-full flex items-center justify-center overflow-hidden ${
                        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
                      }`}>
                        {template.imageUrl ? (
                          <img src={template.imageUrl} alt={template.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl font-bold text-gray-400 select-none">Rx</span>
                        )}
                      </div>

                      {/* Content Part */}
                      <div className="p-4">
                        <h3 className={`font-semibold truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                          {template.name}
                        </h3>
                      </div>

                      {/* Delete Button (Visible on Hover) */}
                      <button 
                        onClick={() => handleDelete(template._id)}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
}