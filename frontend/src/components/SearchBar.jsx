import React from 'react';

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div style={{ position: 'relative', marginBottom: '16px' }}>
      <div style={{
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
      }}>
        <SearchIcon />
      </div>
      <input
        id="search-olts"
        type="search"
        placeholder="Pesquisar por nome ou IP da OLT"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          display: 'block',
          width: '100%',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          paddingLeft: '38px',
          paddingRight: '16px',
          paddingTop: '10px',
          paddingBottom: '10px',
          color: 'var(--text)',
          fontSize: '14px',
          fontWeight: 500,
          outline: 'none',
          transition: `border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)`,
          fontFamily: 'var(--font-sans)',
          letterSpacing: '-0.13px',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--accent)';
          e.target.style.boxShadow = '0 0 0 3px rgba(40,93,73,0.15)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}