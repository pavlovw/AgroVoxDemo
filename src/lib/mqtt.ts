import mqtt from 'mqtt';

// Utilizamos un broker público de prueba (EMQX) por ahora vía WebSockets (puerto 8083).
// En producción, esto se cambiará por la URL de tu propio servidor (ej. AWS IoT o un Mosquitto privado).
const BROKER_URL = process.env.NEXT_PUBLIC_MQTT_URL || 'ws://broker.emqx.io:8083/mqtt';

export const client = mqtt.connect(BROKER_URL, {
  // Generamos un ID único para cada vez que abras el dashboard, evitando choques de sesión
  clientId: `agrovox_admin_${Math.random().toString(16).substring(2, 10)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

client.on('connect', () => {
  console.log('✅ Conectado exitosamente al broker MQTT de AgroVox');
  
  // Nos suscribimos al tópico general donde todos los nodos reportarán
  client.subscribe('agrovox/nodos/+/telemetria', (err) => {
    if (err) {
      console.error('❌ Error al suscribirse al tópico:', err);
    } else {
      console.log('📡 Suscrito al flujo de telemetría de los árboles');
    }
  });
});

client.on('error', (err) => {
  console.error('⚠️ Problema de conexión MQTT:', err);
});