import { showAlert } from "./sweetAlerts";

export let api = {
    base: "http://localhost:3000",
    get : (param) => {
        return fetch(`${api.base}${param}`)
        .then(response => {
            if(!response.ok) throw new Error(`Error HTTP ${response.status}`)
            return response.json()
        })
        .catch(error => {showAlert(error.message,'error'); throw error})
    },
    post: (param,pack) => {
        return fetch(`${api.base}${param}`, {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify(pack)
        })

        .then(response => {
            if(!response.ok) throw new Error (`Error HTTP ${response.status}`)
            showAlert('User had been created','success');   
            return response.json()
        })
        .catch(error => {
            showAlert(error.message,'error')
            throw error;
        })
        
    },
    delete: (param) => {
        return fetch(`${api.base}${param}`,{
            method: 'DELETE',
            headers: {
                'content-type':'application/json'
            }
        })
        .then(response => {
            if(!response.ok)throw new Error(`Error HTTP ${response.status}`)
            showAlert("Element deleted",'success');
        })
        .catch(error => {
            showAlert(error.message,'error')
            throw error;
        })
    },
    put: (param,pack) => {
        return fetch(`${api.base}${param}`,{
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(pack)
        })
        .then(response => {
            if(!response.ok) throw new Error(`Error HTTP ${response.status}`)
            showAlert("Element updated successfully",'success');
        })
        .catch(error => {
            showAlert(error.message,'error')
            throw error;
        })
    }
}