document.title = "Perfil participante";

id = participante.id
const eliminarCuenta = async (id) => {
    try {
        let confirmacion = confirm("¿Está seguro que desea eliminar su cuenta?")
        if (confirmacion) {
            let response = await fetch("/api/v1/participantes/" + participante.id, {
                method: "DELETE"
            })
            let data = await response.json();
            if (response.status == 200) {
                localStorage.removeItem("token");
                localStorage.removeItem("participante");
                //localStorage.clear();
                location.href = "/";
            } else {
                alert(data.message)
            }
        }
    } catch (error) {
        console.log(error)
        alert("Error al intentar eliminar participante.")
    }
};

const formUpdate = document.getElementById("formUpdate");
formUpdate.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        let formData = new FormData(formUpdate);
        console.log('formData', formData)
        let data = Object.fromEntries(formData.entries());
        console.log('data', data)
        let response = await fetch("/api/v1/participantes/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        let result = await response.json();
        if (response.status == 200) {
            alert(result.message)
            location.reload();
        }
    } catch (error) {
        console.log('error', error)
        alert("Error al actualizar usuario.");
        console.error(error);
    }
});