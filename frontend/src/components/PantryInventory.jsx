import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import GuidedTour from './GuidedTour';

const PantryInventory = () => {
  const [pantryItems, setPantryItems] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);
  const { token, user } = useAuth();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`smartmeal_pantry_${user?._id || 'guest'}`);
    if (saved) {
      try {
        setPantryItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse pantry data', e);
      }
    } else {
      // Default initial state
      setPantryItems([
        { name: 'Olive Oil', qty: 1, unit: 'bottle' },
        { name: 'Basmati Rice', qty: 2, unit: 'kg' }
      ]);
    }
  }, []);

  // Save to localStorage whenever it changes
  const savePantry = (items) => {
    setPantryItems(items);
    localStorage.setItem(`smartmeal_pantry_${user?._id || 'guest'}`, JSON.stringify(items));
  };

  const handleAddPantryItem = () => {
    savePantry([{ name: '', qty: 1, unit: 'pcs' }, ...pantryItems]);
  };

  const handlePantryChange = (index, field, value) => {
    const newItems = [...pantryItems];
    newItems[index][field] = value;
    savePantry(newItems);
  };

  const removePantryItem = (indexToRemove) => {
    savePantry(pantryItems.filter((_, index) => index !== indexToRemove));
    toast.success('Item removed from pantry');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all items in your pantry?')) {
      savePantry([]);
      toast.success('All items deleted');
    }
  };

  const handleSave = () => {
    // Optionally clean up empty ones before explicit save
    const cleaned = pantryItems.filter(item => item.name.trim() !== '');
    if (cleaned.length !== pantryItems.length) {
      savePantry(cleaned);
    }
    toast.success('Pantry inventory saved successfully!');
  };

  const [isGeneratingPantry, setIsGeneratingPantry] = useState(false);

  const handleAutoFillPantry = async () => {
    setIsGeneratingPantry(true);
    const toastId = toast.loading('Consulting AI for common pantry staples...');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartmealai.onrender.com/api/plan/common-pantry', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success && result.data) {
        // filter out items already in pantry
        const newItems = result.data.filter(aiItem => 
          !pantryItems.some(pItem => pItem.name.toLowerCase() === aiItem.name.toLowerCase())
        );
        const combined = [...newItems, ...pantryItems];
        savePantry(combined);
        toast.success(`Added ${newItems.length} common items!`, { id: toastId });
      } else {
        toast.error('Failed to get pantry items.', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error.', { id: toastId });
    } finally {
      setIsGeneratingPantry(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsScanning(true);
    const loadingToast = toast.loading('Scanning image with AI...');

    try {
      // Convert to Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Image = reader.result;
        
        try {
          const response = await fetch('https://smartmealai.onrender.com/api/plan/scan-pantry', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ image: base64Image })
          });

          const result = await response.json();
          if (result.success && result.data) {
            const newItems = [...pantryItems, ...result.data];
            savePantry(newItems);
            toast.success(`Found ${result.data.length} ingredients!`, { id: loadingToast });
          } else {
            toast.error(result.message || 'Failed to scan image', { id: loadingToast });
          }
        } catch (apiError) {
          console.error(apiError);
          toast.error('Network error during scan.', { id: loadingToast });
        } finally {
          setIsScanning(false);
          // reset input
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
    } catch (error) {
      console.error(error);
      toast.error('Error processing image.', { id: loadingToast });
      setIsScanning(false);
    }
  };

  const tourSteps = [
    {
      target: '.tour-scan-ai',
      title: 'Scan with AI',
      content: 'Too tired to type? Upload a picture of your fridge or pantry shelf, and our AI will automatically identify and add the ingredients for you!',
      placement: 'bottom',
    },
    {
      target: '.tour-auto-staple',
      title: 'Auto-fill Common Staples',
      content: 'Click this to instantly add 10 common household essentials (like salt, pepper, oil) so you don\'t have to add them one by one.',
      placement: 'bottom',
    }
  ];

  return (
    <div className="p-4 md:p-margin max-w-max-width mx-auto w-full flex-1">
      <GuidedTour steps={tourSteps} tourKey="pantry" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="font-h1 text-h1 text-on-surface">Pantry Inventory</h2>
          <p className="mt-2 text-text-secondary">Manage what you have in your kitchen. We'll use this to optimize your grocery list.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-primary hover:bg-primary-hover text-on-primary font-body-sm font-semibold py-3 md:py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 w-full md:w-auto shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px] md:text-[18px]">save</span>
          Save Changes
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        
        {/* Actions Top Bar */}
        <div className="mb-6 border-b border-border pb-4 flex gap-4 flex-wrap justify-between items-center">
          <div className="flex gap-4 flex-wrap items-center">
            <button 
              type="button" 
              onClick={handleAddPantryItem}
              className="flex items-center gap-1 text-primary hover:text-primary-hover font-body-sm font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Add manually
            </button>
            
            <div className="w-px h-6 bg-border mx-2 hidden sm:block"></div>
            
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()}
              disabled={isScanning}
              className="tour-scan-ai flex items-center gap-1 text-[#2B5C8F] hover:text-[#1A3D63] transition-colors font-body-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              {isScanning ? 'Scanning...' : 'Scan with AI'}
            </button>

            <div className="w-px h-6 bg-border mx-2 hidden sm:block"></div>
            
            <button 
              type="button" 
              onClick={handleAutoFillPantry}
              disabled={isGeneratingPantry}
              className="tour-auto-staple flex items-center gap-1 text-secondary hover:text-secondary-hover transition-colors font-body-sm font-semibold disabled:opacity-50"
            >
              {isGeneratingPantry ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              )}
              {isGeneratingPantry ? 'Adding...' : 'Auto-add common staples (AI)'}
            </button>
          </div>
          
          {pantryItems.length > 0 && (
            <button 
              type="button" 
              onClick={handleClearAll}
              className="flex items-center gap-1 text-danger hover:text-danger/80 transition-colors font-body-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              Bulk Delete
            </button>
          )}
        </div>

        {pantryItems.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-text-secondary mb-3">kitchen</span>
            <p className="text-text-secondary">Your pantry is empty.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pantryItems.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-background p-3 rounded-lg border border-border">
                <div className="flex-1 w-full">
                  <label className="text-xs text-text-secondary uppercase mb-1 block md:hidden">Ingredient</label>
                  <input 
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-on-background font-body-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                    placeholder="Ingredient Name (e.g., Pasta)" 
                    type="text"
                    value={item.name}
                    onChange={(e) => handlePantryChange(index, 'name', e.target.value)}
                  />
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                  <div className="w-24">
                    <label className="text-xs text-text-secondary uppercase mb-1 block md:hidden">Qty</label>
                    <input 
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-on-background font-body-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                      placeholder="Qty" 
                      type="number"
                      min="0"
                      step="any"
                      value={item.qty}
                      onChange={(e) => handlePantryChange(index, 'qty', parseFloat(e.target.value) || '')}
                    />
                  </div>
                  
                  <div className="w-32">
                    <label className="text-xs text-text-secondary uppercase mb-1 block md:hidden">Unit</label>
                    <select
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-on-background font-body-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      value={item.unit}
                      onChange={(e) => handlePantryChange(index, 'unit', e.target.value)}
                    >
                      <option value="pcs">pcs</option>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="lbs">lbs</option>
                      <option value="oz">oz</option>
                      <option value="L">L</option>
                      <option value="ml">ml</option>
                      <option value="cups">cups</option>
                      <option value="tbsp">tbsp</option>
                      <option value="tsp">tsp</option>
                      <option value="bottle">bottle</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button 
                      className="p-2 text-text-secondary hover:text-danger hover:bg-surface-variant rounded-lg transition-colors border border-transparent mt-auto" 
                      type="button" 
                      onClick={() => removePantryItem(index)}
                      title="Remove Item"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default PantryInventory;
