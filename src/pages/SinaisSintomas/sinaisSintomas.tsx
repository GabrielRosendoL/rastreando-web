import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './sinaisSintomas.styles.module.css';

const SinaisSintomas: React.FC = () => {
  const [sexo, setSexo] = useState<string | null>(null);
  const [neoplasia, setNeoplasia] = useState<string | null>(null);
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [novoSintoma, setNovoSintoma] = useState<string>('');
  const [editandoSintoma, setEditandoSintoma] = useState<number | null>(null);
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (sexo && neoplasia) {
        const adminCollectionRef = collection(db, 'administradores');
        const adminSnapshots = await getDocs(adminCollectionRef);
        const sintomasEncontrados: string[] = [];

        for (const admin of adminSnapshots.docs) {
          const adminId = admin.id;
          const docRef = doc(db, 'sinaisSintomas', adminId, 'combinacoes', `${sexo}_${neoplasia}`);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const sintomasAdmin = data.sintomas || [];
            sintomasEncontrados.push(...sintomasAdmin);
          }
        }

        setSintomas(sintomasEncontrados);
      }
      setLoading(false);
    };
    fetchData();
  }, [sexo, neoplasia, db]);

  const handleSexoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSexo(event.target.value);
    setNeoplasia(null);
    setSintomas([]);
  };

  const handleNeoplasiaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNeoplasia(event.target.value);
  };

  const handleAddOrEditSintoma = () => {
    if (novoSintoma.trim() !== '') {
      if (editandoSintoma !== null) {
        const novosSintomas = [...sintomas];
        novosSintomas[editandoSintoma] = novoSintoma;
        setSintomas(novosSintomas);
        setEditandoSintoma(null);
      } else if (!sintomas.includes(novoSintoma)) {
        setSintomas([...sintomas, novoSintoma]);
      }
      setNovoSintoma('');
    }
  };

  const handleEdit = (index: number) => {
    setNovoSintoma(sintomas[index]);
    setEditandoSintoma(index);
  };

  const handleRemove = (index: number) => {
    const novosSintomas = sintomas.filter((_, i) => i !== index);
    setSintomas(novosSintomas);
  };

  const handleSave = async () => {
    setLoading(true);
    if (sexo && neoplasia) {
      try {
        const adminCollectionRef = collection(db, 'administradores');
        const adminSnapshots = await getDocs(adminCollectionRef);

        for (const admin of adminSnapshots.docs) {
          const adminId = admin.id;
          const docRef = doc(db, 'sinaisSintomas', adminId, 'combinacoes', `${sexo}_${neoplasia}`);
          await setDoc(docRef, {
            sintomas,
          });
        }

        setShowDialog(true);
      } catch (error) {
        console.error('Erro ao salvar os dados no Firebase:', error);
        alert('Erro ao salvar os dados!');
      }
    } else {
      alert('Por favor, preencha todos os campos.');
    }
    setLoading(false);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cadastrar Sinais e Sintomas</h1>
      <div className={styles.formGroup}>
        <label>Sexo:</label>
        <select value={sexo || ''} onChange={handleSexoChange} className={styles.select}>
          <option value="" disabled>Selecione o sexo</option>
          <option value="homem">Homem</option>
          <option value="mulher">Mulher</option>
        </select>
      </div>
      {sexo && (
        <div className={styles.formGroup}>
          <label>Neoplasia:</label>
          <select value={neoplasia || ''} onChange={handleNeoplasiaChange} className={styles.select}>
            <option value="" disabled>Selecione a neoplasia</option>
            {sexo === 'homem' && (
              <>
                <option value="pulmão">Pulmão</option>
                <option value="colorretal">Colorretal</option>
                <option value="próstata">Próstata</option>
              </>
            )}
            {sexo === 'mulher' && (
              <>
                <option value="pulmão">Pulmão</option>
                <option value="colorretal">Colorretal</option>
                <option value="mama">Mama</option>
                <option value="colo de útero">Colo de Útero</option>
              </>
            )}
          </select>
        </div>
      )}
      {neoplasia && (
        <div className={styles.formGroup}>
          <label>Adicione Sinais e Sintomas:</label>
          <input
            type="text"
            value={novoSintoma}
            onChange={(e) => setNovoSintoma(e.target.value)}
            className={styles.input}
          />
          <button onClick={handleAddOrEditSintoma} className={styles.btnAdd}>
            {editandoSintoma !== null ? 'Salvar Edição' : 'Adicionar'}
          </button>
          <div className={styles.scrollContainer}>
            <ul className={styles.sintomasList}>
              {sintomas.map((sintoma, index) => (
                <li key={index} className={styles.sintomaItem}>
                  <span className={styles.sintomaText}>{sintoma}</span>
                  <button onClick={() => handleEdit(index)} className={styles.btnEdit}>
                    <FaEdit className={styles.icon} />
                  </button>
                  <button onClick={() => handleRemove(index)} className={styles.btnRemove}>
                    <FaTrash className={styles.icon} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <button onClick={handleSave} className={styles.btnSave} disabled={loading}>
        {loading ? 'Carregando...' : 'Salvar'}
      </button>
      {loading && <div className={styles.spinner}></div>}

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

export default SinaisSintomas;
