import { signOut } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase-config';
import styles from './telaGerenciamento.styles.module.css';

const TelaGerenciamento: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();
  const db = getFirestore();

  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'administradores', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const nome = userDoc.data().nome;
          setUserName(nome);
        }
      } else {
        navigate('/telaLogin');
      }
    };

    fetchUserName();
  }, [db, navigate]);

  const handleButtonSinaisSintomas = () => {
    navigate('/sinaisSintomas');
  };

  const handleButtonSinaisAlarmeFatoresRisco = () => {
    navigate('/sinaisAlarmeFatoresRisco');
  };

  const handleIndicacoesRastreio = () => {
    navigate('/indicacoesRastreio');
  };

  const handleMarqueConsulta = () => {
    navigate('/marqueConsulta');
  };

  const handleCondutaManejoResultado = () => {
    navigate('/condutaManejoResultado');
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/telaLogin');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <span className={styles.rastreando}>Rastreando</span> <span className={styles.app}>WEB</span>
      </h1>
      <h2 className={styles.welcomeMessage}>Bem-vindo, {userName}!</h2>
      <button onClick={handleButtonSinaisSintomas} className={styles.btn}>
        Sinais e Sintomas
      </button>
      <button onClick={handleButtonSinaisAlarmeFatoresRisco} className={styles.btn}>
        Sinais de Alerta e Fatores de Risco
      </button>
      <button onClick={handleIndicacoesRastreio} className={styles.btn}>
        Indicações de Rastreio
      </button>
      <button onClick={handleMarqueConsulta} className={styles.btn}>
        Marque uma Consulta
      </button>
      <button onClick={handleCondutaManejoResultado} className={styles.btn}>
        Conduta e Manejo após Resultado
      </button>
      <button onClick={handleLogout} className={styles.logoutBtn}>
        Sair
      </button>
    </div>
  );
};

export default TelaGerenciamento;
