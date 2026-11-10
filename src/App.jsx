import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function App() {
  const { t, i18n } = useTranslation();

  const [statusApi, setStatusApi] = useState(null);
  const [projetos, setProjetos] = useState([]);
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [idEditando, setIdEditando] = useState(null);

  const carregarDados = () => {
    fetch('http://localhost:3001/api/status')
      .then((res) => res.json())
      .then((data) => setStatusApi(data))
      .catch((err) => console.error('Erro ao buscar status:', err));

    fetch('http://localhost:3001/api/projetos')
      .then((res) => res.json())
      .then((data) => setProjetos(data))
      .catch((err) => console.error('Erro ao buscar projetos:', err));
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Envia POST (novo) ou PUT (atualização)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return;

    if (idEditando) {
      // Operação UPDATE (PUT)
      await fetch(`http://localhost:3001/api/projetos/${idEditando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, valor: valor || 0 }),
      });
      setIdEditando(null);
    } else {
      // Operação CREATE (POST)
      await fetch('http://localhost:3001/api/projetos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, valor: valor || 0 }),
      });
    }

    setNome('');
    setValor('');
    carregarDados();
  };

  // Carrega os dados do item selecionado no formulário para edição
  const iniciarEdicao = (proj) => {
    setIdEditando(proj.id);
    setNome(proj.nome);
    setValor(proj.valor);
  };

  const cancelarEdicao = () => {
    setIdEditando(null);
    setNome('');
    setValor('');
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:3001/api/projetos/${id}`, {
      method: 'DELETE',
    });
    if (idEditando === id) cancelarEdicao();
    carregarDados();
  };

  const totalAcumulado = projetos.reduce((acc, proj) => acc + (Number(proj.valor) || 0), 0);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif', maxWidth: '640px', margin: '0 auto' }}>
      <header style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        <button onClick={() => i18n.changeLanguage('pt')}>🇧🇷 Português</button>
        <button onClick={() => i18n.changeLanguage('en')}>🇺🇸 English</button>
        <button onClick={() => i18n.changeLanguage('es')}>🇪🇸 Español</button>
      </header>

      <h1>{t('titulo')}</h1>
      <p>{t('descricao')}</p>

      {/* Card da API */}
      <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#064e3b', color: '#ecfdf5', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>{t('dadosApiTitulo')}</h3>
        {statusApi ? (
          <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6' }}>
            <li><strong>{t('destino')}</strong> {statusApi.localizacaoAlvo}</li>
            <li><strong>{t('projetosFinalizados')}</strong> {statusApi.projetosConcluidos}</li>
            <li><strong>{t('statusConexao')}</strong> {statusApi.mensagem}</li>
          </ul>
        ) : (
          <p>{t('conectando')}</p>
        )}
      </div>

      {/* Formulário adaptativo (Criar / Editar) */}
      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder={t('placeholderNome')}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{ padding: '10px', flex: 2, borderRadius: '4px', border: '1px solid #666' }}
        />
        <input
          type="number"
          placeholder={t('placeholderValor')}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          style={{ padding: '10px', flex: 1, borderRadius: '4px', border: '1px solid #666' }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 18px',
            cursor: 'pointer',
            fontWeight: 'bold',
            background: idEditando ? '#2563eb' : '#4b5563',
            color: '#fff',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          {idEditando ? t('btnSalvar') : t('btnAdicionar')}
        </button>

        {idEditando && (
          <button
            type="button"
            onClick={cancelarEdicao}
            style={{
              padding: '10px 12px',
              cursor: 'pointer',
              background: '#64748b',
              color: '#fff',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {t('btnCancelar')}
          </button>
        )}
      </form>

      {/* Card Totalizador */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: '#1e1b4b',
        border: '1px solid #6366f1',
        color: '#e0e7ff',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('totalAcumulado')}</span>
        <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#a5b4fc' }}>
          R$ {totalAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* Lista com botões de Editar e Excluir */}
      <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>{t('projetosCadastradosTitulo')}</h3>
        {projetos.length === 0 ? (
          <p>{t('semProjetos')}</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {projetos.map((proj) => (
              <li
                key={proj.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #334155',
                }}
              >
                <span>
                  <strong>{proj.nome}</strong> — R$ {Number(proj.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => iniciarEdicao(proj)}
                    style={{
                      background: '#0284c7',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      cursor: 'pointer',
                    }}
                    title={t('btnEditar')}
                  >
                    {t('btnEditar')}
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                    title={t('btnExcluir')}
                  >
                    {t('btnExcluir')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}