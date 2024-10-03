import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase-config';
import styles from './editarSinaisSintomas.styles.module.css';

const EditarSinaisSintomas: React.FC = () => {
  const [sexo, setSexo] = useState<string | null>(null);
  const [neoplasia, setNeoplasia] = useState<string | null>(null);
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [novoSintoma, setNovoSintoma] = useState<string>('');
  const [editandoSintoma, setEditandoSintoma] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user && sexo && neoplasia) {
        const docRef = doc(db, 'sinaisSintomas', user.uid, 'combinacoes', `${sexo}_${neoplasia}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSintomas(data.sintomas || []);
        }
      }
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

  const handleAddSintoma = () => {
    if (novoSintoma.trim() !== '') {
      if (editandoSintoma !== null) {
        const novosSintomas = [...sintomas];
        novosSintomas[editandoSintoma] = novoSintoma;
        setSintomas(novosSintomas);
        setEditandoSintoma(null);
      } else {
        setSintomas([...sintomas, novoSintoma]);
      }
      setNovoSintoma('');
    }
  };

  const handleEditSintoma = (index: number) => {
    setNovoSintoma(sintomas[index]);
    setEditandoSintoma(index);
  };

  const handleRemoveSintoma = (index: number) => {
    const novosSintomas = sintomas.filter((_, i) => i !== index);
    setSintomas(novosSintomas);
  };

  const handleSave = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user && sexo && neoplasia) {
      const docRef = doc(db, 'sinaisSintomas', user.uid, 'combinacoes', `${sexo}_${neoplasia}`);
      await setDoc(docRef, {
        sintomas,
      });
      navigate(-1);
    } else {
      alert('Por favor, preencha todos os campos.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Editar Sinais e Sintomas</h1>
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
          <button onClick={handleAddSintoma} className={styles.btnAdd}>
            {editandoSintoma !== null ? 'Salvar Edição' : 'Adicionar'}
          </button>
          <div className={styles.scrollContainer}>
            <ul className={styles.sintomasList}>
              {sintomas.map((sintoma, index) => (
                <li key={index} className={styles.sintomaItem}>
                  <span className={styles.sintomaText}>{sintoma}</span>
                  <button onClick={() => handleEditSintoma(index)} className={styles.btnEdit}>Editar</button>
                  <button onClick={() => handleRemoveSintoma(index)} className={styles.btnRemove}>Remover</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <button onClick={handleSave} className={styles.btnSave} disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
      {loading && <div className={styles.spinner}></div>}
    </div>
  );
};

export default EditarSinaisSintomas;