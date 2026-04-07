import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ChildContext = createContext(null);

export const ChildProvider = ({ children }) => {
  const [childList, setChildList] = useState([]);
  const [activeChild, setActiveChild] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get('/parents/children')
      .then(res => {
        setChildList(res.data);
        if (res.data.length > 0) {
          const saved = localStorage.getItem('activeChildId');
          const found = res.data.find(c => c._id === saved);
          setActiveChild(found || res.data[0]);
        }
      })
      .catch(() => {
        // fallback demo child
        const demo = { _id: 'child-demo', userId: 'Demo Child', isLocked: false };
        setChildList([demo]);
        setActiveChild(demo);
      });
  }, []);

  const selectChild = (child) => {
    setActiveChild(child);
    localStorage.setItem('activeChildId', child._id);
  };

  return (
    <ChildContext.Provider value={{ childList, activeChild, selectChild }}>
      {children}
    </ChildContext.Provider>
  );
};

export const useChild = () => useContext(ChildContext);
