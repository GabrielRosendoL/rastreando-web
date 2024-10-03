import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase-config';
import styles from './editarIndicacoesRastreio.styles.module.css';

const EditarIndicacoesRastreio: React.FC = () => {
  const [sexo, setSexo] = useState<string | null>(null);
  const [neoplasia, setNeoplasia] = useState<string | null>(null);
  const [texto, setTexto] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<string>('');
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user && sexo && neoplasia) {
        const docRef = doc(db, 'indicacoesRastreio', `${user.uid}_${sexo}_${neoplasia}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTexto(docSnap.data().texto);
          setMensagem('');
        } else {
          setTexto('');
          setMensagem('Ainda não há indicações de rastreio para essa combinação');
        }
      }
    };
    fetchData();
  }, [sexo, neoplasia, db]);

  const handleSexoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSexo(event.target.value);
    setNeoplasia(null);
    setTexto(''); 
    setMensagem(''); 
  };

  const handleNeoplasiaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNeoplasia(event.target.value);
    setTexto(''); 
    setMensagem(''); 
  };

  const handleSave = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user && sexo && neoplasia) {
      const docRef = doc(db, 'indicacoesRastreio', `${user.uid}_${sexo}_${neoplasia}`);
      await setDoc(docRef, {
        sexo,
        neoplasia,
        texto,
      });
      navigate(-1); 
    } else {
      alert('Por favor, preencha todos os campos.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Editar Indicações de Rastreamento</h1>
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
          <label>Texto:</label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className={styles.textarea}
          />
          {mensagem && <div className={styles.mensagem}>{mensagem}</div>}
        </div>
      )}
      <button onClick={handleSave} className={styles.btnSave} disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
      {loading && <div className={styles.spinner}></div>}
    </div>
  );
};

export default EditarIndicacoesRastreio;