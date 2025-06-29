function SupplierManagement({ userType }) {
  const [suppliers, setSuppliers] = React.useState([]);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    nome: '',
    contato: '',
    email: '',
    telefone: '',
    endereco: '',
    avaliacao: 5
  });

  React.useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const snapshot = await firebaseDB.getSuppliers();
      const suppliersData = snapshot.val() || {};
      const suppliersList = Object.keys(suppliersData).map(key => ({
        id: key,
        ...suppliersData[key]
      }));
      setSuppliers(suppliersList);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const supplierData = {
        ...formData,
        dataRegistro: helpers.formatDateTime()
      };

      await firebaseDB.addSupplier(supplierData);
      helpers.showAlert('Sucesso', 'Fornecedor adicionado com sucesso!');
      resetForm();
      loadSuppliers();
    } catch (error) {
      console.error('Error saving supplier:', error);
      helpers.showAlert('Erro', 'Erro ao salvar fornecedor', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      contato: '',
      email: '',
      telefone: '',
      endereco: '',
      avaliacao: 5
    });
    setShowAddForm(false);
  };

  try {
    return (
      <div data-name="supplier-management" data-file="components/SupplierManagement.js">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gestão de Fornecedores</h2>
          {userType === 'admin' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center"
            >
              <div className="icon-plus mr-2"></div>
              Adicionar Fornecedor
            </button>
          )}
        </div>

        {showAddForm && userType === 'admin' && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Adicionar Fornecedor</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome do fornecedor"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="p-3 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Pessoa de contato"
                value={formData.contato}
                onChange={(e) => setFormData({...formData, contato: e.target.value})}
                className="p-3 border rounded-lg"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                type="text"
                placeholder="Endereço"
                value={formData.endereco}
                onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                className="p-3 border rounded-lg md:col-span-2"
                required
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
                  <th className="text-left p-3">Fornecedor</th>
                  <th className="text-left p-3">Contato</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Telefone</th>
                  <th className="text-left p-3">Avaliação</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(supplier => (
                  <tr key={supplier.id} className="border-b">
                    <td className="p-3">{supplier.nome}</td>
                    <td className="p-3">{supplier.contato}</td>
                    <td className="p-3">{supplier.email}</td>
                    <td className="p-3">{supplier.telefone}</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`icon-star text-sm ${
                            i < supplier.avaliacao ? 'text-yellow-400' : 'text-gray-300'
                          }`}></div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('SupplierManagement component error:', error);
    return null;
  }
}