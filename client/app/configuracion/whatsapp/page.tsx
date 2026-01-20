'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function WhatsappConfigPage() {
  const [status, setStatus] = useState({ connected: false, qr: null, phone: null });
  const [loading, setLoading] = useState(true);
  
  // Estado para la hora
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const [savingTime, setSavingTime] = useState(false);

  // Cargar estado y configuración
  const loadData = async () => {
      try {
          // Cargar Estado WhatsApp
          const resStatus = await fetch(`${process.env.NEXT_PUBLIC_API_NOTIFICATIONS}/status`);
          if(resStatus.ok) setStatus(await resStatus.json());

          // Cargar Hora Programada
          const resConfig = await fetch(`${process.env.NEXT_PUBLIC_API_NOTIFICATIONS}/config`);
          if(resConfig.ok) {
              const data = await resConfig.json();
              setScheduleTime(data.time);
          }
      } catch (error) {
          console.error("Error conectando con servicio");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      loadData();
      
      const interval = setInterval(async () => {
          try {
              // Agregamos TRY para capturar errores si el servidor se cae
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_NOTIFICATIONS}/status`);
              if(res.ok) {
                  setStatus(await res.json());
              }
          } catch (error) {
              // Si falla, solo lo ignoramos silenciosamente o cambiamos estado a desconectado
              // pero NO rompemos la página.
              console.log("Esperando conexión con el servidor...");
              setStatus(prev => ({ ...prev, connected: false }));
          }
      }, 5000);

      return () => clearInterval(interval);
  }, []);

  const handleUpdateSchedule = async () => {
      setSavingTime(true);
      try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_NOTIFICATIONS}/config`, {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ time: scheduleTime })
          });
          if(res.ok) alert("Horario actualizado correctamente");
          else alert("Error al actualizar horario");
      } catch(e) { alert("Error de conexión"); }
      setSavingTime(false);
  };

  const handleLogout = async () => {
      if(!confirm("¿Desconectar bot?")) return;
      try {
          await fetch(`${process.env.NEXT_PUBLIC_API_NOTIFICATIONS}/logout`, { method: 'POST' });
          setTimeout(loadData, 3000);
      } catch(e) { alert("Error al desconectar"); }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TARJETA 1: CONEXIÓN */}
        <div className="p-6 bg-white shadow-lg rounded-lg border-t-4 border-green-500 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-green-500">📱</span> Conexión WhatsApp
            </h2>

            {loading ? <p>Cargando...</p> : (
                <div className="flex flex-col items-center">
                    {status.connected ? (
                        <div className="text-center animate-fade-in-up">
                            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
                            <h3 className="font-bold text-green-700">Conectado</h3>
                            <p className="text-sm text-gray-600 mb-4">{status.phone}</p>
                            <button onClick={handleLogout} className="text-sm text-red-500 underline">Desvincular</button>
                        </div>
                    ) : (
                        <div className="text-center">
                             <div className="border-4 border-gray-800 p-2 rounded-lg inline-block bg-white mb-2">
                                {status.qr ? <QRCodeSVG value={status.qr} size={180} /> : <div className="h-40 w-40 flex items-center justify-center bg-gray-100 text-xs">Cargando QR...</div>}
                            </div>
                            <p className="text-xs text-gray-500">Escanea para conectar</p>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* TARJETA 2: CONFIGURACIÓN HORARIA */}
        <div className="p-6 bg-white shadow-lg rounded-lg border-t-4 border-blue-500 h-fit">
             <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-blue-500">⏰</span> Programación Automática
            </h2>
            
            <p className="text-sm text-gray-600 mb-6">
                El sistema enviará los recordatorios automáticamente todos los días a la hora configurada aquí.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">Hora de Envío (Diaria)</label>
                <div className="flex gap-2">
                    <input 
                        type="time" 
                        value={scheduleTime} 
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button 
                        onClick={handleUpdateSchedule}
                        disabled={savingTime}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
                    >
                        {savingTime ? '...' : 'Guardar'}
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 italic">
                    * Se enviarán mensajes a los pacientes citados para el día siguiente.
                </p>
            </div>
        </div>

    </div>
  );
}