function LoginScreen({ onLogin }) {
  const [userType, setUserType] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = () => {
    try {
      if (!userType) {
        helpers.showAlert('Erro', 'Selecione o tipo de usuário', 'error');
        return;
      }

      if (userType === 'admin') {
        if (password !== 'micten25') {
          helpers.showAlert('Erro', 'Senha incorreta para administrador', 'error');
          return;
        }
      }

      onLogin(userType);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  try {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden" data-name="login-screen" data-file="components/LoginScreen.js">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="floating-animation">
          <div className="glass-effect rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 pulse-glow" data-aos="zoom-in">
          <div className="text-center mb-8" data-aos="fade-down">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg floating-animation">
              <div className="icon-store text-4xl text-white"></div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Mercearia Micten</h1>
            <p className="text-gray-700 font-medium">Sistema de Gestão Avançado</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Usuário
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="userType"
                    value="admin"
                    onChange={(e) => setUserType(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <div className="icon-shield text-blue-600 mr-2"></div>
                    <span>Administrador</span>
                  </div>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="userType"
                    value="employee"
                    onChange={(e) => setUserType(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <div className="icon-user text-green-600 mr-2"></div>
                    <span>Funcionário</span>
                  </div>
                </label>
              </div>
            </div>

            {userType === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha do Administrador
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite a senha"
                />
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Entrar
            </button>
          </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('LoginScreen component error:', error);
    return null;
  }
}
