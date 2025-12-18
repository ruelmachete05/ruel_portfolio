import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './BibleVerse.css';


const BibleVerse = () => {
  const [verse, setVerse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        const response = await fetch('https://labs.bible.org/api/?passage=random&type=text');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        setVerse(data);
      } catch (e) {
        console.error("Failed to fetch Bible verse:", e);
        setError("Could not fetch a verse at this time.");
      } finally {
        setLoading(false);
      }
    };

    fetchVerse();
  }, []);

  return (
    <motion.div 
      className="verse-container"
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      {loading && <p className="verse-loading">Fetching an inspirational verse...</p>}
      {error && <p className="verse-error">{error}</p>}
      {verse && (
        <blockquote className="verse-text">
          <p dangerouslySetInnerHTML={{ __html: verse }} />
        </blockquote>
      )}
    </motion.div>
  );
};

export default BibleVerse;