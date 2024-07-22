document.title = "Registro participantes";
const formRegistro = document.getElementById("formRegistro");

formRegistro.addEventListener("submit", async (event) => {
    try {
        event.preventDefault();
        let formData = new FormData(formRegistro);
        if (formData.get("password") != formData.get("repeatPassword")) {
            return alert("Los passwords no coinciden.")
        }
        let response = await fetch("/api/v1/registro", {
            method: "POST",
            body: formData,
        });
        let data = await response.json();
        alert(data.message)
        if (response.status == 201) {
            location.href = "/login"
        }
    } catch (error) {
        alert("Error al registrar usuario.");
    }
});