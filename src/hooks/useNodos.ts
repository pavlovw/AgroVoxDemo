import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Nos conectamos al puerto 3001 donde está corriendo nuestro backend
const socket = io('http://localhost:3001');

export const useNodos = () => {
  const [nodosAlerta, setNodosAlerta] = useState<string[]>([]);

  useEffect(() => {
    // Escuchamos el evento 'alerta_nodo' que emite nuestro loraController.ts
    socket.on('alerta_nodo', (data) => {
      console.log('Alerta recibida del backend:', data);
      
      // Agregamos el ID del nodo al estado para que el mapa lo pinte de rojo
      setNodosAlerta((prev) => {
        if (!prev.includes(data.nodoId)) {
          return [...prev, data.nodoId];
        }
        return prev;
      });
    });

    return () => {
      socket.off('alerta_nodo');
    };
  }, []);

  return { nodosAlerta };
};