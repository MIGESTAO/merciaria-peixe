function ExportSystem({ salesData, products }) {
  const exportToCSV = (data, filename) => {
    try {
      const csvContent = convertToCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      helpers.showAlert('Sucesso', 'Arquivo exportado com sucesso!');
    } catch (error) {
      console.error('Export error:', error);
      helpers.showAlert('Erro', 'Erro ao exportar arquivo', 'error');
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  };

  const exportSalesReport = () => {
    const salesReport = salesData.map(sale => ({
      Data: helpers.formatDateTime(sale.date),
      Produto: sale.productName,
      Quantidade: sale.quantity,
      'Preço Unitário': sale.unitPrice,
      Total: sale.total,
      Vendedor: sale.seller
    }));
    
    exportToCSV(salesReport, `relatorio_vendas_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportInventoryReport = () => {
    const inventoryReport = products.map(product => ({
      Nome: product.nome,
      Categoria: product.categoria,
      Quantidade: product.quantidade,
      'Preço Compra': product.precoCompra,
      'Preço Venda': product.precoVenda,
      'Data Validade': product.dataValidade
    }));
    
    exportToCSV(inventoryReport, `inventario_${new Date().toISOString().split('T')[0]}.csv`);
  };

  try {
    return (
      <div className="flex space-x-4" data-name="export-system" data-file="components/ExportSystem.js">
        <button
          onClick={exportSalesReport}
          className="btn-primary flex items-center"
        >
          <div className="icon-download mr-2"></div>
          Exportar Vendas
        </button>
        <button
          onClick={exportInventoryReport}
          className="btn-success flex items-center"
        >
          <div className="icon-package mr-2"></div>
          Exportar Inventário
        </button>
      </div>
    );
  } catch (error) {
    console.error('ExportSystem component error:', error);
    return null;
  }
}