# GII-TFG-Asistente-de-prácticas-ágiles-para-repositorios-en-GitHub

Aplicación web que analiza repositorios de GitHub con el fin de ofrecer recomendaciones y asistencia personalizada para la adopción de buenas prácticas de **metodologías ágiles**, centradas en el contexto académico (por ejemplo, para el desarrollo del TFG), aunque extensible a cualquier proyecto colaborativo en un repositorio de GitHub.

---

## 🚀 Funcionalidades principales

- 🔍 **Análisis de repositorios GitHub**: Extrae y analiza métricas clave como Commits, Issues, Pull Requests, releases, etc.
- ⏱️ **Comparación temporal y contextualizada**: Permite comparar repositorios en el tiempo y frente a proyectos similares.
- 🧭 **Evaluación basada en prácticas ágiles**:
  - Uso de control de versiones
  - Build automática (USando GitHub Actions)
  - Definición de "Done"
  - Integración continua
  - Calidad del backlog (Issues, descripciones, etiquetas, deadlines…)
  - Releases frecuentes
  - Iteraciones
  - Velocidad
  - Propiedad colectiva del código
  - Programación en pareja (detección de colaboración)
- 📈 **Métricas de calidad del proceso**:
  - Velocidad de desarrollo (medias de cierre de Issues y Pull Requests, medias de subida de Releases y Commits)
  - Documentación y estructura de Issues, Commits y Pull Requests (Descripción, imágenes, etiquetas, menciones...)
  - Frecuencia y éxito de workflows automatizados
  - Actividad y participaciones de los miembros del repositorio
- 📚 **Asistencia educativa**:
  - Ideal para estudiantes en entornos universitarios que usan GitHub como herramienta de desarrollo académico
  - Explicaciones formativas de cada recomendación

---

## 🛠️ Tecnologías utilizadas

- **Frontend**: [Angular 19.2.3](https://angular.io/)
- **Backend**: [Node.js](https://nodejs.org/) + Express.js
- **Base de datos**: [MongoDB](https://www.mongodb.com/) + Mongoose
- **Despliegue**: Vercel (Frontend) / Render (Backend)
- **API**: GitHub REST API
- **Documentación**: LaTeX (Memoria del TFG disponible en este repositorio)

---

## 📊 Reglas Ágiles Evaluadas

Inspiradas en el [_Subway Map to Agile Practices_](https://www.agilealliance.org), estas son algunas de las reglas que la app analiza:

| Regla                           | Evaluación                                                  | Práctica Ágil              |
|--------------------------------|--------------------------------------------------------------|----------------------------|
| Automated Build                | Presencia de workflows en `.github/workflows/`              | DevOps                     |
| Version Control                | Frecuencia y calidad de Commits                             | DevOps                     |
| Continuous Integration         | Frecuencia de ejecución y éxito de PRs y workflows          | XP, DevOps                 |
| Definition of Done             | Issues cerradas correctamente                               | Scrum                      |
| Backlog Quality                | Issues con descripciones, etiquetas, asignaciones           | Scrum                      |
| Iterations                     | Uso de milestones y ciclos de desarrollo                    | XP, Scrum                  |
| Velocity                       | Story points, Issues cerradas por periodo                   | XP                         |
| Frequent Releases              | Releases regulares                                          | XP                         |
| Collective Ownership           | Actividad distribuida entre miembros                        | XP                         |
| Pair Programming               | Menciones entre miembros en PRs/Issues                      | XP                         |

---

## 🎯 Objetivos del proyecto

### Funcionales

- Permitir configurar el análisis temporal de repositorios
- Evaluar automáticamente la aplicación de prácticas ágiles en repositorios GitHub
- Ofrecer recomendaciones basadas en métricas del proceso de desarrollo

### No funcionales

- Aplicación mantenible, modular y reutilizable (Angular + Node.js)
- Alta usabilidad y visualización intuitiva de resultados
- Integración clara entre capas cliente-servidor (REST API)

---

## 🖥️ Uso

- No requiere de instalación
- La aplicación puede ser usada desde "Production" en el apartado de "Deployments" de la página principal del repositorio


## 📌 Instalación (modo local)

```bash
# Clona el repositorio
git clone https://github.com/<usuario>/GII-TFG-Asistente-de-practicas-agiles-para-repositorios-en-GitHub.git
cd GII-TFG-Asistente-de-practicas-agiles-para-repositorios-en-GitHub

# Instala dependencias del backend
cd backend
npm install

# Instala dependencias del frontend
cd ../frontend
npm install

# Ejecuta backend (Node.js)
npm run dev

# Ejecuta frontend (Angular)
ng serve
