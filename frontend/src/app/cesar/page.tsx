'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  cesarEncrypt,
  cesarDecrypt,
  getCesarHistory,
  deleteCesarHistoryItem,
  deleteAllCesarHistory,
} from '@/lib/api';
import { CesarHistoryItem, CesarOperationResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function CesarCipherPage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [shift, setShift] = useState<number>(3);
  const [result, setResult] = useState<CesarOperationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [saveToHistory, setSaveToHistory] = useState(false);
  const [history, setHistory] = useState<CesarHistoryItem[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    
    if (token) {
      loadHistory();
    }
  }, []);

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      setHistoryLoading(true);
      const data = await getCesarHistory(token, 50, 0);
      setHistory(data.items);
      setHistoryTotal(data.total);
      setError('');
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleEncrypt = async () => {
    if (!text.trim()) {
      setError('Por favor ingresa un texto para cifrar');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('access_token');
      const response = await cesarEncrypt(
        {
          text,
          shift,
          save_to_history: saveToHistory && isAuthenticated,
        },
        token || undefined
      );
      
      setResult(response);
      
      // Recargar historial si se guardó
      if (response.saved_to_history) {
        await loadHistory();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cifrar');
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!text.trim()) {
      setError('Por favor ingresa un texto para descifrar');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('access_token');
      const response = await cesarDecrypt(
        {
          text,
          shift,
          save_to_history: saveToHistory && isAuthenticated,
        },
        token || undefined
      );
      
      setResult(response);
      
      // Recargar historial si se guardó
      if (response.saved_to_history) {
        await loadHistory();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descifrar');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await deleteCesarHistoryItem(token, id);
      await loadHistory();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleDeleteAllHistory = async () => {
    if (!confirm('¿Estás seguro de eliminar TODOS los registros del historial?')) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await deleteAllCesarHistory(token);
      await loadHistory();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar historial');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Texto copiado al portapapeles');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-linear-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6 py-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-3xl">🔐 Cifrado César</CardTitle>
              <CardDescription>
                Cifra y descifra mensajes usando el método César clásico
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel de Cifrado/Descifrado */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Operación</CardTitle>
              <CardDescription>
                Ingresa el texto y el desplazamiento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Texto de entrada */}
              <div className="space-y-2">
                <Label htmlFor="text">Texto</Label>
                <textarea
                  id="text"
                  className="w-full min-h-30 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ingresa el texto aquí..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              {/* Desplazamiento */}
              <div className="space-y-2">
                <Label htmlFor="shift">
                  Desplazamiento: <span className="font-bold text-purple-600">{shift}</span>
                </Label>
                <Input
                  id="shift"
                  type="number"
                  value={shift}
                  onChange={(e) => setShift(parseInt(e.target.value) || 0)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Ejemplos: 3 (estándar), 13 (ROT13), -5 (desplazamiento negativo)
                </p>
              </div>

              {/* Guardar en historial */}
              {isAuthenticated && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                  <input
                    id="saveHistory"
                    type="checkbox"
                    checked={saveToHistory}
                    onChange={(e) => setSaveToHistory(e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="saveHistory" className="cursor-pointer text-sm">
                    💾 Guardar en mi historial
                  </Label>
                </div>
              )}

              {!isAuthenticated && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    ℹ️ Inicia sesión para poder guardar tu historial
                  </p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3">
                <Button
                  onClick={handleEncrypt}
                  disabled={loading || !text.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? 'Procesando...' : '🔒 Cifrar'}
                </Button>
                <Button
                  onClick={handleDecrypt}
                  disabled={loading || !text.trim()}
                  variant="outline"
                  className="flex-1"
                >
                  {loading ? 'Procesando...' : '🔓 Descifrar'}
                </Button>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Panel de Resultado */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Resultado</CardTitle>
              <CardDescription>
                {result
                  ? `Operación: ${result.operation === 'ENCRYPT' ? 'Cifrado' : 'Descifrado'}`
                  : 'El resultado aparecerá aquí'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  {/* Texto original */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Texto Original:</Label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm font-mono wrap-break-word">{result.input_text}</p>
                    </div>
                  </div>

                  {/* Texto resultante */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Resultado:</Label>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-lg font-mono font-bold wrap-break-word text-purple-900">
                        {result.output_text}
                      </p>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Desplazamiento: {result.shift}</p>
                      {result.saved_to_history && (
                        <Badge variant="default" className="bg-green-500">
                          ✓ Guardado en historial
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(result.output_text)}
                    >
                      📋 Copiar
                    </Button>
                  </div>

                  {/* Botón para usar resultado */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setText(result.output_text);
                      setResult(null);
                    }}
                  >
                    ↻ Usar este resultado
                  </Button>
                </div>
              ) : (
                <div className="h-75 flex items-center justify-center text-gray-400">
                  <div className="text-center space-y-2">
                    <p className="text-6xl">🔐</p>
                    <p className="text-sm">Realiza una operación para ver el resultado</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Historial (solo para usuarios autenticados) */}
        {isAuthenticated && (
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>📚 Mi Historial</CardTitle>
                  <CardDescription>
                    {historyTotal > 0
                      ? `Tienes ${historyTotal} operación${historyTotal !== 1 ? 'es' : ''} guardadas`
                      : 'No tienes operaciones guardadas'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {historyTotal > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAllHistory}
                    >
                      🗑️ Limpiar Todo
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    {showHistory ? '▼ Ocultar' : '▶ Mostrar'}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {showHistory && (
              <CardContent>
                {historyLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : history.length > 0 ? (
                  <div className="space-y-3 max-h-125 overflow-y-auto">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={item.operation_type === 'ENCRYPT' ? 'default' : 'secondary'}
                            >
                              {item.operation_type === 'ENCRYPT' ? '🔒 Cifrado' : '🔓 Descifrado'}
                            </Badge>
                            <span className="text-xs text-gray-500">Shift: {item.shift}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteHistoryItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </Button>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">Entrada: </span>
                            <span className="font-mono">
                              {item.input_text.length > 60
                                ? item.input_text.substring(0, 60) + '...'
                                : item.input_text}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Salida: </span>
                            <span className="font-mono font-bold">
                              {item.output_text.length > 60
                                ? item.output_text.substring(0, 60) + '...'
                                : item.output_text}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">
                              {new Date(item.created_at).toLocaleString('es-ES')}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setText(item.input_text);
                                setShift(item.shift);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              ↻ Reutilizar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-4xl mb-2">📭</p>
                    <p>No tienes operaciones guardadas</p>
                    <p className="text-sm mt-2">
                      Activa &quot;Guardar en historial&quot; al realizar operaciones
                    </p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {/* Información sobre César */}
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="shrink-0 text-3xl">📖</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¿Qué es el Cifrado César?
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  El cifrado César es uno de los métodos de cifrado más antiguos y simples. Funciona
                  desplazando cada letra del alfabeto un número fijo de posiciones. Por ejemplo, con
                  un desplazamiento de 3, la A se convierte en D, la B en E, y así sucesivamente.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
                  <div>
                    <span className="font-semibold">✓ Uso público:</span> Cualquiera puede cifrar/descifrar
                  </div>
                  <div>
                    <span className="font-semibold">✓ Historial privado:</span> Solo tus registros son visibles
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
