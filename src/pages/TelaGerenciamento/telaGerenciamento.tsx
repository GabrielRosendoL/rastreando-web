import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase-config';
import styles from './telaGerenciamento.styles.module.css'; // Importa o CSS com o uso de módulos

const TelaGerenciamento: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();
  const db = getFirestore();

  useEffect(() => {
    const fetchUserName = async () => {
      console.log('fetchUserName chamado');
      const user = auth.currentUser;
      if (user) {
        console.log('Usuário autenticado:', user.uid);
        const userDocRef = doc(db, 'administradores', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const nome = userDoc.data().nome;
          console.log('Nome do usuário:', nome);
          setUserName(nome);
        } else {
          console.log('Documento do usuário não encontrado');
        }
      } else {
        console.log('Nenhum usuário autenticado');
      }
    };

    fetchUserName();
  }, [db]);

  const handleButtonClick = () => {
    navigate('/sinaisSintomas');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <span className={styles.rastreando}>Rastreando</span> <span className={styles.app}>WEB</span>
      </h1>
      <h2 className={styles.welcomeMessage}>Bem-vindo, {userName}!</h2>
      <button onClick={handleButtonClick} className={styles.btn}>
        Sinais e Sintomas
      </button>
    </div>
  );
};

export default TelaGerenciamento;