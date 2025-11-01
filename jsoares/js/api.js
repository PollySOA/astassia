/**
 * api.js - Archivo principal de la aplicación jQuery para el monitor de asteroides y visualización NASA Eyes
 *
 * Este archivo contiene toda la lógica de la aplicación web, incluyendo:
 * - Integración con APIs de la NASA (asteroides, imágenes EPIC, etc.)
 * - Renderizado de visualizaciones interactivas (NASA Eyes)
 * - Gestión de navegación entre secciones
 * - Comentarios y valoración anónimos
 */

// =================== CONFIGURACIÓN GLOBAL (FUERA DE READY) ===================
// Yo: intento obtener la clave desde la configuración global `APP_CONFIG` si existe.
const API_KEY = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.NASA_API_KEY)
  ? APP_CONFIG.NASA_API_KEY
  : (typeof NASA_API_KEY !== "undefined" ? NASA_API_KEY : "DEMO_KEY");

// Yo: la API NEOWS necesita al menos start_date; construyo un rango de 7 días
const today = new Date();
const endDate = today.toISOString().slice(0,10);
const startDateObj = new Date(today);
startDateObj.setDate(startDateObj.getDate() - 7);
const startDate = startDateObj.toISOString().slice(0,10);

const API_BASE = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.NASA_NEOWS_URL)
  ? APP_CONFIG.NASA_NEOWS_URL
  : 'https://api.nasa.gov/neo/rest/v1/feed';

const API_URL = `${API_BASE}?start_date=${startDate}&end_date=${endDate}&api_key=${API_KEY}`;

console.log('📋 Configuración cargada:', { API_KEY: API_KEY.substring(0, 10) + '...', API_URL });

$(document).ready(function(){
  
  // =================== VARIABLES DE ESTADO ===================
  let allAsteroids = [];
  let currentFilter = 'all';
  let epicImages = [];
  let currentEpicIndex = 0;
  let nasaEyesLoaded = {
    swot: false,
    asteroids: false,
    earth: false
  };

  // ========== INICIALIZACIÓN PRINCIPAL ==========
  function init() {
    console.log('🚀 Monitor de Asteroides - jQuery iniciado');
    
    initEarthSystem();
    setupNavigation();
    loadAsteroids();
    setupEyesSections();
    initExplorar();
    initComments();
  }

  // ========== NASA EYES INTEGRATION ==========
  function setupEyesSections() {
    $(document).on('click', '.nav-link[data-section="tierra"]', function() {
      setTimeout(() => {
        if (!nasaEyesLoaded.earth) {
          console.log('🔄 Cargando NASA Eyes para Tierra...');
          loadNASAEyes('earth');
        }
      }, 1000);
    });

    $(document).on('click', '.nav-link[data-section="eyes"]', function() {
      setTimeout(() => {
        if (!nasaEyesLoaded.swot) {
          console.log('🔄 Cargando NASA Eyes automáticamente...');
          loadNASAEyes('swot');
        }
        if (!nasaEyesLoaded.asteroids) {
          console.log('🔄 Cargando NASA Asteroids automáticamente...');
          loadNASAEyes('asteroids');
        }
      }, 1000);
    });
  }

  function loadNASAEyes(type = 'swot') {
    console.log(`🚀 Cargando NASA Eyes: ${type}`);
    
    let $loading, $content, containerId;
    
    switch(type) {
      case 'earth':
        $loading = $('#earthLoading');
        $content = $('#earthContent');
        containerId = 'earthContainer';
        break;
      case 'asteroids':
        $loading = $('#asteroidsEyesLoading');
        $content = $('#asteroidsEyesContent');
        containerId = 'asteroidsContainer';
        break;
      default:
        $loading = $('#eyesLoading');
        $content = $('#eyesContent');
        containerId = 'eyesContainer';
    }
    
    $loading.show();
    $content.hide().empty();
    
    const urls = {
      earth: 'https://eyes.nasa.gov/apps/earth/#/',
      asteroids: 'https://eyes.nasa.gov/apps/asteroids/#/',
      swot: 'https://eyes.nasa.gov/apps/earth/#/satellites/swot'
    };
    const titles = {
      earth: 'Tierra desde el Espacio',
      asteroids: 'Asteroides en Tiempo Real', 
      swot: 'Satélite SWOT - Topografía Oceánica'
    };
    const descriptions = {
      earth: 'Vista en tiempo real de nuestro planeta con datos de satélites NASA',
      asteroids: 'Seguimiento 3D de asteroides cercanos a la Tierra',
      swot: 'Monitoreo de topografía oceánica y datos hidrológicos'
    };

    setTimeout(() => {
      try {
        const eyesHTML = `
          <div class="nasa-eyes-embed">
            <div class="embed-container" style="position: relative; height: 800px; border-radius: 10px; overflow: hidden; border: 2px solid rgba(252, 61, 33, 0.3);">
              <iframe 
                src="${urls[type]}" 
                style="width: 100%; height: 100%; border: none;"
                allowfullscreen
                title="${titles[type]}"
                onload="handleEyesLoad('${type}')"
                onerror="handleEyesError('${type}')">
              </iframe>
            </div>
            <div class="eyes-info mt-3 p-3" style="background: rgba(11, 61, 145, 0.2); border-radius: 8px;">
              <h5 style="color: var(--nasa-red);">${titles[type]}</h5>
              <p class="mb-2">${descriptions[type]}</p>
              <p class="mb-0"><strong>Fuente:</strong> NASA Eyes on the Solar System</p>
            </div>
          </div>
        `;
        
        $content.html(eyesHTML).fadeIn();
        $loading.hide();
        nasaEyesLoaded[type] = true;
        showEyesMessage(`✅ ${titles[type]} cargado correctamente`, 'success');
        
      } catch (error) {
        console.error(`❌ Error al cargar NASA Eyes ${type}:`, error);
        loadNASAEyesBackup(type);
      }
    }, 1000);
  }

  // =================== FUNCIONES GLOBALES PARA NASA EYES ===================
  window.handleEyesLoad = function(type) {
    console.log(`✅ NASA Eyes ${type} iframe cargado correctamente`);
    nasaEyesLoaded[type] = true;
    
    let $loading;
    switch(type) {
      case 'earth': 
        $loading = $('#earthLoading'); 
        break;
      case 'asteroids': 
        $loading = $('#asteroidsEyesLoading'); 
        break;
      default: 
        $loading = $('#eyesLoading');
    }
    $loading.hide();
  }

  window.handleEyesError = function(type) {
    console.error(`❌ Error al cargar el iframe de NASA Eyes ${type}`);
    loadNASAEyesBackup(type);
  }

  window.loadNASAEyes = function(type) {
    loadNASAEyes(type);
  }

  window.refreshNASAEyes = function(type) {
    console.log(`🔄 Actualizando NASA Eyes ${type}...`);
    
    let $content, $loading;
    switch(type) {
      case 'earth':
        $content = $('#earthContent');
        $loading = $('#earthLoading');
        break;
      case 'asteroids':
        $content = $('#asteroidsEyesContent');
        $loading = $('#asteroidsEyesLoading');
        break;
      default:
        $content = $('#eyesContent');
        $loading = $('#eyesLoading');
    }
    
    $loading.show();
    $content.hide();
    nasaEyesLoaded[type] = false;
    
    setTimeout(() => {
      loadNASAEyes(type);
      showEyesMessage(`🔄 ${type} actualizado`, 'info');
    }, 800);
  }

  function loadNASAEyesBackup(type) {
    console.log(`🔄 Cargando respaldo para NASA Eyes ${type}...`);
    
    let $content, $loading, title;
    
    switch(type) {
      case 'earth':
        $content = $('#earthContent');
        $loading = $('#earthLoading');
        title = 'Tierra desde el Espacio';
        break;
      case 'asteroids':
        $content = $('#asteroidsEyesContent');
        $loading = $('#asteroidsEyesLoading');
        title = 'Asteroides en Tiempo Real';
        break;
      default:
        $content = $('#eyesContent');
        $loading = $('#eyesLoading');
        title = 'Satélite SWOT';
    }
    
    const backupHTML = `
      <div class="nasa-eyes-backup">
        <div class="backup-visual" style="text-align: center; padding: 2rem;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">${type === 'asteroids' ? '☄️' : '🌍'}</div>
          <h4 style="color: var(--nasa-blue);">${title}</h4>
          <p class="text-muted">${type === 'asteroids' ? 'Seguimiento 3D de asteroides cercanos' : 'Vista del planeta Tierra desde el espacio'}</p>
        </div>
        <div class="backup-info mt-3 p-3" style="background: rgba(252, 61, 33, 0.1); border-radius: 8px;">
          <h5 style="color: var(--nasa-red);">📡 Información de NASA</h5>
          <div class="row mt-3">
            <div class="col-md-6">
              <div class="data-item mb-2"><strong>Plataforma:</strong> NASA Eyes</div>
              <div class="data-item mb-2"><strong>Datos:</strong> Tiempo real</div>
              <div class="data-item mb-2"><strong>Actualización:</strong> Continua</div>
            </div>
            <div class="col-md-6">
              <div class="data-item mb-2"><strong>Visualización:</strong> 3D Interactiva</div>
              <div class="data-item mb-2"><strong>Fuente:</strong> NASA/JPL</div>
              <div class="data-item mb-2"><strong>Estado:</strong> ${type === 'earth' ? 'Planeta Tierra' : 'Sistema Solar'}</div>
            </div>
          </div>
        </div>
        <div class="alert alert-warning mt-3">
          <i class="bi bi-info-circle"></i> 
          Para la experiencia interactiva completa, 
          <a href="${type === 'asteroids' ? 'https://eyes.nasa.gov/apps/asteroids/' : 'https://eyes.nasa.gov/apps/earth/'}" 
             target="_blank" style="color: var(--nasa-blue);">
            visita NASA Eyes directamente
          </a>
        </div>
      </div>
    `;
    $content.html(backupHTML).fadeIn();
    $loading.hide();
    nasaEyesLoaded[type] = true;
    showEyesMessage(`⚠️ Mostrando información de respaldo para ${type}`, 'warning');
  }

  function showEyesMessage(message, type = 'info') {
    const messageClass = type === 'success' ? 'alert-success' : 
                        type === 'warning' ? 'alert-warning' : 'alert-info';
    const messageHTML = `
      <div class="alert ${messageClass} alert-dismissible fade show mt-3" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
    $('#eyes').prepend(messageHTML);
    setTimeout(() => {
      $('.alert').alert('close');
    }, 4000);
  }

  // ========== ANIMACIÓN DEL SISTEMA SOLAR (FONDO) ==========
  function initEarthSystem() {
  // Yo: creo estrellas y elementos visuales del fondo para que la página se vea dinámica.
  // No afecta a la lógica de la API, solo al aspecto visual.
    const $container = $('#earth-system-container');
    
    if ($container.length === 0) {
      console.warn('⚠️ Contenedor del sistema solar no encontrado');
      return;
    }
    
    for (let i = 0; i < 250; i++) {
      const size = Math.random() * 2.5 + 0.5;
      $('<div>')
        .addClass('star')
        .css({
          width: size + 'px',
          height: size + 'px',
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          animationDelay: Math.random() * 3 + 's'
        })
        .appendTo($container);
    }

    let animationSpeed = 1;
    let isPaused = false;
    let angles = {
      sun: 0,
      moon: 0,
      satellites: [0, 120, 240],
      asteroids: [0, 60, 120, 180, 240, 300]
    };

    function animate() {
    // Yo: función principal que arranca la aplicación. La llamo al final para
    // inicializar todo lo necesario (animaciones, navegación, carga de datos).
      if (!isPaused) {
        angles.sun += 0.3 * animationSpeed;
        const sunRadius = 200;
        const sunX = Math.cos(angles.sun * Math.PI / 180) * sunRadius;
        const sunY = Math.sin(angles.sun * Math.PI / 180) * sunRadius;
        
        if ($('#sun').length) {
          $('#sun').css({
            left: '50%',
            top: '50%',
            marginLeft: sunX + 'px',
            marginTop: sunY + 'px',
            transform: 'translate(-50%, -50%)'
          });
        }

        angles.moon += 1.2 * animationSpeed;
        const moonRadius = 90;
        const moonX = Math.cos(angles.moon * Math.PI / 180) * moonRadius;
        const moonY = Math.sin(angles.moon * Math.PI / 180) * moonRadius;
        
        if ($('#moon').length) {
          $('#moon').css({
            left: '50%',
            top: '50%',
            marginLeft: moonX + 'px',
            marginTop: moonY + 'px',
            transform: 'translate(-50%, -50%)'
          });
        }

        angles.satellites = angles.satellites.map((angle, index) => {
          const newAngle = angle + 0.8 * animationSpeed;
          const satRadius = 120;
          const satX = Math.cos(newAngle * Math.PI / 180) * satRadius;
          const satY = Math.sin(newAngle * Math.PI / 180) * satRadius;
          
          if ($(`#satellite${index + 1}`).length) {
            $(`#satellite${index + 1}`).css({
              left: '50%',
              top: '50%',
              marginLeft: satX + 'px',
              marginTop: satY + 'px',
              transform: 'translate(-50%, -50%) rotate(' + newAngle + 'deg)'
            });
          }
          return newAngle;
        });

        angles.asteroids = angles.asteroids.map((angle, index) => {
          const newAngle = angle + 0.5 * animationSpeed;
          const astRadius = 160;
          const astX = Math.cos(newAngle * Math.PI / 180) * astRadius;
          const astY = Math.sin(newAngle * Math.PI / 180) * astRadius;
          
          if ($(`#asteroid${index + 1}`).length) {
            $(`#asteroid${index + 1}`).css({
              left: '50%',
              top: '50%',
              marginLeft: astX + 'px',
              marginTop: astY + 'px',
              transform: 'translate(-50%, -50%)'
            });
          }
          return newAngle;
        });
      }
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ========== NAVEGACIÓN ==========
  function setupNavigation() {
    $('.nav-link[data-section]').on('click', function(e) {
      e.preventDefault();
      const section = $(this).data('section');
      navigateToSection(section);
      
      if ($('#navbarNav').hasClass('show')) {
        $('.navbar-toggler').click();
      }
    });

    $('.btn-danger-neon[data-section]').on('click', function(e) {
      e.preventDefault();
      const section = $(this).data('section');
      const filter = $(this).data('filter');
      
      navigateToSection(section);
      
      if (filter) {
        setTimeout(() => {
          currentFilter = filter;
          $('.filter-btn').removeClass('active');
          $(`.filter-btn[data-filter="${filter}"]`).addClass('active');
          renderAsteroids();
        }, 500);
      }
    });

    $(document).on('click', '.filter-btn', function() {
      $('.filter-btn').removeClass('active');
      $(this).addClass('active');
      currentFilter = $(this).data('filter');
      applyFilter();  // Nueva función para aplicar filtro
    });
  }

  // Función para reaplicar filtros sin recargar datos
  function applyFilter() {
    console.log(`🔍 Aplicando filtro: ${currentFilter}`);
    
    let filtered = allAsteroids;
    if (currentFilter === 'dangerous') {
      filtered = filtered.filter(a => a.dangerous);
    } else if (currentFilter === 'safe') {
      filtered = filtered.filter(a => !a.dangerous);
    }
    
    // Ordenar por distancia
    filtered.sort((a, b) => a.distance - b.distance);

    // Renderizar lista (primeros 50)
    const visibleCount = 50;
    const asteroidHTML = filtered.slice(0, visibleCount).map(function(ast) {
      const velocity = Math.round(ast.velocity);
      const distance = Math.round(ast.distance);
      const moons = (ast.distance / CONFIG.MOON_DISTANCE).toFixed(2);
      const dangerClass = ast.dangerous && ast.distance < CONFIG.DANGER_THRESHOLD ? 'danger-high' : 
                          ast.dangerous ? 'danger-medium' : 'danger-low';
      const badge = ast.dangerous ? 
        '<span class="badge bg-danger">PELIGROSO</span>' :
        '<span class="badge bg-success">SEGURO</span>';
      
      return `
        <div class="asteroid-item ${dangerClass}">
          <div class="d-flex justify-content-between">
            <div>
              <h6 class="mb-1">${ast.name} ${badge}</h6>
              <small>
                <i class="bi bi-calendar"></i> ${ast.date} | 
                <i class="bi bi-rulers"></i> ${distance.toLocaleString('es-ES')} km (${moons} lunas) | 
                <i class="bi bi-speedometer2"></i> ${velocity.toLocaleString('es-ES')} km/h
              </small>
            </div>
          </div>
        </div>
      `;
    }).join('');

    $('#asteroidsList').html(asteroidHTML || '<p class="text-center text-muted">No hay asteroides con este filtro</p>');
    
    // Mostrar botón "Ver lista completa" si hay más asteroides
    if (filtered.length > visibleCount) {
      $('#toggleAsteroidsFullView').show();
      $('#toggleAsteroidsFullView').off('click').on('click', function() {
        const full = $(this).data('full');
        if (full) {
          applyFilter();
          $(this).data('full', false).html('<i class="bi bi-fullscreen"></i> Ver lista completa');
        } else {
          // Mostrar todos
          const allHTML = filtered.map(function(ast) {
            const velocity = Math.round(ast.velocity);
            const distance = Math.round(ast.distance);
            const moons = (ast.distance / CONFIG.MOON_DISTANCE).toFixed(2);
            const dangerClass = ast.dangerous && ast.distance < CONFIG.DANGER_THRESHOLD ? 'danger-high' : 
                                ast.dangerous ? 'danger-medium' : 'danger-low';
            const badge = ast.dangerous ? 
              '<span class="badge bg-danger">PELIGROSO</span>' :
              '<span class="badge bg-success">SEGURO</span>';
            
            return `
              <div class="asteroid-item ${dangerClass}">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="mb-1">${ast.name} ${badge}</h6>
                    <small>
                      <i class="bi bi-calendar"></i> ${ast.date} | 
                      <i class="bi bi-rulers"></i> ${distance.toLocaleString('es-ES')} km (${moons} lunas) | 
                      <i class="bi bi-speedometer2"></i> ${velocity.toLocaleString('es-ES')} km/h
                    </small>
                  </div>
                </div>
              </div>
            `;
          }).join('');
          $('#asteroidsList').html(allHTML);
          $(this).data('full', true).html('<i class="bi bi-fullscreen-exit"></i> Ocultar lista completa');
        }
      });
    } else {
      $('#toggleAsteroidsFullView').hide();
    }
  }

  function navigateToSection(sectionId) {
    $('.section-content').removeClass('active');
    $(`#${sectionId}`).addClass('active');
    
    $('.nav-link').removeClass('active');
    $(`.nav-link[data-section="${sectionId}"]`).addClass('active');
    
    $('html, body').animate({
      scrollTop: $(`#${sectionId}`).offset().top - 80
    }, 500);
  }

  // ========== CARGA DE ASTEROIDES (MÉTODO QUE FUNCIONA) ==========
  function loadAsteroids() {
    console.log('🔄 Iniciando carga de asteroides...');
    
    $('#asteroidsLoading').show();
    $('#asteroidsList').hide();

    // Usar la URL ya construida con rango de 7 días
    console.log('📡 URL de la API:', API_URL);

    $.ajax({
      url: API_URL,
      method: 'GET',
      timeout: 10000,  // 10 segundos máximo
      success: function(data) {
        console.log('✅ NASA NeoWs API exitosa', data);
        if (data && data.near_earth_objects && Object.keys(data.near_earth_objects).length > 0) {
          renderAsteroids(data);
        } else {
          console.warn('⚠️ Datos de API vacíos o inválidos');
          loadAsteroidsBackup();
        }
      },
      error: function(xhr, status, error) {
        console.error('❌ Error NASA API:', status, error);
        console.log(`⏱️ Timeout/Error después de 10s. Usando respaldo...`);
        loadAsteroidsBackup();
      }
    });
  }

  function renderAsteroids(data) {
    console.log('🔄 Procesando datos de asteroides...');
    
    $('#asteroidsLoading').hide();
    $('#asteroidsList').show();

    const neoData = data.near_earth_objects;
    allAsteroids = [];
    
    // Aplanar todos los asteroides de todas las fechas
    Object.keys(neoData).forEach(date => {
      neoData[date].forEach(neo => {
        if (neo.close_approach_data && neo.close_approach_data.length > 0) {
          allAsteroids.push({
            name: neo.name,
            diameter: neo.estimated_diameter.meters.estimated_diameter_max,
            distance: parseFloat(neo.close_approach_data[0].miss_distance.kilometers),
            velocity: parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_hour),
            dangerous: neo.is_potentially_hazardous_asteroid,
            date: neo.close_approach_data[0].close_approach_date
          });
        }
      });
    });

    console.log('✅ Asteroides procesados:', allAsteroids.length);

    // Actualizar estadísticas
    const dangerous = allAsteroids.filter(a => a.dangerous);
    const velocities = allAsteroids.map(a => a.velocity);
    const maxVelocity = velocities.reduce((max, v) => v > max ? v : max, 0);

    $('#totalAsteroids').text(allAsteroids.length);
    $('#dangerousCount').text(dangerous.length);
    $('#maxSpeed').text(Math.round(maxVelocity).toLocaleString('es-ES'));
    
    if (allAsteroids.length > 0) {
      const sortedByDist = [...allAsteroids].sort((a, b) => a.distance - b.distance);
      const closestMoons = (sortedByDist[0].distance / CONFIG.MOON_DISTANCE).toFixed(2);
      $('#closestMoons').text(closestMoons);
    }

    $('#countAll').text(allAsteroids.length);
    $('#countDangerous').text(dangerous.length);
    $('#countSafe').text(allAsteroids.length - dangerous.length);

    // Aplicar filtro inicial
    applyFilter();
  }

  function loadAsteroidsBackup() {
    console.log('� Cargando datos de respaldo desde backup.json...');
    
    $.ajax({
      url: 'backup.json',
      method: 'GET',
      timeout: 5000,
      dataType: 'json',
      success: function(data) {
        console.log('✅ Datos de respaldo cargados desde backup.json', data);
        if (data && data.near_earth_objects) {
          renderAsteroids(data);
          $('#asteroidsList').prepend(
            '<div class="alert alert-warning mb-3">' +
            '<i class="bi bi-exclamation-triangle"></i> <strong>⚠️ Modo Offline:</strong> Datos de respaldo - API de NASA no disponible' +
            '</div>'
          );
        } else {
          console.error('❌ backup.json no tiene estructura correcta');
          loadAsteroidsEmergency();
        }
      },
      error: function(xhr, status, error) {
        console.error('❌ Error cargando backup.json:', status, error);
        loadAsteroidsEmergency();
      }
    });
  }

  function loadAsteroidsEmergency() {
    console.log('🆘 Cargando datos de emergencia (inline)...');
    
    allAsteroids = [
      {
        name: '2024 XY1 (Emergencia)',
        diameter: 250,
        distance: 2500000,
        velocity: 45000,
        dangerous: true,
        date: '2024-10-22'
      },
      {
        name: '2024 AB2 (Emergencia)',
        diameter: 150,
        distance: 5500000,
        velocity: 32000,
        dangerous: false,
        date: '2024-10-23'
      },
      {
        name: '2024 CD3 (Emergencia)',
        diameter: 180,
        distance: 3800000,
        velocity: 28000,
        dangerous: true,
        date: '2024-10-24'
      },
      {
        name: '2024 EF4 (Emergencia)',
        diameter: 90,
        distance: 7200000,
        velocity: 35000,
        dangerous: false,
        date: '2024-10-25'
      }
    ];

    const emergencyData = {
      near_earth_objects: {
        '2024-10-22': allAsteroids
      }
    };

    console.log('✅ Datos de emergencia cargados');
    renderAsteroids(emergencyData);
    
    $('#asteroidsList').prepend(
      '<div class="alert alert-danger mb-3">' +
      '<i class="bi bi-exclamation-circle-fill"></i> <strong>🆘 Modo Emergencia:</strong> API indisponible y backup.json no accesible' +
      '</div>'
    );
  }

  // ========== COMENTARIOS Y VALORACIÓN (ANÓNIMOS) ==========
  function renderComments() {
    const comments = JSON.parse(localStorage.getItem('jsoares_eyes_comments') || '[]');
    let html = '';
    
    if (comments.length === 0) {
      html = '<p class="text-muted"><i class="bi bi-chat-left"></i> No hay comentarios aún. ¡Sé el primero!</p>';
    } else {
      comments.forEach(c => {
        html += `<div class="comment-item" style="border-left: 3px solid var(--nasa-red); padding: 1rem; margin: 0.5rem 0; background: rgba(252, 61, 33, 0.05); border-radius: 4px;">
          <strong style="color: var(--nasa-red);">👤 ${c.name}</strong> 
          <span class="star-rating" style="margin-left: 0.5rem;">${'★'.repeat(c.rating)}${'☆'.repeat(5 - c.rating)}</span>
          <p style="margin: 0.5rem 0; color: #ccc;">${c.text}</p>
          <small class="text-secondary" style="font-size: 0.85rem;">📅 ${c.date}</small>
        </div>`;
      });
    }
    $('#commentsSection').html(html);
  }

  function renderCommentForm() {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      starsHtml += `<i class="bi bi-star-fill" data-value="${i}" style="cursor:pointer;font-size:1.3rem;color:gold;margin-right:0.3rem;"></i>`;
    }
    
    const formHtml = `<form id="commentForm" class="mt-3" style="background: rgba(252, 61, 33, 0.08); padding: 1.5rem; border-radius: 8px; border: 1px solid rgba(252, 61, 33, 0.2);">
      <div class="mb-3">
        <label class="form-label" style="color: var(--nasa-red); font-weight: bold;">Tu nombre</label>
        <input type="text" class="form-control" id="commentName" placeholder="Tu nombre" maxlength="50" required style="background: rgba(255,255,255,0.05); border-color: rgba(252, 61, 33, 0.3); color: #fff;">
      </div>
      <div class="mb-3">
        <label class="form-label" style="color: var(--nasa-red); font-weight: bold;">Tu comentario</label>
        <textarea class="form-control" id="commentText" rows="3" maxlength="300" required placeholder="Escribe tu opinión sobre NASA Eyes..." style="background: rgba(255,255,255,0.05); border-color: rgba(252, 61, 33, 0.3); color: #fff;"></textarea>
      </div>
      <div class="mb-3">
        <label class="form-label" style="color: var(--nasa-red); font-weight: bold;">Valoración:</label> 
        <span id="ratingStars">${starsHtml}</span>
        <input type="hidden" id="commentRating" value="5">
      </div>
      <button type="submit" class="btn btn-danger-neon">
        <i class="bi bi-send"></i> Enviar Comentario
      </button>
    </form>`;
    
    $('#commentFormContainer').html(formHtml);

    // Configurar sistema de estrellas interactivo
    $('#ratingStars i').on('click', function() {
      const val = $(this).data('value');
      $('#commentRating').val(val);
      $('#ratingStars i').each(function(idx) {
        $(this).attr('class', `bi ${idx < val ? 'bi-star-fill' : 'bi-star'}`);
      });
    });

    // Manejar envío del formulario
    $('#commentForm').on('submit', function(e) {
      e.preventDefault();
      const name = $('#commentName').val().trim();
      const text = $('#commentText').val().trim();
      const rating = parseInt($('#commentRating').val());
      
      if (!name) {
        alert('Por favor ingresa tu nombre');
        return;
      }
      
      if (!text) {
        alert('Por favor escribe un comentario');
        return;
      }
      
      const comments = JSON.parse(localStorage.getItem('jsoares_eyes_comments') || '[]');
      comments.unshift({
        name: name,
        text: text,
        rating: rating,
        date: new Date().toLocaleString('es-ES')
      });
      
      // Guardar máximo 50 comentarios
      if (comments.length > 50) {
        comments.pop();
      }
      
      localStorage.setItem('jsoares_eyes_comments', JSON.stringify(comments));
      renderComments();
      renderCommentForm();
      
      alert('¡Comentario publicado con éxito!');
    });
  }

  // ========== SECCIÓN EXPLORAR: HUBBLE ==========
  // Funciones para cargar Escuchando Hubble y Camera Hubble con fallback

  function loadHubbleListening() {
    console.log('🎵 Cargando Escuchando Hubble...');
    
    const $loading = $('#hubbleListeningLoading');
    const $content = $('#hubbleListeningContent');
    const $iframe = $('#hubbleListeningIframe');
    
    $loading.show();
    $content.hide();
    
    // Esperar a que cargue el iframe (timeout de 5 segundos)
    const loadTimeout = setTimeout(() => {
      console.warn('⚠️ Hubble Listening tardó mucho, intentando respaldo...');
      loadHubbleListeningFallback();
    }, 5000);
    
    $iframe.on('load', function() {
      clearTimeout(loadTimeout);
      $loading.hide();
      $content.show();
      console.log('✅ Escuchando Hubble cargado');
    }).on('error', function() {
      clearTimeout(loadTimeout);
      console.warn('❌ Hubble Listening no cargó, usando respaldo...');
      loadHubbleListeningFallback();
    });
  }

  function loadHubbleListeningFallback() {
    console.log('📊 Cargando respaldo OSDR para Hubble Listening...');
    
    const $loading = $('#hubbleListeningLoading');
    const $content = $('#hubbleListeningContent');
    
    // Llamar a OSDR API (estudios relacionados con Hubble/espaciales)
    const osdrUrl = 'https://osdr.nasa.gov/osdr/data/osd/files/87-95,137,153/?page=0&size=10';
    
    $.ajax({
      url: osdrUrl,
      method: 'GET',
      timeout: 5000,
      dataType: 'json',
      success: function(data) {
        console.log('✅ Datos OSDR obtenidos:', data);
        
        let html = '<div class="alert alert-info mb-3">';
        html += '<i class="bi bi-info-circle"></i> Datos de respaldo - OSDR NASA<br>';
        html += '<small>Escuchando Hubble no disponible, mostrando datos de investigación espacial</small></div>';
        
        if (data.studies && data.studies.length > 0) {
          html += '<div class="row g-3">';
          data.studies.slice(0, 5).forEach((study, idx) => {
            html += `<div class="col-md-6">
              <div class="card bg-dark border-danger">
                <div class="card-body">
                  <h6 class="card-title">Estudio ${idx + 1}</h6>
                  <p class="card-text text-muted small">${study.title || 'Datos del Hubble'}</p>
                  <a href="https://osdr.nasa.gov" target="_blank" class="btn btn-sm btn-danger-neon">
                    <i class="bi bi-box-arrow-up-right"></i> Ver más
                  </a>
                </div>
              </div>
            </div>`;
          });
          html += '</div>';
        } else {
          html += '<p class="text-muted">Datos de investigación espacial de la NASA</p>';
        }
        
        $content.html(html);
        $loading.hide();
        $content.show();
      },
      error: function(err) {
        console.warn('❌ OSDR también falló:', err);
        $content.html(`
          <div class="alert alert-warning">
            <i class="bi bi-exclamation-triangle"></i> 
            Escuchando Hubble no está disponible en este momento.
            <a href="https://www3.nasa.gov/specials/hubble-adventure-app/" target="_blank" class="btn btn-sm btn-danger-neon ms-2">
              Visitar sitio NASA
            </a>
          </div>
        `);
        $loading.hide();
        $content.show();
      }
    });
  }

  window.playHubbleGame = function() {
    console.log('🎮 Cargando Camera Hubble...');
    
    const $loading = $('#hubbleGameLoading');
    const $content = $('#hubbleGameContent');
    const $btn = $('#playHubbleGameBtn');
    const $iframe = $('#hubbleGameIframe');
    
    $btn.hide();
    $loading.show();
    $content.hide();
    
    // Esperar a que cargue el iframe (timeout de 5 segundos)
    const loadTimeout = setTimeout(() => {
      console.warn('⚠️ Camera Hubble tardó mucho, intentando respaldo...');
      loadHubbleGameFallback();
    }, 5000);
    
    $iframe.on('load', function() {
      clearTimeout(loadTimeout);
      $loading.hide();
      $content.show();
      console.log('✅ Camera Hubble cargado');
    }).on('error', function() {
      clearTimeout(loadTimeout);
      console.warn('❌ Camera Hubble no cargó, usando respaldo...');
      loadHubbleGameFallback();
    });
  };

  function loadHubbleGameFallback() {
    console.log('📊 Cargando respaldo OSDR para Camera Hubble...');
    
    const $loading = $('#hubbleGameLoading');
    const $content = $('#hubbleGameContent');
    const $btn = $('#playHubbleGameBtn');
    
    // Llamar a OSDR API
    const osdrUrl = 'https://osdr.nasa.gov/osdr/data/osd/files/100-110,200-210/?page=0&size=10';
    
    $.ajax({
      url: osdrUrl,
      method: 'GET',
      timeout: 5000,
      dataType: 'json',
      success: function(data) {
        console.log('✅ Datos OSDR para juego obtenidos:', data);
        
        let html = '<div class="alert alert-info mb-3">';
        html += '<i class="bi bi-info-circle"></i> Camera Hubble - Modo Respaldo<br>';
        html += '<small>Visualizando datos de observaciones espaciales</small></div>';
        
        html += '<div class="row g-3">';
        if (data.studies && data.studies.length > 0) {
          data.studies.slice(0, 6).forEach((study, idx) => {
            html += `<div class="col-md-4">
              <div class="card bg-dark border-danger text-center p-3">
                <i class="bi bi-telescope text-danger" style="font-size: 2rem;"></i>
                <h6 class="mt-2">Observación ${idx + 1}</h6>
                <p class="small text-muted mb-0">${study.type || 'Datos Hubble'}</p>
              </div>
            </div>`;
          });
        } else {
          html += '<div class="col-12"><p class="text-muted">Datos de observaciones telescópicas</p></div>';
        }
        html += '</div>';
        
        $content.html(html);
        $btn.show();
        $loading.hide();
        $content.show();
      },
      error: function(err) {
        console.warn('❌ OSDR también falló:', err);
        $content.html(`
          <div class="alert alert-warning">
            <i class="bi bi-exclamation-triangle"></i> 
            Camera Hubble no está disponible en este momento.
            <a href="https://www3.nasa.gov/specials/hubble-adventure-app/" target="_blank" class="btn btn-sm btn-danger-neon ms-2">
              Visitar juego en NASA
            </a>
          </div>
        `);
        $btn.show();
        $loading.hide();
        $content.show();
      }
    });
  };

  // Función para mostrar la sección Explorar cuando se hace clic
  function initExplorar() {
    console.log('🔭 Sección Explorar inicializada');
    
    // Evento para cuando se hace clic en el navbar
    $(document).on('click', '.nav-link[data-section="explorar"]', function() {
      setTimeout(() => {
        loadHubbleListening();
      }, 500);
    });
    
    // También cargar cuando se hace clic en el botón del carrusel
    $(document).on('click', '.btn-danger-neon[data-section="explorar"]', function() {
      setTimeout(() => {
        loadHubbleListening();
      }, 500);
    });
    
    // Evento para el botón "¡Juega Ahora!" con jQuery
    $(document).on('click', '.play-hubble-game-btn', function() {
      playHubbleGame();
    });
  }

  // Función global para jQuery
  window.playHubbleGame = function() {
    console.log('🎮 Cargando Camera Hubble...');
    
    const $loading = $('#hubbleGameLoading');
    const $content = $('#hubbleGameContent');
    const $btn = $('#playHubbleGameBtn');
    const $iframe = $('#hubbleGameIframe');
    
    $btn.hide();
    $loading.show();
    $content.hide();
    
    // Esperar a que cargue el iframe (timeout de 5 segundos)
    const loadTimeout = setTimeout(() => {
      console.warn('⚠️ Camera Hubble tardó mucho, intentando respaldo...');
      loadHubbleGameFallback();
    }, 5000);
    
    $iframe.on('load', function() {
      clearTimeout(loadTimeout);
      $loading.hide();
      $content.show();
      console.log('✅ Camera Hubble cargado');
    }).on('error', function() {
      clearTimeout(loadTimeout);
      console.warn('❌ Camera Hubble no cargó, usando respaldo...');
      loadHubbleGameFallback();
    });
  };

  // Agregar a la función init() - desplázate hasta el final y agrega esto
  // initExplorar(); // Se debe agregar en la función init()

  // Inicializar comentarios al cargar
  function initComments() {
    renderComments();
    renderCommentForm();
  }

  // ========== INICIAR LA APLICACIÓN ==========
  init();
});