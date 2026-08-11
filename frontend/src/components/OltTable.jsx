import React from 'react';

const STATUS_CONFIG = {
  LOADING: {
    label: 'Processando',
    color: 'var(--state-loading)',
    bg: 'var(--state-loading-bg)',
    border: 'var(--state-loading-border)',
  },
  SUCCESS: {
    label: 'Sucesso',
    color: 'var(--state-success)',
    bg: 'var(--state-success-bg)',
    border: 'var(--state-success-border)',
  },
  ERROR: {
    label: 'Falhou',
    color: 'var(--state-error)',
    bg: 'var(--state-error-bg)',
    border: 'var(--state-error-border)',
  },
  IDLE: {
    label: 'Pronto',
    color: 'var(--state-idle)',
    bg: 'var(--state-idle-bg)',
    border: 'var(--state-idle-border)',
  },
};

const TH_STYLE = {
  padding: '12px 16px',
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  textAlign: 'left',
  whiteSpace: 'nowrap',
};

export default function OltTable({ olts, backupStatus, onManualBackup, onDownloadGit }) {
  if (olts.length === 0) {
    return (
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '48px 24px',
        textAlign: 'center',
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
          Nenhuma OLT encontrada. Cadastre uma acima ou ajuste sua busca.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '14px',
          minWidth: '580px',
        }}>
          <thead>
            <tr style={{
              background: 'var(--surface-raised)',
              borderBottom: '1px solid var(--border)',
            }}>
              <th style={TH_STYLE}>Nome OLT</th>
              <th style={TH_STYLE}>Endereco IP</th>
              <th style={TH_STYLE}>Status</th>
              <th style={{ ...TH_STYLE, textAlign: 'right' }}>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {olts.map((olt, index) => {
              const id = olt.id;
              const status = backupStatus[id] || { state: 'IDLE', msg: '' };
              const cfg = STATUS_CONFIG[status.state] || STATUS_CONFIG.IDLE;
              const isLast = index === olts.length - 1;
              const hasError = status.state === 'ERROR';

              return (
                <tr
                  key={id}
                  style={{
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    transition: `background var(--dur-fast) var(--ease)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface-raised)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {/* Nome */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {hasError && (
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--state-error)',
                          flexShrink: 0,
                        }} />
                      )}
                      <span style={{
                        fontWeight: 600,
                        color: 'var(--text)',
                        letterSpacing: '-0.13px',
                      }}>
                        {olt.nameolt || olt.nameOLT}
                      </span>
                    </div>
                  </td>

                  {/* IP */}
                  <td style={{ padding: '14px 16px' }}>
                    <code style={{
                      color: 'var(--state-success)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: 'var(--state-success-bg)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--state-success-border)',
                    }}>
                      {olt.ipOlt || olt.ip_olt || olt.IpOlt}
                    </code>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      title={status.msg || ''}
                      style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: cfg.bg,
                        color: cfg.color,
                        border: `1px solid ${cfg.border}`,
                        letterSpacing: '-0.1px',
                      }}
                    >
                      {cfg.label}
                    </span>
                  </td>

                  {/* Acoes */}
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <ActionButton
                        id={`btn-backup-${id}`}
                        onClick={() => onManualBackup(id)}
                        disabled={status.state === 'LOADING'}
                        variant="primary"
                      >
                        {status.state === 'LOADING' ? 'Gerando...' : 'Gerar backup'}
                      </ActionButton>
                      <ActionButton
                        id={`btn-download-${id}`}
                        onClick={() => onDownloadGit(id)}
                        variant="secondary"
                      >
                        Baixar do GitHub
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionButton({ id, children, onClick, disabled, variant }) {
  const isPrimary = variant === 'primary';

  const base = {
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '7px 12px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: `all var(--dur-fast) var(--ease)`,
    fontFamily: 'var(--font-sans)',
    whiteSpace: 'nowrap',
    letterSpacing: '-0.1px',
  };

  const variants = isPrimary ? {
    background: 'var(--accent)',
    color: '#ffffff',
    border: 'none',
  } : {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
  };

  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (isPrimary) {
          e.currentTarget.style.background = 'var(--accent-hover)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        } else {
          e.currentTarget.style.borderColor = 'var(--text-muted)';
          e.currentTarget.style.color = 'var(--text)';
        }
      }}
      onMouseLeave={(e) => {
        if (isPrimary) {
          e.currentTarget.style.background = 'var(--accent)';
          e.currentTarget.style.transform = 'translateY(0)';
        } else {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text-muted)';
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(0.97)';
      }}
      onMouseUp={(e) => {
        if (!disabled && isPrimary) e.currentTarget.style.transform = 'translateY(-1px)';
        else if (!disabled) e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {children}
    </button>
  );
}