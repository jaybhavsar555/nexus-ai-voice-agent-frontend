import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * RichSelect - A premium glassmorphism dropdown component
 * @param {Array} options - Array of { id, name, description, icon }
 * @param {string} value - Current selected id
 * @param {function} onChange - Callback when selection changes
 * @param {string} label - Optional label text
 * @param {string} placeholder - Optional placeholder
 */
const RichSelect = ({ options, value, onChange, label, placeholder = 'Select an option' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`rich-select-wrapper ${isOpen ? 'is-open' : ''}`} ref={dropdownRef}>
      {label && <label className="rich-select-label">{label}</label>}
      
      <div 
        className={`rich-select-trigger glass ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? (
          <>
            <div className="rich-select-icon-box">
              {selectedOption.icon}
            </div>
            <div className="rich-select-info">
              <span className="rich-select-name">{selectedOption.name}</span>
            </div>
          </>
        ) : (
          <span className="rich-select-placeholder">{placeholder}</span>
        )}
        <ChevronDown size={16} className={`rich-select-chevron ${isOpen ? 'up' : ''}`} />
      </div>

      {isOpen && (
        <div className="rich-select-menu glass">
          {options.map((opt) => (
            <div 
              key={opt.id} 
              className={`rich-select-item ${value === opt.id ? 'active' : ''}`}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
            >
              <div className="rich-select-icon-box small">
                {opt.icon}
              </div>
              <div className="rich-select-info">
                <span className="rich-select-item-name">{opt.name}</span>
                {opt.description && <span className="rich-select-item-desc">{opt.description}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .rich-select-wrapper {
          position: relative;
          width: 100%;
          z-index: 10;
        }

        .rich-select-wrapper.is-open {
          z-index: 1000;
        }

        .rich-select-label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.6;
          font-weight: 600;
        }

        .rich-select-trigger {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid var(--border-color);
          min-height: 54px;
        }

        .rich-select-trigger:hover {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
        }

        .rich-select-trigger.open {
          border-color: var(--accent);
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.15);
        }

        .rich-select-icon-box {
          width: 32px;
          height: 32px;
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .rich-select-icon-box.small {
          width: 28px;
          height: 28px;
          font-size: 0.9rem;
        }

        .rich-select-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .rich-select-name {
          font-weight: 600;
          font-size: 0.95rem;
        }

        .rich-select-chevron {
          opacity: 0.5;
          transition: transform 0.3s ease;
        }

        .rich-select-chevron.up {
          transform: rotate(180deg);
        }

        .rich-select-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          max-height: 280px;
          overflow-y: auto;
          padding: 6px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.6);
          background: #1e293b;
          backdrop-filter: blur(12px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: dropdownSlide 0.2s cubic-bezier(0, 0, 0.2, 1);
          z-index: 1001;
        }

        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .rich-select-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 4px;
        }

        .rich-select-item:last-child {
          margin-bottom: 0;
        }

        .rich-select-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .rich-select-item.active {
          background: rgba(139, 92, 246, 0.12);
          color: var(--accent);
        }

        .rich-select-item-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .rich-select-item-desc {
          font-size: 0.75rem;
          opacity: 0.6;
          margin-top: 2px;
        }

        .rich-select-placeholder {
          opacity: 0.4;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default RichSelect;
