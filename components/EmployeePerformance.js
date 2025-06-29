function EmployeePerformance({ userType }) {
  const [employees, setEmployees] = React.useState([]);
  const [sales, setSales] = React.useState([]);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    nome: '',
    cargo: '',
    metaMensal: '',
    comissao: ''
  });

  React.useEffect(() => {
    loadEmployees();
    loadSales();
  }, []);

  const loadEmployees = async () => {
    try {
      const snapshot = await firebaseDB.getEmployees();
      const employeesData = snapshot.val() || {};
      const employeesList = Object.keys(employeesData).map(key => ({
        id: key,
        ...employeesData[key]
      }));
      setEmployees(employeesList);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadSales = async () => {
    try {
      const snapshot = await firebaseDB.getSales();
      const salesData = snapshot.val() || {};
      setSales(Object.values(salesData));
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const employeeData = {
        ...formData,
        metaMensal: parseFloat(formData.metaMensal),
        comissao: parseFloat(formData.comissao),
        dataContratacao: new Date().toISOString(),
        vendas: 0
      };

      await firebaseDB.addEmployee(employeeData);
      helpers.showAlert('Sucesso', 'Funcionário adicionado com sucesso!');
      resetForm();
      loadEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      helpers.showAlert('Erro', 'Erro ao salvar funcionário', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      cargo: '',
      metaMensal: '',
      comissao: ''
    });
    setShowAddForm(false);
  };

  const getEmployeeStats = (employeeId) => {
    const currentMonth = new Date().getMonth();
    const employeeSales = sales.filter(sale => 
      sale.seller === employeeId && 
      new Date(sale.date).getMonth() === currentMonth
    );
    
    const totalSales = employeeSales.reduce((sum, sale) => sum + sale.total, 0);
    const salesCount = employeeSales.length;
    
    return { totalSales, salesCount };
  };

  try {
    return (
      <div data-name="employee-performance" data-file="components/EmployeePerformance.js">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Desempenho dos Funcionários</h2>
          {userType === 'admin' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center"
            >
              <div className="icon-user-plus mr-2"></div>
              Adicionar Funcionário
            </button>
          )}
        </div>

        {showAddForm && userType === 'admin' && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Adicionar Funcionário</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome completo"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="p-3 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Cargo"
                value={formData.cargo}
                onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                className="p-3 border rounded-lg"
                required
              />
              <input
                type="number"
                placeholder="Meta mensal (MT)"
                value={formData.metaMensal}
                onChange={(e) => setFormData({...formData, metaMensal: e.target.value})}
                className="p-3 border rounded-lg"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Comissão (%)"
                value={formData.comissao}
                onChange={(e) => setFormData({...formData, comissao: e.target.value})}
                className="p-3 border rounded-lg"
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
                  <th className="text-left p-3">Funcionário</th>
                  <th className="text-left p-3">Cargo</th>
                  <th className="text-left p-3">Vendas Mensal</th>
                  <th className="text-left p-3">Meta</th>
                  <th className="text-left p-3">Performance</th>
                  <th className="text-left p-3">Comissão</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(employee => {
                  const stats = getEmployeeStats(employee.id);
                  const performance = employee.metaMensal > 0 ? 
                    ((stats.totalSales / employee.metaMensal) * 100).toFixed(1) : 0;
                  const commission = (stats.totalSales * employee.comissao / 100);
                  
                  return (
                    <tr key={employee.id} className="border-b">
                      <td className="p-3">{employee.nome}</td>
                      <td className="p-3">{employee.cargo}</td>
                      <td className="p-3">{helpers.formatCurrency(stats.totalSales)}</td>
                      <td className="p-3">{helpers.formatCurrency(employee.metaMensal)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          performance >= 100 ? 'bg-green-100 text-green-800' :
                          performance >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {performance}%
                        </span>
                      </td>
                      <td className="p-3">{helpers.formatCurrency(commission)}</td>
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
    console.error('EmployeePerformance component error:', error);
    return null;
  }
}