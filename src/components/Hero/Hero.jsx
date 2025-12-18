import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-scroll';
import { useLocation } from 'react-router-dom'; 
import { FiSave, FiUploadCloud, FiLoader } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import BibleVerse from '../BibleVerse/BibleVerse.css';


import './Hero.css'; // Make sure this import is here!
import BibleVerse from '../Bibleverse/Bibleverse.jsx';
import ChromaGrid from '../ChromaGrid/ChromaGrid.jsx';
import { supabase } from '../../supabaseClient'; 

const Hero = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin');

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState({
    headline: "Hi! My Name is Ruel.",
    bio: "Loading...",
    cards: [] 
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data } = await supabase
        .from('hero_content')
        .select('*')
        .eq('id', 1)
        .single();

      if (data) {
        setContent({ 
          headline: data.headline, 
          bio: data.bio, 
          cards: data.cards || [] 
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = (field, value) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const handleCardUpdate = (index, field, value) => {
    const newCards = [...content.cards];
    newCards[index][field] = value;
    setContent(prev => ({ ...prev, cards: newCards }));
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading("Uploading...");
    try {
      const fileName = `card-${index}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
      
      const newCards = [...content.cards];
      newCards[index].image = data.publicUrl;
      setContent(prev => ({ ...prev, cards: newCards }));
      toast.success("Image updated!", { id: toastId });
    } catch (error) {
      toast.error("Upload failed", { id: toastId });
    }
  };

  const saveChanges = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('hero_content')
      .update({
        headline: content.headline,
        bio: content.bio,
        cards: content.cards
      })
      .eq('id', 1);

    if (error) toast.error("Failed to save");
    else toast.success("Website Updated Successfully!");
    setLoading(false);
  };

  return (
    <section id="hero" className={`hero-section ${isAdmin ? 'admin-mode' : ''}`}>
      {isAdmin && <Toaster position="top-center" />}

      {/* ADMIN SAVE BUTTON */}
      {isAdmin && (
        <div className="admin-save-floater">
          <button onClick={saveChanges} disabled={loading}>
            {loading ? <FiLoader className="spin" /> : <FiSave />} 
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* LEFT SIDE CONTENT */}
      <div className="hero-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {isAdmin ? (
            <textarea 
              className="editable-input headline-input"
              value={content.headline}
              onChange={(e) => handleUpdate('headline', e.target.value)}
              placeholder="Headline Text"
            />
          ) : (
            <h1>{content.headline}</h1>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {isAdmin ? (
            <textarea 
              className="editable-input bio-input"
              value={content.bio}
              onChange={(e) => handleUpdate('bio', e.target.value)}
              placeholder="Bio Description"
            />
          ) : (
            <p>{content.bio}</p>
          )}
        </motion.div>
        
        {!isAdmin && <BibleVerse />}

        <div style={{marginTop: '50px'}}>
           <button className="hero-button" style={isAdmin ? {pointerEvents: 'none', opacity: 0.5} : {}}>
             Check out my projects!
           </button>
        </div>
      </div>

      {/* RIGHT SIDE GRID */}
      <div className="hero-grid-container">
        {isAdmin ? (
          // --- ADMIN VIEW (Simple Editor) ---
          <div className="admin-grid-editor">
            {content.cards.map((card, idx) => (
              <div key={idx} className="admin-card-edit">
                <div className="img-preview" style={{backgroundImage: `url(${card.image})`}}>
                  <label title="Change Image">
                    <FiUploadCloud />
                    <input type="file" hidden onChange={(e) => handleImageUpload(e, idx)} />
                  </label>
                </div>
                <input 
                  value={card.title} 
                  onChange={(e) => handleCardUpdate(idx, 'title', e.target.value)}
                  placeholder="Title" 
                />
                <input 
                  value={card.subtitle} 
                  onChange={(e) => handleCardUpdate(idx, 'subtitle', e.target.value)}
                  placeholder="Subtitle" 
                />
              </div>
            ))}
          </div>
        ) : (
          // --- PUBLIC VIEW (Animated Grid) ---
          <ChromaGrid 
            items={content.cards.length > 0 ? content.cards : []} 
            columns={3} 
            rows={1} 
            radius={200} 
            damping={0.5} 
          />
        )}
      </div>
    </section>
  );
};

export default Hero;