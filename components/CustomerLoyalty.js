function CustomerLoyalty({ userType }) {
  const [customers, setCustomers] = React.useState([]);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    nome: '',
    telefone: '',
    email: '',
    pontos: 0
  });

  React.useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const snapshot = await firebaseDB.getCustomers();
      const customersData = snapshot.val() || {};
      const customersList = Object.keys(customersData).map(key => ({
        id: key,
        ...customersData[key]
      }));
      setCustomers(customersList);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const customerData = {
        ...formData,
        pontos: 0,
        dataRegistro: helpers.formatDateTime(),
        totalCompras: 0
      };

      await firebaseDB.addCustomer(customerData);
      helpers.showAlert('Sucesso', 'Cliente adicionado com sucesso!');
      resetForm();
      loadCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      helpers.showAlert('Erro', 'Erro ao salvar cliente', 'error');
    }
  };

  const addPoints = async (customer, points) => {
    try {
      const newPoints = customer.pontos + points;
      await firebaseDB.updateCustomer(customer.id, { pontos: newPoints });
      helpers.showAlert('Sucesso', `${points} pontos adicionados!`);
      loadCustomers();
    } catch (error) {
      console.error('Error adding points:', error);
      helpers.showAlert('Erro', 'Erro ao adicionar pontos', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      telefone: '',
      email: '',
      pontos: 0
    });
    setShowAddForm(false);
  };

  try {
    return (
      <div data-name="customer-loyalty" data-file="components/CustomerLoyalty.js">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Programa de Fidelidade</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center"
          >
            <div className="icon-user-plus mr-2"></div>
            Novo Cliente
          </button>
        </div>

        {showAddForm && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Adicionar Cliente</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome do cliente"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="p-3 border rounded-lg"
                required
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                className="p-3 border rounded-lg"
                required
              />
              <input
                type="email"
                placeholder="Email (opcional)"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="p-3 border rounded-lg md:col-span-2"
              />
              <div className="md:col-span-2 flex space-x-4">
                <button type="submit" className="btn-primary">Adicionar</button>
                <button type="button" onClick={resetForm} className="btn-danger">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-left p-3">Telefone</th>
                  <th className="text-left p-3">Pontos</th>
                  <th className="text-left p-3">Nível</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => {
                  const nivel = customer.pontos >= 1000 ? 'VIP' : 
                               customer.pontos >= 500 ? 'Gold' : 
                               customer.pontos >= 100 ? 'Silver' : 'Bronze';
                  return (
                    <tr key={customer.id} className="border-b">
                      <td className="p-3">{customer.nome}</td>
                      <td className="p-3">{customer.telefone}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {customer.pontos} pts
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          nivel === 'VIP' ? 'bg-purple-100 text-purple-800' :
                          nivel === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                          nivel === 'Silver' ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {nivel}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => addPoints(customer, 10)}
                          className="text-blue-600 hover:text-blue-700 mr-2"
                        >
                          <div className="icon-plus-circle"></div>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('CustomerLoyalty component error:', error);
    return null;
  }
}