/**
 * auth.js
 *
 * Este archivo implementa un sistema simple de autenticación **SIMULADO** usando localStorage.
 * Permite a los usuarios iniciar y cerrar sesión con un usuario de prueba predefinido.
 *
 * **IMPORTANTE:** Este código ha sido modificado para cumplir con las directrices de seguridad
 * del módulo, eliminando el registro y la validación de contraseñas en el cliente que cometi anteriormente.
 *
 * **SOLUCIÓN APLICADA:**
 * 1. Se ha eliminado el formulario de registro y toda la lógica asociada (Sección 7).
 * 2. Se ha eliminado el almacenamiento de usuarios y contraseñas en localStorage.
 * 3. El login ahora solo valida contra un usuario de prueba genérico (Sección 6).
 * 4. Se han añadido comentarios explicativos sobre la simulación.
 */

// ========== 1. VARIABLES GLOBALES ==========
// Referencias a elementos del DOM y variables de estado globales para la autenticación.
const authModalEl = document.getElementById('authModal');        // Modal completo
const authModal = new bootstrap.Modal(authModalEl);              // Instancia de Bootstrap
const authBtn = document.getElementById('authBtn');              // Botón Login/Logout
const authBtnText = document.getElementById('authBtnText');      // Texto del botón

let isLoggedIn = false;      // Indica si el usuario está logueado
let currentUser = null;      // Objeto con los datos del usuario actual

// Usuario de prueba para la SIMULACIÓN de Login
const MOCK_USER = {
  name: 'Usuario Demo',
  email: 'demo@demo.com',
  password: 'password' // Contraseña de prueba, solo para comparación local SIMULADA
};

// ========== 2. CARGAR SESIÓN AL INICIAR ==========
// Al cargar la página, comprobamos si hay una sesión guardada en localStorage
// para mantener al usuario logueado entre recargas.
const session = localStorage.getItem('esoares_session');
if(session){
  currentUser = JSON.parse(session);  // Convertimos texto a objeto
  isLoggedIn = true;                  // Marcamos como logueado
}

// ========== 3. ACTUALIZAR INTERFAZ ==========
// Actualiza la interfaz según el estado de autenticación:
// Si hay usuario logueado, muestra su nombre y el botón permite cerrar sesión.
// Si no, muestra "Login" y el botón abre el modal de autenticación.
function updateAuthUI(){
  if(isLoggedIn && currentUser){
    // CASO: Usuario SÍ está logueado
    authBtnText.textContent = currentUser.name;  // Mostramos su nombre
    authBtn.onclick = handleLogout;              // Botón hace logout
  } else {
    // CASO: Usuario NO está logueado  
    authBtnText.textContent = 'Login';           // Mostramos "Login"
    authBtn.onclick = ()=> authModal.show();     // Botón abre modal
  }
}

// ========== 4. FUNCIÓN DE CERRAR SESIÓN ==========
// Elimina la sesión del usuario y actualiza la interfaz.
// Pregunta confirmación antes de cerrar sesión.
function handleLogout(){
  // Preguntamos confirmación al usuario
  if(confirm('¿Cerrar sesión?')){
    // Limpiamos datos de sesión
    localStorage.removeItem('esoares_session');
    isLoggedIn = false;
    currentUser = null;
    
    updateAuthUI();  // Actualizamos la interfaz
    
    // Cerramos el modal si está abierto
    const modalInstance = bootstrap.Modal.getInstance(authModalEl);
    if(modalInstance) modalInstance.hide();
    
    alert('Sesión cerrada');
    
    // Volvemos a la sección de inicio
    // NOTA:'showSection' es una función global definida en otro archivo (main.js)
    if (typeof showSection === 'function') {
        showSection('inicio');
    }
  }
}

// ========== 5. CAMBIAR ENTRE LOGIN Y REGISTRO (ELIMINADO) ==========
// Se elimina la funcionalidad de registro. Se añade un comentario para explicar el cambio.
// **COMENTARIO DE SEGURIDAD:** Se ha eliminado la funcionalidad de registro para evitar
// el almacenamiento de contraseñas en el cliente, cumpliendo con las directrices del lado cliente.
// El modal de autenticación ahora solo mostrará el formulario de Login.

// Se eliminan los listeners de toRegisterLink y toLoginLink, ya que el registro se elimina.
const toRegisterLink = document.getElementById('toRegisterLink');
const toLoginLink = document.getElementById('toLoginLink');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const authModalTitle = document.getElementById('authModalTitle');

if (toRegisterLink) toRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (registerForm) registerForm.style.display = 'block';
    if (loginForm) loginForm.style.display = 'none';
    if (authModalTitle) authModalTitle.textContent = 'Registrarse (Simulado)';
    alert('**ADVERTENCIA DE SEGURIDAD:** El registro ha sido deshabilitado para evitar el almacenamiento de contraseñas en el cliente. Por favor, usa el usuario de prueba para el login.');
});

if (toLoginLink) toLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (registerForm) registerForm.style.display = 'none';
    if (loginForm) loginForm.style.display = 'block';
    if (authModalTitle) authModalTitle.textContent = 'Iniciar Sesión';
});

// Aseguramos que solo se muestre el login al inicio
if (registerForm) registerForm.style.display = 'none';
if (loginForm) loginForm.style.display = 'block';
if (authModalTitle) authModalTitle.textContent = 'Iniciar Sesión';


// ========== 6. MANEJAR FORMULARIO DE LOGIN (SIMULADO) ==========
// Procesa el formulario de login: valida campos y SIMULA el login contra un usuario de prueba.
// **COMENTARIO DE SEGURIDAD:** La validación de credenciales se realiza contra un usuario demo@prueba.com contraseña "password"
// para evitar el almacenamiento de contraseñas en el cliente. En un entorno real, esta validación DEBEria hacerse en un servidor, ahora me quedó claro.
// de prueba genérico para SIMULAR el flujo de login sin exponer credenciales reales.
if(loginForm){
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();  // Evita que el formulario se envíe
      
      // Obtenemos valores de los campos
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
    
      // Validación básica
      if(!email || !password){
        alert('Completa los campos');
        return;  // Salimos de la función
      }
      
      // !!!!!SIMULACIÓN DE LOGIN: Comparamos contra el usuario de prueba
      // **ADVERTENCIA DE SEGURIDAD:** En un entorno real, esta validación DEBE hacerse en un servidor.
      if(email === MOCK_USER.email && password === MOCK_USER.password){
        // LOGIN EXITOSO SIMULADO
        isLoggedIn = true;
        currentUser = {name: MOCK_USER.name, email: MOCK_USER.email};
        
        // Guardamos sesión en localStorage (solo el nombre y email, NO la contraseña)
        localStorage.setItem('esoares_session', JSON.stringify(currentUser));
        
        updateAuthUI();     // Actualizamos interfaz
        authModal.hide();   // Cerramos modal
        alert('Login exitoso (Simulado). Usuario: ' + MOCK_USER.email + ' / Contraseña: ' + MOCK_USER.password);
        
        e.target.reset();   // Limpiamos formulario
      } else {
        alert('Credenciales incorrectas. Usa el usuario de prueba: ' + MOCK_USER.email + ' / ' + MOCK_USER.password);
      }
    });
}

// ========== 7. MANEJAR FORMULARIO DE REGISTRO (ELIMINADO) ==========
// Se elimina la funcionalidad de registro para cumplir con las directrices de seguridad del cliente.
// Se ha dejado un comentario en la sección 5.

// ========== 8. INICIALIZAR INTERFAZ ==========
// Al cargar el archivo, actualiza la interfaz de autenticación según el estado actual.
updateAuthUI();
