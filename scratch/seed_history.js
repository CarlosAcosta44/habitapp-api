const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createAndSeedMartin() {
  console.log("Creando usuario Martin (martincitocuak2@gmail.com)...");
  
  const targetEmail = 'martincitocuak2@gmail.com';

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: targetEmail,
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      nombre: 'Martin',
      apellido: 'Acosta'
    }
  });

  const { data: userData } = await supabase.auth.admin.listUsers();
  const user = userData.users.find(u => u.email === targetEmail);
  const userId = user.id;

  const { data: gestionUser } = await supabase.schema('gestion').from('usuarios').select('idusuario').eq('idusuario', userId).single();
  if (!gestionUser) {
    const { data: roles } = await supabase.schema('gestion').from('roles').select('idrol').eq('nombrerol', 'Usuario').single();
    await supabase.schema('gestion').from('usuarios').insert({
      idusuario: userId,
      nombre: 'Martin',
      apellido: 'Acosta',
      estado: 'Activo',
      puntostotales: 0,
      idrol: roles.idrol
    });
  }

  let { data: categorias } = await supabase.schema('seguimiento').from('categorias_habitos').select('idcategoria').limit(1);
  let idcategoria = categorias && categorias.length > 0 ? categorias[0].idcategoria : null;
  if (!idcategoria) {
    const { data: newCat, error: catError } = await supabase.schema('seguimiento').from('categorias_habitos').insert({
      nombre: 'General', descripcion: 'Categoría general'
    }).select();
    if (catError) return console.error("Error cat:", catError.message);
    idcategoria = newCat[0].idcategoria;
  }

  await supabase.schema('seguimiento').from('habitos').delete().eq('idusuario', userId);

  const hace15Dias = new Date();
  hace15Dias.setDate(hace15Dias.getDate() - 15);
  hace15Dias.setHours(0,0,0,0);
  
  const nuevosHabitos = [
    { idusuario: userId, idcategoria: idcategoria, nombre: 'Leer 20 páginas', meta_diaria: 1, fechainicio: hace15Dias.toISOString(), estado: 'Activo', puntos: 10, dias_semana: [1,2,3,4,5,6,7] },
    { idusuario: userId, idcategoria: idcategoria, nombre: 'Hacer ejercicio', meta_diaria: 1, fechainicio: hace15Dias.toISOString(), estado: 'Activo', puntos: 20, dias_semana: [1,2,3,4,5,6,7] },
    { idusuario: userId, idcategoria: idcategoria, nombre: 'Tomar 2L de agua', meta_diaria: 1, fechainicio: hace15Dias.toISOString(), estado: 'Activo', puntos: 5, dias_semana: [1,2,3,4,5,6,7] }
  ];

  const { data: habitosCreados, error: errH } = await supabase.schema('seguimiento').from('habitos').insert(nuevosHabitos).select();
  if (errH) return console.error("Error creando hábitos:", errH.message);
  
  const records = [];
  for (let i = 1; i <= 14; i++) {
    const fechaRegistro = new Date();
    fechaRegistro.setDate(fechaRegistro.getDate() - i);
    fechaRegistro.setHours(0,0,0,0);
    const fechaStr = fechaRegistro.toISOString().split('T')[0];
    
    for (const h of habitosCreados) {
      let completado = true;
      if (i === 5 && h.nombre === 'Hacer ejercicio') completado = false;
      
      if (completado) {
        records.push({ idusuario: userId, idhabito: h.idhabito, fecha: fechaStr, completado: true, progreso_actual: 1 });
      }
    }
  }

  const { error: errR } = await supabase.schema('seguimiento').from('registro_habitos').insert(records);
  if (errR) return console.error("Error creando registros:", errR.message);
  
  console.log(`¡Historial generado exitosamente!`);
  console.log(`Prueba con: martincitocuak2@gmail.com / password123`);
}
void createAndSeedMartin();
