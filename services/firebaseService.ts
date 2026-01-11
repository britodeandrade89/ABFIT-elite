import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  onSnapshot,
  Timestamp,
  orderBy,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import { db, appId } from './firebase';

// Helper to ensure correct path within app namespace
const getCollectionRef = (collectionName: string) => {
  return collection(db, 'artifacts', appId, 'public', 'data', collectionName);
};

// ===== TREINOS PRESCRITOS (COACH -> STUDENT) =====
export const treinosPrescritosRef = getCollectionRef('treinosPrescritos');

export const adicionarTreinoPrescrito = async (treinoData: any, professorId: string) => {
  try {
    const treinoCompleto = {
      ...treinoData,
      professorId,
      alunoId: treinoData.alunoId,
      criadoEm: Timestamp.now(),
      atualizadoEm: Timestamp.now(),
      concluido: false
    };
    
    const docRef = await addDoc(treinosPrescritosRef, treinoCompleto);
    console.log('✅ Treino prescrito salvo no Firebase:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Erro ao salvar treino prescrito:', error);
    throw error;
  }
};

export const getTreinosPrescritosPorAluno = async (alunoId: string) => {
  try {
    const q = query(
      treinosPrescritosRef, 
      where('alunoId', '==', alunoId),
      orderBy('criadoEm', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar treinos:', error);
    return [];
  }
};

export const atualizarTreinoPrescrito = async (treinoId: string, dadosAtualizados: any) => {
  try {
    const treinoRef = doc(db, 'artifacts', appId, 'public', 'data', 'treinosPrescritos', treinoId);
    await updateDoc(treinoRef, {
      ...dadosAtualizados,
      atualizadoEm: Timestamp.now()
    });
    console.log('✅ Treino atualizado no Firebase');
  } catch (error) {
    console.error('❌ Erro ao atualizar treino:', error);
  }
};

// ===== TREINOS EXECUTADOS (STUDENT LOGS) =====
export const treinosExecutadosRef = getCollectionRef('treinosExecutados');

export const adicionarTreinoExecutado = async (treinoData: any, alunoId: string) => {
  try {
    // Logic to distinguish Update vs Create
    // If it has a long string ID (Firestore generated), we try to update.
    if (treinoData.id && typeof treinoData.id === 'string' && treinoData.id.length > 20) {
      const treinoRef = doc(db, 'artifacts', appId, 'public', 'data', 'treinosExecutados', treinoData.id);
      await updateDoc(treinoRef, {
        ...treinoData,
        alunoId,
        atualizadoEm: Timestamp.now()
      });
      console.log('✅ Treino atualizado no Firebase:', treinoData.id);
      return treinoData.id;
    } 
    // New Record (Create)
    else {
      // Remove temporary local IDs to avoid database pollution
      const { id, ...dadosLimpos } = treinoData;
      
      const treinoCompleto = {
        ...dadosLimpos,
        alunoId,
        criadoEm: Timestamp.now(),
        atualizadoEm: Timestamp.now()
      };
      
      const docRef = await addDoc(treinosExecutadosRef, treinoCompleto);
      console.log('✅ Novo treino salvo no Firebase:', docRef.id);
      return docRef.id;
    }
  } catch (error) {
    console.error('❌ Erro ao salvar treino executado:', error);
    throw error;
  }
};

export const getTreinosExecutadosPorAluno = async (alunoId: string) => {
  try {
    const q = query(
      treinosExecutadosRef, 
      where('alunoId', '==', alunoId),
      orderBy('criadoEm', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar treinos executados:', error);
    return [];
  }
};

// ===== REAL-TIME LISTENERS =====

export const escutarTreinosPrescritos = (alunoId: string, callback: (data: any[]) => void) => {
  const q = query(
    treinosPrescritosRef,
    where('alunoId', '==', alunoId),
    orderBy('criadoEm', 'desc')
  );
  
  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const treinos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(treinos);
  });
};

export const escutarTreinosExecutados = (alunoId: string, callback: (data: any[]) => void) => {
  const q = query(
    treinosExecutadosRef,
    where('alunoId', '==', alunoId),
    orderBy('criadoEm', 'desc')
  );
  
  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const treinos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(treinos);
  });
};