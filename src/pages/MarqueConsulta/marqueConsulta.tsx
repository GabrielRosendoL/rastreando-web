import { collection, doc, getDoc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
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
  const db = getFirestore();

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

  const handleSexoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const novoSexo = event.target.value;
    setSexo(novoSexo);
    setLocais([]);
    fetchLocais(novoSexo);
  };

  const handleAddLocal = () => {
    if (novoLocal.nome && novoLocal.link && novoLocal.telefone) {
      if (editandoIndex !== null) {
        const novosLocais = [...locais];
        novosLocais[editandoIndex] = novoLocal;
        setLocais(novosLocais);
        setEditandoIndex(null);
      } else {
        setLocais([...locais, novoLocal]);
      }
      setNovoLocal({ nome: '', link: '', telefone: '' });
    } else {
      alert('Preencha todos os campos!');
    }
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
      } catch (error) {
        console.error('Erro ao salvar os dados no Firebase:', error);
        alert('Erro ao salvar os dados!');
      }
    }

    alert('Sucesso!');
    setLoading(false);
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
                    <button onClick={() => handleEditLocal(index)} className={styles.btnEdit}>
                      <FaEdit className={styles.icon} />
                    </button>
                    <button onClick={() => handleRemoveLocal(index)} className={styles.btnRemove}>
                      <FaTrash className={styles.icon} />
                    </button>
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
    </div>
  );
};

export default MarqueConsulta;
