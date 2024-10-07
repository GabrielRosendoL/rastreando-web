import { collection, doc, getDoc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import styles from './condutaManejoResultado.styles.module.css';


interface Item {
  resultado: string;
  descricao: string;
}

const CondutaManejoResultado: React.FC = () => {
  const [sexo, setSexo] = useState<string | null>(null);
  const [neoplasia, setNeoplasia] = useState<string | null>(null);
  const [novoItem, setNovoItem] = useState<Item>({ resultado: '', descricao: '' });
  const [itens, setItens] = useState<Item[]>([]);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const db = getFirestore();

  const fetchItens = async (sexoAtual: string, neoplasiaAtual: string) => {
    setLoading(true);
    const adminCollectionRef = collection(db, 'administradores');
    const adminSnapshots = await getDocs(adminCollectionRef);
    const itensEncontrados: Item[] = [];

    for (const admin of adminSnapshots.docs) {
      const adminId = admin.id;
      const docRef = doc(db, 'condutaManejoResultado', adminId, 'combinacoes', `${sexoAtual}_${neoplasiaAtual}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const itensAdmin = data.itens || [];
        itensEncontrados.push(...itensAdmin);
      }
    }

    setItens(itensEncontrados);
    setLoading(false);
  };

  useEffect(() => {
    if (sexo && neoplasia) {
      fetchItens(sexo, neoplasia);
    }
  }, [sexo, neoplasia, db]);

  const handleSexoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const novoSexo = event.target.value;
    setSexo(novoSexo);
    setNeoplasia(null);
    setItens([]);
  };

  const handleNeoplasiaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNeoplasia(event.target.value);
  };

  const handleAddItem = () => {
    if (novoItem.resultado && novoItem.descricao) {
      if (editandoIndex !== null) {
        const novosItens = [...itens];
        novosItens[editandoIndex] = novoItem;
        setItens(novosItens);
        setEditandoIndex(null);
      } else {
        setItens([...itens, novoItem]);
      }
      setNovoItem({ resultado: '', descricao: '' });
    } else {
      alert('Preencha todos os campos!');
    }
  };

  const handleEditItem = (index: number) => {
    const itemParaEditar = itens[index];
    setNovoItem(itemParaEditar);
    setEditandoIndex(index);
  };

  const handleRemoveItem = (index: number) => {
    const novosItens = itens.filter((_, i) => i !== index);
    setItens(novosItens);
  };


  const handleSave = async () => {
    setLoading(true);
    const adminCollectionRef = collection(db, 'administradores');
    const adminSnapshots = await getDocs(adminCollectionRef);

    for (const admin of adminSnapshots.docs) {
      const adminId = admin.id;
      const docRef = doc(db, 'condutaManejoResultado', adminId, 'combinacoes', `${sexo}_${neoplasia}`);

      try {
        await setDoc(docRef, { itens }, { merge: true });
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
      <h1 className={styles.title}>Cadastrar Resultados de Conduta e Manejo</h1>

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

      {loading ? (
        <div className={styles.spinner}></div>
      ) : (
        neoplasia && (
          <>
            <div className={styles.formGroup}>
              <label>Resultado:</label>
              <input
                type="text"
                value={novoItem.resultado}
                onChange={(e) => setNovoItem({ ...novoItem, resultado: e.target.value })}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Descrição:</label>
              <input
                type="text"
                value={novoItem.descricao}
                onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
                className={styles.input}
              />
            </div>

            <button onClick={handleAddItem} className={styles.btnAdd}>
              {editandoIndex !== null ? 'Atualizar' : 'Adicionar'}
            </button>

            {itens.length > 0 && (
              <div className={styles.scrollView}>
                <h3>Resultados Cadastrados:</h3>
                <ul className={styles.itemList}>
                  {itens.map((item, index) => (
                    <li key={index} className={styles.item}>
                      <div>
                        <strong>Resultado:</strong> {item.resultado} <br />
                        <strong>Descrição:</strong> {item.descricao}
                      </div>
                      <div className={styles.buttonsContainer}>
                        <button onClick={() => handleEditItem(index)} className={styles.btnEdit}>
                          <FaEdit className={styles.icon} />
                        </button>
                        <button onClick={() => handleRemoveItem(index)} className={styles.btnRemove}>
                          <FaTrash className={styles.icon} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

              </div>
            )}

            <button onClick={handleSave} className={styles.btnSave} disabled={loading}>
              {loading ? 'Carregando...' : 'Salvar Resultados'}
            </button>
          </>
        )
      )}
    </div>
  );
};

export default CondutaManejoResultado;
