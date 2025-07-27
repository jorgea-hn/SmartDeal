export let renderDashboardAdmin = (main,ul) => {
    main.innerHTML=`
    <h1>Hola Admin</h1>
    `
    ul.innerHTML=`
    <a href="/login" id="log-out"class="btn primary" data-link>Log out</a>
    `
    document.getElementById('log-out').addEventListener('click',e => {
        e.preventDefault()
        localStorage.removeItem('user')
        window.history.pushState(null, null, '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
    })
}