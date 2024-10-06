import { collection, doc, getDoc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import styles from './indicacoesRastreio.styles.module.css';

const IndicacoesRastreio: React.FC = () => {
  const [sexo, setSexo] = useState<string | null>(null);
  const [neoplasia, setNeoplasia] = useState<string | null>(null);
  const [texto, setTexto] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // Adicionando estado de loading
  const db = getFirestore();

  useEffect(() => {
    const fetchData = async () => {
      if (sexo && neoplasia) {
        setLoading(true); // Ativando o loading antes de buscar dados
        // Obter todos os IDs dos administradores
        const adminCollectionRef = collection(db, 'administradores');
        const adminSnapshots = await getDocs(adminCollectionRef);

        // Percorrer cada administrador para encontrar o documento correto
        for (const admin of adminSnapshots.docs) {
          const adminId = admin.id;
          const docRef = doc(db, 'indicacoesRastreio', `${adminId}_${sexo}_${neoplasia}`);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setTexto(docSnap.data().texto);
            break; // Se encontrou um documento, interrompe o loop
          }
        }
        setLoading(false); // Desativando o loading após buscar dados
      }
    };
    fetchData();
  }, [sexo, neoplasia, db]);

  const handleSexoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSexo(event.target.value);
    setNeoplasia(null); 
    setTexto(''); 
  };

  const handleNeoplasiaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNeoplasia(event.target.value);
    setTexto(''); 
  };

  const handleSave = async () => {
    setLoading(true); // Ativando o loading durante o salvamento
    if (sexo && neoplasia) {
      // Obter todos os IDs dos administradores
      const adminCollectionRef = collection(db, 'administradores');
      const adminSnapshots = await getDocs(adminCollectionRef);

      for (const admin of adminSnapshots.docs) {
        const adminId = admin.id;
        const docRef = doc(db, 'indicacoesRastreio', `${adminId}_${sexo}_${neoplasia}`);
        
        try {
          await setDoc(docRef, {
            sexo,
            neoplasia,
            texto,
          });
          alert('Sucesso!'); // Alerta de sucesso ao salvar
        } catch (error) {
          console.error('Erro ao salvar os dados no Firebase:', error);
          alert('Erro ao salvar os dados!');
        }
      }

      setLoading(false); // Desativando o loading após o salvamento
    } else {
      alert('Por favor, preencha todos os campos.');
      setLoading(false); // Desativando o loading caso falhe
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cadastrar Indicações de Rastreamento</h1>
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
        </div>
      )}
      <button onClick={handleSave} className={styles.btnSave} disabled={loading}>
        {loading ? 'Carregando...' : 'Salvar'}
      </button>
      {loading && <div className={styles.spinner}></div>} {/* Exibe o spinner durante o loading */}
    </div>
  );
};

export default IndicacoesRastreio;
