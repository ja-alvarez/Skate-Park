const homeLink = document.getElementById("homeLink");
const perfilLink = document.getElementById("perfilLink");
const loginLink = document.getElementById("loginLink");
const logoutLink = document.getElementById("logoutLink");
const administracionLinks = document.getElementById("administracionLinks");
const logout = document.getElementById("logout");
const perfil = document.getElementById("perfil");
const adminUsuarios = document.getElementById("adminUsuarios");

let token = localStorage.getItem("token");
let participante = JSON.parse(localStorage.getItem("participante"));

if (token) {
    loginLink.style.display = "none";
    registroLink.style.display = "none";
    logoutLink.style.display = "block";
    perfilLink.style.display = "block";
};

if (participante) {
    document.getElementById("brand").innerText = "Bienvenido " + participante.nombre;
    if (participante.admin) {
        administracionLinks.style.display = "block";
    }
}

logout.addEventListener("click", (event) => {
    event.preventDefault();
    let confirmacion = confirm("¿Está seguro de cerrar sesión?")
    if (confirmacion) {
        localStorage.removeItem("token");
        localStorage.removeItem("participante");
        //location.reload();
        //alert("Sesión cerrada correctamente.")
        setTimeout(() => {
            location.href = "/";
        }, 200)
    }
});

perfil.addEventListener("click", (event) => {
    event.preventDefault();
    location.href = "/perfil?token=" + token;
});

adminUsuarios.addEventListener("click", (event) => {
    event.preventDefault();
    location.href = "/administracion?token=" + token;
});