import { collection, doc, getDoc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Ícones do FontAwesome
import { useNavigate } from 'react-router-dom';
import styles from './sinaisSintomas.styles.module.css';

const SinaisSintomas: React.FC = () => {
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
      if (sexo && neoplasia) {
        const adminCollectionRef = collection(db, 'administradores');
        const adminSnapshots = await getDocs(adminCollectionRef);
        const sintomasEncontrados: string[] = [];

        // Percorrer cada administrador e verificar a combinação 'sexo_neoplasia'
        for (const admin of adminSnapshots.docs) {
          const adminId = admin.id; // ID do administrador
          const docRef = doc(db, 'sinaisSintomas', adminId, 'combinacoes', `${sexo}_${neoplasia}`);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const sintomasAdmin = data.sintomas || [];
            sintomasEncontrados.push(...sintomasAdmin); // Adicionar os sintomas encontrados
          }
        }

        // Atualizar os sintomas com base no que foi encontrado
        setSintomas(sintomasEncontrados);
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
        // Vamos salvar para todos os administradores
        const adminCollectionRef = collection(db, 'administradores');
        const adminSnapshots = await getDocs(adminCollectionRef);

        for (const admin of adminSnapshots.docs) {
          const adminId = admin.id; // ID do administrador
          const docRef = doc(db, 'sinaisSintomas', adminId, 'combinacoes', `${sexo}_${neoplasia}`);
          await setDoc(docRef, {
            sintomas,
          });
        }

        alert('Sucesso!');
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
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
      {loading && <div className={styles.spinner}></div>}
    </div>
  );
};

export default SinaisSintomas;
