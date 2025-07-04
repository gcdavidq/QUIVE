import clsx from 'clsx';

const PaymentDetails = ({
  metodoSeleccionado,
  datosTarjeta,
  datosYape,
  datosPaypal,
  errores,
  handleInputChange
}) => {
  if (metodoSeleccionado === 'card') {
    return (
      <div className="space-y-4 theme-card p-6 rounded-xl border theme-border">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold theme-text-primary">Información de la Tarjeta</h4>
          <div className="flex space-x-2">
            <div className="w-8 h-5 bg-blue-600 rounded"></div>
            <div className="w-8 h-5 bg-red-600 rounded"></div>
            <div className="w-8 h-5 bg-yellow-400 rounded"></div>
          </div>
        </div>
        <div className="relative">
          <label className="block text-sm font-medium theme-text-secondary mb-2">Número de Tarjeta</label>
          <input
            name="numero"
            placeholder="1234 5678 9012 3456"
            value={datosTarjeta.numero}
            onChange={e => handleInputChange(e, 'card')}
            className={clsx(
              "w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 theme-bg-input transition-all",
              errores.numero ? 'border-red-500 ring-2 ring-red-200' : 'theme-border'
            )}
            maxLength="19"
          />
          {errores.numero && <p className="text-sm text-red-500 mt-1 flex items-center">⚠️{errores.numero}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">Fecha de Vencimiento</label>
            <input
              name="vencimiento"
              placeholder="MM/AA"
              value={datosTarjeta.vencimiento}
              onChange={e => handleInputChange(e, 'card')}
              className={clsx(
                "w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 theme-bg-input transition-all",
                errores.vencimiento ? 'border-red-500 ring-2 ring-red-200' : 'theme-border'
              )}
              maxLength="5"
            />
            {errores.vencimiento && <p className="text-sm text-red-500 mt-1">⚠️{errores.vencimiento}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">CVC</label>
            <input
              name="cvc"
              placeholder="123"
              value={datosTarjeta.cvc}
              onChange={e => handleInputChange(e, 'card')}
              className={clsx(
                "w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 theme-bg-input transition-all",
                errores.cvc ? 'border-red-500 ring-2 ring-red-200' : 'theme-border'
              )}
              maxLength="4"
            />
            {errores.cvc && <p className="text-sm text-red-500 mt-1">⚠️{errores.cvc}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium theme-text-secondary mb-2">Nombre del Titular</label>
          <input
            name="titular"
            placeholder="Juan Pérez"
            value={datosTarjeta.titular}
            onChange={e => handleInputChange(e, 'card')}
            className={clsx(
              "w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 theme-bg-input transition-all",
              errores.titular ? 'border-red-500 ring-2 ring-red-200' : 'theme-border'
            )}
          />
          {errores.titular && <p className="text-sm text-red-500 mt-1">⚠️{errores.titular}</p>}
        </div>
        <div className="flex items-center space-x-2 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <span className="text-blue-600">🔒</span>
          <span className="text-sm text-blue-700 dark:text-blue-300">Tus datos están protegidos con encriptación SSL</span>
        </div>
      </div>
    );
  }

  if (metodoSeleccionado === 'yape') {
    return (
      <div className="space-y-4 theme-card p-6 rounded-xl border theme-border">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold theme-text-primary">Información de Yape/Plin</h4>
          <div className="flex space-x-2">
            <div className="w-10 h-6 bg-purple-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">YAPE</span>
            </div>
            <div className="w-10 h-6 bg-pink-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">PLIN</span>
            </div>
          </div>
        </div>
        {['dni', 'numero', 'codigo'].map(field => (
          <div key={field}>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              {field === 'dni' ? 'DNI' : field === 'numero' ? 'Número de Teléfono' : 'Código de Verificación'}
            </label>
            <input
              name={field}
              placeholder={field === 'dni' ? '12345678' : field === 'numero' ? '987654321' : '123456'}
              value={datosYape[field]}
              onChange={e => handleInputChange(e, 'yape')}
              className={clsx(
                "w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 theme-bg-input transition-all",
                errores[field] ? 'border-red-500 ring-2 ring-red-200' : 'theme-border'
              )}
              maxLength={field === 'dni' ? '8' : field === 'numero' ? '9' : '6'}
            />
            {errores[field] && <p className="text-sm text-red-500 mt-1">⚠️{errores[field]}</p>}
          </div>
        ))}
        <div className="flex items-center space-x-2 mt-4 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
          <span className="text-purple-600">📱</span>
          <span className="text-sm text-purple-700 dark:text-purple-300">
            Se enviará un código de verificación a tu número registrado
          </span>
        </div>
      </div>
    );
  }

  if (metodoSeleccionado === 'paypal') {
    return (
      <div className="space-y-4 theme-card p-6 rounded-xl border theme-border">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold theme-text-primary">Información de PayPal</h4>
          <div className="w-16 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-sm font-bold">PayPal</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium theme-text-secondary mb-2">Email de PayPal</label>
          <input
            name="email"
            type="email"
            placeholder="ejemplo@email.com"
            value={datosPaypal.email}
            onChange={e => handleInputChange(e, 'paypal')}
            className={clsx(
              "w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 theme-bg-input transition-all",
              errores.email ? 'border-red-500 ring-2 ring-red-200' : 'theme-border'
            )}
          />
          {errores.email && <p className="text-sm text-red-500 mt-1">⚠️{errores.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium theme-text-secondary mb-2">Contraseña</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            value={datosPaypal.password}
            onChange={e => handleInputChange(e, 'paypal')}
            className={clsx(
              "w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 theme-bg-input transition-all",
              errores.password ? 'border-red-500 ring-2 ring-red-200' : 'theme-border'
            )}
          />
          {errores.password && <p className="text-sm text-red-500 mt-1">⚠️{errores.password}</p>}
        </div>
        <div className="flex items-center space-x-2 mt-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <span className="text-blue-600">🔐</span>
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Serás redirigido a PayPal para completar el pago de forma segura
          </span>
        </div>
      </div>
    );
  }


  return null;
};

export default PaymentDetails;
