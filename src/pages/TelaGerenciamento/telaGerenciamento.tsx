import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { db } from '../../config/firebase-config'; // Certifique-se que seu arquivo firebase-config está correto
import styles from './telaGerenciamento.styles.module.css';

const TelaGerenciamento: React.FC = () => {
    const [tipoCancer, setTipoCancer] = useState('');
    const [calculoDeRisco, setCalculoDeRisco] = useState<string[]>([]);
    const [novaStringCalculo, setNovaStringCalculo] = useState('');
    const [mensagem, setMensagem] = useState('');

    // Função para adicionar um tipo de câncer ao Firebase
    const handleAddTipoCancer = async () => {
        if (!tipoCancer) {
            setMensagem('Por favor, insira um nome para o tipo de câncer.');
            return;
        }

        try {
            // Adicionar o documento à coleção tiposCancer
            await addDoc(collection(db, 'tiposCancer'), {
                tipoCancer,
                calculoDeRisco
            });

            setMensagem('Tipo de câncer cadastrado com sucesso!');
            setTipoCancer('');
            setCalculoDeRisco([]);
            setNovaStringCalculo('');
        } catch (error) {
            console.error('Erro ao adicionar tipo de câncer:', error);
            setMensagem('Erro ao cadastrar tipo de câncer.');
        }
    };

    // Função para adicionar uma string ao array de cálculo de risco
    const handleAddStringCalculo = () => {
        if (novaStringCalculo) {
            setCalculoDeRisco([...calculoDeRisco, novaStringCalculo]);
            setNovaStringCalculo(''); // Limpar o campo após adicionar
        }
    };

    return (
        <div className={styles.container}>
            <h2>Cadastro de Tipos de Câncer</h2>

            <label htmlFor="tipoCancer">Tipo de Câncer:</label>
            <input
                type="text"
                id="tipoCancer"
                value={tipoCancer}
                onChange={(e) => setTipoCancer(e.target.value)}
                placeholder="Digite o nome do tipo de câncer"
                required
            />

            <label htmlFor="calculoDeRisco">Adicionar Cálculo de Risco:</label>
            <input
                type="text"
                id="calculoDeRisco"
                value={novaStringCalculo}
                onChange={(e) => setNovaStringCalculo(e.target.value)}
                placeholder="Digite o cálculo de risco"
            />
            <button onClick={handleAddStringCalculo}>Adicionar ao cálculo de risco</button>

            <ul>
                {calculoDeRisco.map((calculo, index) => (
                    <li key={index}>{calculo}</li>
                ))}
            </ul>

            <button onClick={handleAddTipoCancer}>Cadastrar Tipo de Câncer</button>

            {mensagem && <p>{mensagem}</p>}
        </div>
    );
};

export default TelaGerenciamento;
