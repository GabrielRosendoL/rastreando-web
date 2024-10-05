import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { auth } from '../../config/firebase-config';
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

  // Função para buscar os locais do Firebase
  const fetchLocais = async (sexoAtual: string) => {
    const user = auth.currentUser;
    if (user && sexoAtual) {
      const docRef = doc(db, 'marqueConsulta', `${user.uid}_${sexoAtual}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLocais(docSnap.data().locais || []);
      } else {
        setLocais([]);
      }
    }
  };

  useEffect(() => {
    if (sexo) {
      fetchLocais(sexo);
    }
  }, [sexo, db]);

  const handleSexoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const novoSexo = event.target.value;
    setSexo(novoSexo);
    setLocais([]); // Resetar a lista ao mudar de sexo
    fetchLocais(novoSexo); // Buscar locais para o novo sexo selecionado
  };

  const handleAddLocal = () => {
    if (novoLocal.nome && novoLocal.link && novoLocal.telefone) {
      if (editandoIndex !== null) {
        const novosLocais = [...locais];
        novosLocais[editandoIndex] = novoLocal; // Atualizando local existente
        setLocais(novosLocais);
        setEditandoIndex(null);
      } else {
        setLocais([...locais, novoLocal]); // Adicionando novo local
      }
      setNovoLocal({ nome: '', link: '', telefone: '' });
    } else {
      alert('Preencha todos os campos!');
    }
  };

  const handleEditLocal = (index: number) => {
    const localParaEditar = locais[index];
    setNovoLocal(localParaEditar);
    setEditandoIndex(index); // Define o índice do item em edição
  };

  const handleSave = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user && sexo) {
      const docRef = doc(db, 'marqueConsulta', `${user.uid}_${sexo}`);
      // Salvando os locais no documento do Firebase
      try {
        await setDoc(docRef, { locais }, { merge: true });
        alert('Sucesso!');
      } catch (error) {
        console.error('Erro ao salvar os dados no Firebase:', error);
        alert('Erro ao salvar os dados!');
      }
    } else {
      alert('Por favor, preencha todos os campos.');
    }
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
                <button onClick={() => handleEditLocal(index)} className={styles.btnEdit}>Editar</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={handleSave} className={styles.btnSave} disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar Locais'}
      </button>
      {loading && <div className={styles.spinner}></div>}
    </div>
  );
};

export default MarqueConsulta;
