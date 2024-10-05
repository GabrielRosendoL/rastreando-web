import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase-config';
import styles from './editarSinaisAlarmeFatoresRisco.styles.module.css';

interface Imagem {
  descricao: string;
  imagem: string;
}

const EditarSinaisAlarmeFatoresRisco: React.FC = () => {
  const [sexo, setSexo] = useState<string | null>(null);
  const [neoplasia, setNeoplasia] = useState<string | null>(null);
  const [sintomas, setSintomas] = useState<Imagem[]>([]);
  const [novoSintoma, setNovoSintoma] = useState<string>('');
  const [novaImagemDescricao, setNovaImagemDescricao] = useState<string>('');
  const [novaImagemArquivo, setNovaImagemArquivo] = useState<File | null>(null);
  const [editandoSintoma, setEditandoSintoma] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const db = getFirestore();
  const storage = getStorage();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user && sexo && neoplasia) {
        const docRef = doc(db, 'sinaisAlarmeFatoresRisco', user.uid, 'combinacoes', `${sexo}_${neoplasia}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSintomas(data.sintomas || []);
        }
      }
    };
    fetchData();
  }, [db, sexo, neoplasia]);

  const handleSexoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSexo(event.target.value);
    setNeoplasia(null);
    setSintomas([]);
  };

  const handleNeoplasiaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNeoplasia(event.target.value);
  };

  const handleAddSintoma = async () => {
    if (novoSintoma.trim() !== '' && novaImagemDescricao.trim() !== '' && novaImagemArquivo) {
      setLoading(true);
      const storageRef = ref(storage, `imagens/${novaImagemArquivo.name}`);
      await uploadBytes(storageRef, novaImagemArquivo);
      const url = await getDownloadURL(storageRef);

      const novoSintomaObj: Imagem = { descricao: novaImagemDescricao, imagem: url };
      if (editandoSintoma !== null) {
        const novosSintomas = [...sintomas];
        novosSintomas[editandoSintoma] = novoSintomaObj;
        setSintomas(novosSintomas);
        setEditandoSintoma(null);
      } else {
        setSintomas([...sintomas, novoSintomaObj]);
      }
      setNovoSintoma('');
      setNovaImagemDescricao('');
      setNovaImagemArquivo(null);
      setLoading(false);
    }
  };

  const handleEditSintoma = (index: number) => {
    setNovoSintoma(sintomas[index].descricao);
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
      const docRef = doc(db, 'sinaisAlarmeFatoresRisco', user.uid, 'combinacoes', `${sexo}_${neoplasia}`);

      const sintomasAtualizados = [...sintomas];
      if (editandoSintoma !== null && novaImagemArquivo) {
        const storageRef = ref(storage, `imagens/${novaImagemArquivo.name}`);
        await uploadBytes(storageRef, novaImagemArquivo);
        const url = await getDownloadURL(storageRef);
        sintomasAtualizados[editandoSintoma] = { descricao: novoSintoma, imagem: url };
      } else if (editandoSintoma !== null) {
        sintomasAtualizados[editandoSintoma].descricao = novoSintoma;
      }

      await setDoc(docRef, { sintomas: sintomasAtualizados });

      setEditandoSintoma(null);
      setNovoSintoma('');
      setNovaImagemDescricao('');
      setNovaImagemArquivo(null);
      navigate(-1);
    } else {
      alert('Por favor, preencha todos os campos.');
    }
    setLoading(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNovaImagemArquivo(event.target.files[0]);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Editar Sinais de Alarme e Fatores de Risco</h1>
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
          <label>Selecione e Modifique:</label>
          <input
            type="text"
            placeholder="Descrição"
            value={novoSintoma}
            onChange={(e) => setNovoSintoma(e.target.value)}
            className={styles.input}
          />
          <input
            type="file"
            onChange={handleFileChange}
            className={styles.input}
          />
          <div className={styles.scrollContainer}>
            <ul className={styles.sintomasList}>
              {sintomas.map((sintoma, index) => (
                <li key={index} className={styles.sintomaItem}>
                  <span className={styles.sintomaText}>{sintoma.descricao}</span>
                  <img src={sintoma.imagem} alt={sintoma.descricao} className={styles.imagem} />
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

export default EditarSinaisAlarmeFatoresRisco;