import React from 'react';

export default function OltForm({ formData, setFormData, onSubmit, loading }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fields = [
    { label: 'Nome da OLT', name: 'name', type: 'text', placeholder: 'Ex: FOVEIRO' },
    { label: 'Endereco IP', name: 'ip', type: 'text', placeholder: 'Ex: 172.17.247.14' },
    { label: 'Usuario', name: 'username', type: 'text', placeholder: 'tkth' },
    { label: 'Senha', name: 'password', type: 'password', placeholder: '••••••••' },
  ];

  const inputBase = {
    display: 'block',
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 12px',
    color: 'var(--text)',
    fontSize: '14px',
    fontWeight: 500,
    outline: 'none',
    transition: `border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)`,
    fontFamily: 'var(--font-sans)',
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = 'var(--accent)';
    e.target.style.boxShadow = '0 0 0 3px rgba(40,93,73,0.15)';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = 'var(--border)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '24px',
    }}>
      <h2 style={{
        margin: '0 0 20px',
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--text)',
        letterSpacing: '-0.13px',
      }}>
        Cadastrar nova OLT
      </h2>

      <form onSubmit={onSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}>
          {fields.map((field) => (
            <div key={field.name}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: '6px',
              }}>
                {field.label}
              </label>
              <input
                id={`olt-field-${field.name}`}
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={inputBase}
                autoComplete={field.name === 'password' ? 'current-password' : 'off'}
                required
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            id="btn-salvar-olt"
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'var(--accent-subtle)' : 'var(--accent)',
              border: loading ? '1px solid var(--accent-border)' : 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 20px',
              color: loading ? 'var(--text-muted)' : '#ffffff',
              fontWeight: 600,
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: `all var(--dur-fast) var(--ease)`,
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.1px',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'var(--accent-hover)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'var(--accent)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(0.98)';
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
          >
            {loading ? 'Salvando...' : 'Salvar OLT'}
          </button>
        </div>
      </form>
    </div>
  );
}