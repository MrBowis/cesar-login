'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email: string; role: string; name?: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Verificar autenticación
    const checkAuth = () => {
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
      } else {
        setIsAuthenticated(false);
        setUserInfo(null);
      }
    };

    checkAuth();

    // Escuchar cambios en localStorage
    window.addEventListener('storage', checkAuth);
    
    // Verificar cada vez que cambia la ruta
    checkAuth();

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    document.cookie = 'access_token=; path=/; max-age=0';
    document.cookie = 'user=; path=/; max-age=0';
    setIsAuthenticated(false);
    setUserInfo(null);
    setMobileMenuOpen(false);
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y nombre */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="text-2xl">🔐</div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                SecureLogin
              </span>
            </Link>

            {/* Enlaces de navegación - Desktop */}
            <div className="hidden md:flex md:ml-10 md:space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Inicio
              </Link>
              
              <Link
                href="/cesar"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/cesar')
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                🔐 Cifrado César
              </Link>

              {isAuthenticated && (
                <Link
                  href={userInfo?.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/client'}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname?.startsWith('/dashboard')
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Mi Panel
                </Link>
              )}
            </div>
          </div>

          {/* Acciones del usuario - Desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated && userInfo ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    {userInfo.name || userInfo.email}
                  </span>
                  <Badge 
                    variant={userInfo.role === 'ADMIN' ? 'default' : 'secondary'}
                    className={userInfo.role === 'ADMIN' ? 'bg-purple-500' : 'bg-blue-500'}
                  >
                    {userInfo.role}
                  </Badge>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Botón de menú móvil */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Inicio
            </Link>

            <Link
              href="/cesar"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/cesar')
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              🔐 Cifrado César
            </Link>

            {isAuthenticated && (
              <Link
                href={userInfo?.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/client'}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname?.startsWith('/dashboard')
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Mi Panel
              </Link>
            )}
          </div>

          {/* Sección de usuario móvil */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated && userInfo ? (
              <div className="px-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-medium text-gray-800">
                      {userInfo.name || 'Usuario'}
                    </div>
                    <div className="text-sm text-gray-500">{userInfo.email}</div>
                  </div>
                  <Badge 
                    variant={userInfo.role === 'ADMIN' ? 'default' : 'secondary'}
                    className={userInfo.role === 'ADMIN' ? 'bg-purple-500' : 'bg-blue-500'}
                  >
                    {userInfo.role}
                  </Badge>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                >
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <div className="px-4 space-y-2">
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
