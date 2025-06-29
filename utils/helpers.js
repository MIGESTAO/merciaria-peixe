window.helpers = {
  formatCurrency: (amount) => {
    return `${amount.toLocaleString('pt-MZ')} MT`;
  },
  
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('pt-MZ');
  },
  
  formatDateTime: () => {
    return new Date().toLocaleString('pt-MZ');
  },
  
  generateId: () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  },
  
  showAlert: (title, text, icon = 'success') => {
    return Swal.fire({ title, text, icon });
  },
  
  showConfirm: (title, text) => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Cancelar'
    });
  }
};