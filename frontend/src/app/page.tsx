'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email: string; role: string; name?: string } | null>(null);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      try {
        const user = JSON.parse(userData);
        setUserInfo(user);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    document.cookie = 'access_token=; path=/; max-age=0';
    document.cookie = 'user=; path=/; max-age=0';
    setIsAuthenticated(false);
    setUserInfo(null);
    router.push('/');
  };

  const handleGoToDashboard = () => {
    if (userInfo?.role === 'ADMIN') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard/client');
    }
  };
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-5xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Sistema de Autenticación Segura
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Plataforma de autenticación con verificación en dos pasos usando Microsoft Authenticator.
            Elige tu tipo de cuenta para comenzar.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-12">
          {/* User Card */}
          <Card className="shadow-xl hover:shadow-2xl transition-shadow border-2 hover:border-blue-300">
            <CardHeader className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="text-2xl text-blue-900">Login Seguro</CardTitle>
              <CardDescription className="text-base">
                Acceso para usuarios del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Características:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Acceso seguro con 2FA obligatorio</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Panel de usuario personalizado</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Protección avanzada de datos</span>
                  </li>
                </ul>
              </div>

              {/* Mostrar botones según estado de autenticación */}
              {isAuthenticated && userInfo ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-800 font-medium">
                          ✓ Sesión activa
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {userInfo.name || userInfo.email}
                        </p>
                      </div>
                      <Badge 
                        variant={userInfo.role === 'ADMIN' ? 'default' : 'secondary'}
                        className={userInfo.role === 'ADMIN' ? 'bg-purple-500' : 'bg-blue-500'}
                      >
                        {userInfo.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={handleGoToDashboard}
                      className="w-full bg-blue-600 hover:bg-blue-700" 
                      size="lg"
                    >
                      Ir a Mi Panel
                    </Button>
                    <Button 
                      onClick={handleLogout}
                      variant="outline" 
                      className="w-full border-red-300 text-red-600 hover:bg-red-50" 
                      size="lg"
                    >
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link href="/auth/login" className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="block">
                    <Button variant="outline" className="w-full" size="lg">
                      Crear Cuenta
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cifrado César Card */}
        <Card className="mt-8 shadow-xl border-2 border-purple-200 hover:border-purple-400 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-3">
                <div className="shrink-0 text-4xl">🔐</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Prueba el Cifrado César
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Experimenta con uno de los métodos de cifrado más antiguos. No requiere cuenta
                    para uso básico, pero puedes guardar tu historial si inicias sesión.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    <span className="px-3 py-1 bg-purple-50 rounded-full">✓ Acceso público</span>
                    <span className="px-3 py-1 bg-purple-50 rounded-full">✓ Historial privado</span>
                    <span className="px-3 py-1 bg-purple-50 rounded-full">✓ Fácil de usar</span>
                  </div>
                </div>
              </div>
              <Link href="/cesar">
                <Button className="bg-purple-600 hover:bg-purple-700 ml-4" size="lg">
                  Probar Ahora
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card className="mt-8 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Máxima Seguridad</h3>
                <p className="text-sm text-gray-600">
                  Este sistema implementa autenticación de dos factores (2FA) obligatoria usando Microsoft Authenticator.
                  Todos los datos están protegidos con cifrado de extremo a extremo y las sesiones son monitoreadas
                  constantemente para garantizar tu seguridad.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

