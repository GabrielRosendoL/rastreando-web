import { doc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase-config';
import styles from './sinaisSintomas.styles.module.css'; // Importa o CSS com o uso de módulos

const SinaisSintomas: React.FC = () => {
  const [sexo, setSexo] = useState<string | null>(null);
  const [neoplasia, setNeoplasia] = useState<string | null>(null);
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [novoSintoma, setNovoSintoma] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const db = getFirestore();
  const navigate = useNavigate();

  const handleSexoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSexo(event.target.value);
    setNeoplasia(null); // Resetar neoplasia ao mudar o sexo
  };

  const handleNeoplasiaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNeoplasia(event.target.value);
  };

  const handleAddSintoma = () => {
    if (novoSintoma.trim() !== '') {
      setSintomas([...sintomas, novoSintoma]);
      setNovoSintoma('');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user && sexo && neoplasia) {
      const docRef = doc(db, 'sinaisSintomas', user.uid);
      await setDoc(docRef, {
        sexo,
        neoplasia,
        sintomas,
      });
      navigate(-1); // Redireciona para a página anterior
    } else {
      alert('Por favor, preencha todos os campos.');
    }
    setLoading(false);
  };
  
  const handleEdit = () => {
    navigate('/editarSinaisSintomas');
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
          <button onClick={handleAddSintoma} className={styles.btnAdd}>Adicionar</button>
          <select multiple className={styles.sintomasSelect}>
            {sintomas.map((sintoma, index) => (
              <option key={index} value={sintoma}>{sintoma}</option>
            ))}
          </select>
        </div>
      )}
      <button onClick={handleSave} className={styles.btnSave} disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
      {loading && <div className={styles.spinner}></div>}
      <button onClick={handleEdit} className={styles.btnEdit}>
        <span>Editar</span>
      </button>
    </div>
  );
};

export default SinaisSintomas;