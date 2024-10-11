import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useEffect, useRef, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './sinaisAlarmeFatoresRisco.styles.module.css';

interface Sintoma {
  descricao: string;
  imagem: File | null | string;
}

const SinaisAlarmeFatoresRisco: React.FC = () => {
  const [sexo, setSexo] = useState<string | null>(null);
  const [neoplasia, setNeoplasia] = useState<string | null>(null);
  const [sintomas, setSintomas] = useState<Sintoma[]>([]);
  const [novoSintoma, setNovoSintoma] = useState<string>('');
  const [novaImagem, setNovaImagem] = useState<File | null>(null);
  const [editandoSintomaIndex, setEditandoSintomaIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const imagemInputRef = useRef<HTMLInputElement | null>(null);
  const db = getFirestore();
  const storage = getStorage();
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
        const sintomasEncontrados: Sintoma[] = [];

        for (const admin of adminSnapshots.docs) {
          const adminId = admin.id;
          const docRef = doc(db, 'sinaisAlarmeFatoresRisco', adminId, 'combinacoes', `${sexo}_${neoplasia}`);
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
    if (novoSintoma.trim() !== '' && novaImagem) {
      const novoSintomaObj: Sintoma = { descricao: novoSintoma, imagem: novaImagem };

      if (editandoSintomaIndex !== null) {
        const novosSintomas = [...sintomas];
        novosSintomas[editandoSintomaIndex] = novoSintomaObj;
        setSintomas(novosSintomas);
        setEditandoSintomaIndex(null);
      } else {
        setSintomas([...sintomas, novoSintomaObj]);
      }

      setNovoSintoma('');
      setNovaImagem(null);
      if (imagemInputRef.current) {
        imagemInputRef.current.value = '';
      }
    } else {
      alert('Por favor, preencha o sintoma e selecione uma imagem.');
    }
  };

  const handleEdit = (index: number) => {
    const sintoma = sintomas[index];
    setNovoSintoma(sintoma.descricao);
    setNovaImagem(sintoma.imagem as File);
    setEditandoSintomaIndex(index);
  };

  const handleRemove = (index: number) => {
    const novosSintomas = sintomas.filter((_, i) => i !== index);
    setSintomas(novosSintomas);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNovaImagem(event.target.files[0]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const adminCollectionRef = collection(db, 'administradores');
      const adminSnapshots = await getDocs(adminCollectionRef);

      const sintomasComUrls = await Promise.all(
        sintomas.map(async (sintoma) => {
          if (sintoma.imagem instanceof File) {
            const storageRef = ref(storage, `images/${sintoma.imagem.name}`);
            const uploadTask = await uploadBytesResumable(storageRef, sintoma.imagem);
            const imageUrl = await getDownloadURL(uploadTask.ref);
            return { descricao: sintoma.descricao, imagem: imageUrl };
          }
          return sintoma;
        })
      );

      for (const admin of adminSnapshots.docs) {
        const adminId = admin.id;
        const docRef = doc(db, 'sinaisAlarmeFatoresRisco', adminId, 'combinacoes', `${sexo}_${neoplasia}`);
        await setDoc(docRef, {
          sintomas: sintomasComUrls,
        });
      }

      setShowDialog(true);
    } catch (error) {
      console.error('Erro ao salvar os dados no Firebase:', error);
      alert('Erro ao salvar os dados!');
    }
    setLoading(false);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cadastrar Sinais de Alarme e Fatores de Risco</h1>
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
          <label>Adicione Sinal de Alarme/Fator de Risco:</label>
          <input
            type="text"
            value={novoSintoma}
            onChange={(e) => setNovoSintoma(e.target.value)}
            className={styles.input}
            placeholder="Descrição"
          />
          <input type="file" onChange={handleImageChange} className={styles.input} ref={imagemInputRef} />
          <button onClick={handleAddOrEditSintoma} className={styles.btnAdd}>
            {editandoSintomaIndex !== null ? 'Salvar Edição' : 'Adicionar'}
          </button>
          <ul className={styles.sintomasList}>
            {sintomas.map((sintoma, index) => (
              <li key={index} className={styles.sintomaItem}>
                <span>{sintoma.descricao}</span>
                {typeof sintoma.imagem === 'string' && <img src={sintoma.imagem} alt={sintoma.descricao} />}
                <div className={styles.botoesItens}>
                  <button onClick={() => handleEdit(index)} className={styles.btnEdit}>
                    <FaEdit />
                  </button>
                  <button onClick={() => handleRemove(index)} className={styles.btnRemove}>
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
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

export default SinaisAlarmeFatoresRisco;
