
import bcrypt from "bcryptjs";
import { storage } from "./storage";

async function initAdmin() {
  try {
    console.log("Iniciando script de inicialización de admin...");
    
    // Verificar conexión a la base de datos
    const connected = await storage.testConnection();
    if (!connected) {
      console.error("No se pudo conectar a la base de datos");
      process.exit(1);
    }

    // Verificar si ya existe un admin
    const existingAdmin = await storage.getAdminUserByUsername("admin");
    if (existingAdmin) {
      console.log("✅ Ya existe un usuario administrador");
      console.log(`Usuario: ${existingAdmin.username}`);
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Activo: ${existingAdmin.active}`);
      return;
    }

    // Crear admin inicial
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const adminUser = await storage.createAdminUser({
      username: "admin",
      email: "admin@barbershop.com",
      password: hashedPassword,
      role: "admin"
    });

    console.log("✅ Usuario administrador creado exitosamente");
    console.log(`Usuario: ${adminUser.username}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Contraseña: admin123`);
    console.log("\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login");
    
  } catch (error) {
    console.error("❌ Error al inicializar admin:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

initAdmin();
import dotenv from "dotenv";
import { db } from "./storage";
import { employees } from "../shared/schema";
import bcrypt from "bcryptjs";

// Cargar variables de entorno
dotenv.config();

async function initAdmin() {
  try {
    console.log("🚀 Inicializando administrador...");

    // Verificar si ya existe un admin
    const existingAdmin = await db.select()
      .from(employees)
      .where(eq(employees.username, 'admin'))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("✅ Admin ya existe, saltando creación...");
      return;
    }

    // Crear hash de contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Crear admin
    const newAdmin = await db.insert(employees).values({
      username: 'admin',
      password: hashedPassword,
      isAdmin: true,
      active: true,
      canLogin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log("✅ Administrador creado exitosamente:");
    console.log("   Usuario: admin");
    console.log("   Contraseña: admin123");
    console.log("   ⚠️  CAMBIA LA CONTRASEÑA DESPUÉS DEL PRIMER LOGIN");
    console.log("");
    console.log("🌐 Accede al panel admin en: http://tu-dominio.com/admin/login");
    
  } catch (error) {
    console.error("❌ Error al crear administrador:", error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  initAdmin().then(() => {
    console.log("✅ Inicialización completada");
    process.exit(0);
  }).catch((error) => {
    console.error("❌ Error en inicialización:", error);
    process.exit(1);
  });
}

export { initAdmin };
