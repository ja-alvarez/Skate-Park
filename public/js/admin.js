document.title = "Página administración";

const cambiarEstado = async (id) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`)

        let response = await fetch("/api/v1/participantes/estado?id=" + id, {
            method: "PUT",
            headers: myHeaders
        });
        let data = await response.json();
        alert(data.message)
        //location.reload()
    } catch (error) {
        console.log(error)
        alert("Error al intentar cambiar el estado.");
        //location.reload();
    }
}