import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase-config';
import styles from './sinaisAlarmeFatoresRisco.styles.module.css';

interface Sintoma {
  descricao: string;
  imagem: File | null;
}

const SinaisAlarmeFatoresRisco: React.FC = () => {
  const [sexo, setSexo] = useState<string | null>(null);
  const [neoplasia, setNeoplasia] = useState<string | null>(null);
  const [sintomas, setSintomas] = useState<Sintoma[]>([]);
  const [novoSintoma, setNovoSintoma] = useState<string>('');
  const [novaImagem, setNovaImagem] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const imagemInputRef = useRef<HTMLInputElement | null>(null);
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
        } else {
          setSintomas([]);
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

  const handleNeoplasiaChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNeoplasia(event.target.value);
    if (sexo && event.target.value) {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'sinaisAlarmeFatoresRisco', user.uid, 'combinacoes', `${sexo}_${event.target.value}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSintomas(data.sintomas || []);
        } else {
          setSintomas([]);
        }
      }
    }
  };

  const handleAddSintoma = () => {
    if (novoSintoma.trim() !== '' && novaImagem && !sintomas.some(s => s.descricao === novoSintoma)) {
      setSintomas([...sintomas, { descricao: novoSintoma, imagem: novaImagem }]);
      setNovoSintoma('');
      setNovaImagem(null);
      if (imagemInputRef.current) {
        imagemInputRef.current.value = '';
      }
    } else {
      alert('Por favor, preencha o sintoma e selecione uma imagem.');
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNovaImagem(event.target.files[0]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user && sexo && neoplasia) {
      const docRef = doc(db, 'sinaisAlarmeFatoresRisco', user.uid, 'combinacoes', `${sexo}_${neoplasia}`);
      const docSnap = await getDoc(docRef);
      let sintomasExistentes: Sintoma[] = [];
      if (docSnap.exists()) {
        const data = docSnap.data();
        sintomasExistentes = data.sintomas || [];
      }

      const novosSintomas = sintomas.filter(sintoma => !sintomasExistentes.some(s => s.descricao === sintoma.descricao));
      const todosSintomas = [...sintomasExistentes, ...novosSintomas];

      const sintomasComUrls = await Promise.all(
        todosSintomas.map(async (sintoma) => {
          if (sintoma.imagem instanceof File) {
            const storageRef = ref(storage, `images/${user.uid}/${sintoma.imagem.name}`);
            const uploadTask = await uploadBytesResumable(storageRef, sintoma.imagem);
            const imageUrl = await getDownloadURL(uploadTask.ref);
            return { descricao: sintoma.descricao, imagem: imageUrl };
          }
          return sintoma;
        })
      );

      try {
        await setDoc(docRef, {
          sintomas: sintomasComUrls,
        });
        alert('Sucesso!'); // Alerta de sucesso ao salvar
      } catch (error) {
        console.error('Erro ao salvar os dados no Firebase:', error);
        alert('Erro ao salvar os dados!');
      }
      
      navigate(-1);
    } else {
      alert('Por favor, preencha todos os campos.');
    }
    setLoading(false);
  };

  const handleEdit = () => {
    navigate('/editarSinaisAlarmeFatoresRisco');
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
          <label>Adicione Sinais e Sintomas:</label>
          <input
            type="text"
            value={novoSintoma}
            onChange={(e) => setNovoSintoma(e.target.value)}
            className={styles.input}
          />
          <input
            type="file"
            onChange={handleImageChange}
            className={styles.input}
            ref={imagemInputRef}
          />
          <button onClick={handleAddSintoma} className={styles.btnAdd}>Adicionar</button>
          <select multiple className={styles.sintomasSelect}>
            {sintomas.map((sintoma, index) => (
              <option key={index} value={sintoma.descricao}>{sintoma.descricao}</option>
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

export default SinaisAlarmeFatoresRisco;
