import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({ 
  value, 
  options, 
  onChange, 
  icon, 
  placeholder = "Select an option...",
  background = '#0f172a',
  padding = '0.75rem 1rem',
  triggerStyle = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Only consider an option selected if value is present and non-empty
  const selectedOption = value ? options.find(opt => opt.value === value) : null;

  // Filter out empty/placeholder values from the dropdown list items
  const validOptions = options.filter(opt => opt.value !== '' && opt.value !== undefined && opt.value !== null);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <style>{`
        .custom-dropdown-menu::-webkit-scrollbar {
          width: 6px;
        }
        .custom-dropdown-menu::-webkit-scrollbar-track {
          background: ${background};
          border-radius: 8px;
        }
        .custom-dropdown-menu::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 8px;
        }
        .custom-dropdown-menu::-webkit-scrollbar-thumb:hover {
          background: #38bdf8;
        }
      `}</style>

      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          background: background,
          border: `1px solid ${isOpen ? '#38bdf8' : '#334155'}`,
          borderRadius: '10px',
          padding: padding,
          color: selectedOption ? '#f8fafc' : '#94a3b8',
          fontSize: '0.95rem',
          boxSizing: 'border-box',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: isOpen ? '0 0 0 2px rgba(56, 189, 248, 0.15)' : 'none',
          transition: 'all 0.2s',
          position: 'relative',
          ...triggerStyle
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {icon && <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', position: padding.includes('2.75rem') ? 'absolute' : 'static', left: padding.includes('2.75rem') ? '1rem' : 'auto' }}>{icon}</span>}
          <span style={{ marginLeft: padding.includes('2.75rem') ? '0.5rem' : '0' }}>{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown size={16} color="#94a3b8" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </div>

      {/* Menu Options Container */}
      {isOpen && (
        <div 
          className="custom-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '100%',
            maxHeight: '225px',
            overflowY: 'auto',
            background: background,
            border: '1px solid #334155',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
            zIndex: 50,
            padding: '0.35rem',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}
        >
          {validOptions.map((opt, idx) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={idx}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: isSelected ? '#1e293b' : 'transparent',
                  color: isSelected ? '#38bdf8' : '#cbd5e1',
                  fontSize: '0.9rem',
                  fontWeight: isSelected ? '600' : '400',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.15s',
                  flexShrink: 0
                }}
                onMouseEnter={e => {
                  if (!isSelected) e.currentTarget.style.background = '#1e293b88';
                }}
                onMouseLeave={e => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={16} color="#38bdf8" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}