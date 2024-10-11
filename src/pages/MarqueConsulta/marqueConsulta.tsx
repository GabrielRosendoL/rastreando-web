import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './marqueConsulta.styles.module.css';

interface Local {
  nome: string;
  link: string;
  telefone: string;
}

const MarqueConsulta: React.FC = () => {
  const [sexo, setSexo] = useState<string | null>(null);
  const [novoLocal, setNovoLocal] = useState<Local>({ nome: '', link: '', telefone: '' });
  const [locais, setLocais] = useState<Local[]>([]);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const db = getFirestore();
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          navigate('/telaLogin');
        }
      });
    };
    checkAuth();
  }, [auth, navigate]);

  const fetchLocais = async (sexoAtual: string) => {
    setLoading(true);
    const adminCollectionRef = collection(db, 'administradores');
    const adminSnapshots = await getDocs(adminCollectionRef);
    const locaisEncontrados: Local[] = [];

    for (const admin of adminSnapshots.docs) {
      const adminId = admin.id;
      const docRef = doc(db, 'marqueConsulta', `${adminId}_${sexoAtual}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const locaisAdmin = data.locais || [];
        locaisEncontrados.push(...locaisAdmin);
      }
    }

    setLocais(locaisEncontrados);
    setLoading(false);
  };

  useEffect(() => {
    if (sexo) {
      fetchLocais(sexo);
    }
  }, [sexo, db]);

  const isValidLink = (link: string) => {
    const linkPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
    return linkPattern.test(link);
  };

  const isValidPhone = (phone: string) => {
    const phonePattern = /^\(?\d{2,3}\)?[-.\s]?\d{4,5}[-.\s]?\d{4}$/;
    return phonePattern.test(phone);
  };

  const handleSexoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const novoSexo = event.target.value;
    setSexo(novoSexo);
    setLocais([]);
    fetchLocais(novoSexo);
  };

  const handleAddLocal = () => {
    if (!novoLocal.nome || !novoLocal.link || !novoLocal.telefone) {
      alert('Preencha todos os campos!');
      return;
    }

    if (!isValidLink(novoLocal.link)) {
      alert('O campo Link deve conter uma URL válida!');
      return;
    }

    if (!isValidPhone(novoLocal.telefone)) {
      alert('O campo Telefone deve conter um número válido!');
      return;
    }

    if (editandoIndex !== null) {
      const novosLocais = [...locais];
      novosLocais[editandoIndex] = novoLocal;
      setLocais(novosLocais);
      setEditandoIndex(null);
    } else {
      setLocais([...locais, novoLocal]);
    }
    setNovoLocal({ nome: '', link: '', telefone: '' });
  };

  const handleEditLocal = (index: number) => {
    const localParaEditar = locais[index];
    setNovoLocal(localParaEditar);
    setEditandoIndex(index);
  };

  const handleRemoveLocal = (index: number) => {
    const novosLocais = locais.filter((_, i) => i !== index);
    setLocais(novosLocais);
  };

  const handleSave = async () => {
    setLoading(true);
    const adminCollectionRef = collection(db, 'administradores');
    const adminSnapshots = await getDocs(adminCollectionRef);

    for (const admin of adminSnapshots.docs) {
      const adminId = admin.id;
      const docRef = doc(db, 'marqueConsulta', `${adminId}_${sexo}`);

      try {
        await setDoc(docRef, { locais }, { merge: true });
        setShowDialog(true);
      } catch (error) {
        console.error('Erro ao salvar os dados no Firebase:', error);
        alert('Erro ao salvar os dados!');
      }
    }

    setLoading(false);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cadastrar Locais de Consulta</h1>

      <div className={styles.formGroup}>
        <label>Sexo:</label>
        <select value={sexo || ''} onChange={handleSexoChange} className={styles.select}>
          <option value="" disabled>Selecione o sexo</option>
          <option value="homem">Homem</option>
          <option value="mulher">Mulher</option>
        </select>
      </div>

      {loading ? (
        <div className={styles.spinner}></div>
      ) : (
        <>
          <div className={styles.formGroup}>
            <label>Nome do Local:</label>
            <input
              type="text"
              value={novoLocal.nome}
              onChange={(e) => setNovoLocal({ ...novoLocal, nome: e.target.value })}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Link:</label>
            <input
              type="text"
              value={novoLocal.link}
              onChange={(e) => setNovoLocal({ ...novoLocal, link: e.target.value })}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Telefone:</label>
            <input
              type="text"
              value={novoLocal.telefone}
              onChange={(e) => setNovoLocal({ ...novoLocal, telefone: e.target.value })}
              className={styles.input}
            />
          </div>

          <button onClick={handleAddLocal} className={styles.btnAdd}>
            {editandoIndex !== null ? 'Atualizar' : 'Adicionar'}
          </button>

          {locais.length > 0 && (
            <div className={styles.scrollView}>
              <h3>Locais Cadastrados:</h3>
              <ul className={styles.localList}>
                {locais.map((local, index) => (
                  <li key={index} className={styles.localItem}>
                    <strong>Nome:</strong> {local.nome} <br />
                    <strong>Link:</strong> <a href={local.link} target="_blank" rel="noopener noreferrer">{local.link}</a> <br />
                    <strong>Telefone:</strong> {local.telefone}
                    <div className={styles.divButtons}>
                      <button onClick={() => handleEditLocal(index)} className={styles.btnEdit}>
                        <FaEdit className={styles.icon} />
                      </button>
                      <button onClick={() => handleRemoveLocal(index)} className={styles.btnRemove}>
                        <FaTrash className={styles.icon} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={handleSave} className={styles.btnSave} disabled={loading}>
            {loading ? 'Carregando...' : 'Salvar Locais'}
          </button>
        </>
      )}

      {showDialog && (
        <div style={dialogOverlayStyle}>
          <div style={dialogBoxStyle}>
            <h2>Sucesso!</h2>
            <p>Os dados foram salvos com sucesso.</p>
            <button onClick={handleCloseDialog} style={dialogButtonStyle}>
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const dialogOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const dialogBoxStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '10px',
  textAlign: 'center',
  boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.2)',
  width: '300px',
};

const dialogButtonStyle: React.CSSProperties = {
  marginTop: '20px',
  padding: '10px 20px',
  backgroundColor: '#232d97',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default MarqueConsulta;
