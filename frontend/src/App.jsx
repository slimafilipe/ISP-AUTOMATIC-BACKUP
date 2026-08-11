import React, { useState, useEffect } from 'react';
import OltForm from './components/OltForm';
import SearchBar from './components/SearchBar';
import OltTable from './components/OltTable';

export default function App() {
  const [olts, setOlts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);
  const [backupStatus, setBackupStatus] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    username: '',
    password: '',
  });

  const API_BASE = '/api/v1/olts';

  const fetchOlts = async () => {
    try {
      const response = await fetch(API_BASE);
      if (response.ok) {
        const data = await response.json();
        setOlts(data);
      }
    } catch (error) {
      console.error('Erro ao buscar OLTs:', error);
    }
  };

  useEffect(() => {
    fetchOlts();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoadingForm(true);

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: '', ip: '', username: '', password: '' });
        fetchOlts();
        alert('OLT cadastrada com sucesso.');
      } else {
        alert('Erro ao cadastrar OLT no servidor.');
      }
    } catch (error) {
      console.error('Erro de rede ao salvar:', error);
      alert('Falha na conexao com o servidor.');
    } finally {
      setLoadingForm(false);
    }
  };

  const handleManualBackup = async (id) => {
    setBackupStatus((prev) => ({
      ...prev,
      [id]: { state: 'LOADING', msg: '' },
    }));

    try {
      const response = await fetch(`${API_BASE}/${id}/manual-backup`, {
        method: 'POST',
      });

      if (response.ok) {
        setBackupStatus((prev) => ({
          ...prev,
          [id]: { state: 'SUCCESS', msg: '' },
        }));
      } else {
        setBackupStatus((prev) => ({
          ...prev,
          [id]: { state: 'ERROR', msg: 'Erro retornado pela OLT' },
        }));
      }
    } catch (error) {
      setBackupStatus((prev) => ({
        ...prev,
        [id]: { state: 'ERROR', msg: error.message },
      }));
    }
  };

  const handleDownloadGit = async (id) => {
    try {
      window.open(`${API_BASE}/${id}/download-git`, '_blank');
    } catch (error) {
      console.error('Erro ao disparar download:', error);
    }
  };

  const filteredOlts = olts.filter((olt) => {
    const term = searchTerm.toLowerCase();
    const nomeOlt = (olt.nameolt || olt.nameOLT || '').toLowerCase();
    const ipOlt = olt.ipOlt || olt.ip_olt || olt.IpOlt || '';
    return nomeOlt.includes(term) || ipOlt.includes(term);
  });

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg)',
      color: 'var(--text)',
      padding: '32px 16px',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── Header ────────────────────────────────── */}
        <header style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          paddingBottom: '24px',
          marginBottom: '32px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '29px',
              fontWeight: 600,
              letterSpacing: '-1.6px',
              lineHeight: 1.13,
              color: 'var(--text)',
            }}>
              Backup<span style={{ color: 'var(--accent)' }}>Think</span>
            </h1>
            <p style={{
              margin: '6px 0 0',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-muted)',
              letterSpacing: '-0.13px',
            }}>
              Gerenciamento de backups automaticos para cartoes de gerencia
            </p>
          </div>

          {olts.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
              }}>
                Dispositivos
              </span>
              <span style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--state-success)',
                lineHeight: 1,
              }}>
                {olts.length}
              </span>
            </div>
          )}
        </header>

        {/* ── Form ──────────────────────────────────── */}
        <section aria-label="Cadastrar nova OLT">
          <OltForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleFormSubmit}
            loading={loadingForm}
          />
        </section>

        {/* ── Table section ─────────────────────────── */}
        <section aria-label="Dispositivos cadastrados" style={{ marginTop: '40px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--text)',
              letterSpacing: '-0.3px',
            }}>
              Dispositivos cadastrados
            </h2>
            {filteredOlts.length > 0 && (
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--accent-subtle)',
                color: 'var(--state-success)',
                border: '1px solid var(--accent-border)',
              }}>
                {filteredOlts.length}
              </span>
            )}
          </div>

          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <OltTable
            olts={filteredOlts}
            backupStatus={backupStatus}
            onManualBackup={handleManualBackup}
            onDownloadGit={handleDownloadGit}
          />
        </section>

      </div>
    </div>
  );
}