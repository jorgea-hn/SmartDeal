export let local_ = {
  dashboard: () => {
    let local = localStorage.getItem("user");
    if (local) {
      local = JSON.parse(local);
      const role = local[0]?.role;
      if (role === 'admin') return '/dashboardAdmin';
      if (role === 'customer') return '/dashboardCustomer';
      return null;
    }
    return null;
  }
};

