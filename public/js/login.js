document.title = "Iniciar sesión";

const formLogin = document.getElementById("formLogin");
formLogin.addEventListener("submit", async (event) => {
    try {
        event.preventDefault();
        let formData = new FormData(formLogin);
        let response = await fetch("/api/v1/login", {
            method: "POST",
            body: formData,
        });
        let data = await response.json();
        alert(data.message)
        if (response.status == 200) {
            localStorage.setItem("token", data.token)
            localStorage.setItem("participante", JSON.stringify(data.participante));
            location.href = "/perfil?token=" + data.token;
        }
        //else {
        //    localStorage.removeItem("token")
        //}
    } catch {
        alert("Error al iniciar sesion.");
        localStorage.removeItem("token");
    }
})