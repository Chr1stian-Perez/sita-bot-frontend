# SITA Bot Frontend

Frontend de SITA Bot usando Next.js 16 y React 19.

## Instalación en EC2

1. Conectarse a la instancia EC2 Frontend (SSH directo)
2. Clonar el repositorio
3. Configurar variables de entorno (`.env`)
   - Actualizar `NEXT_PUBLIC_API_URL` con la IP privada del Backend
   - Actualizar `NEXT_PUBLIC_COGNITO_REDIRECT_URI` con la IP pública del Frontend
4. Ejecutar el script de despliegue:

\`\`\`bash
chmod +x deploy.sh
./deploy.sh
\`\`\`

## Variables de Entorno Importantes

Antes de desplegar, actualizar en `.env`:

\`\`\`env
NEXT_PUBLIC_API_URL=http://10.0.x.x:8000  # IP Privada del Backend
NEXT_PUBLIC_COGNITO_REDIRECT_URI=http://3.x.x.x/auth/callback  # IP Pública del Frontend
NEXT_PUBLIC_COGNITO_LOGOUT_URI=http://3.x.x.x  # IP Pública del Frontend
\`\`\`

## Arquitectura

- Frontend (Subred Pública) → Backend API (Subred Privada) → RDS (Subred Privada)
- Todo el procesamiento de datos se hace en el backend
- Frontend solo maneja UI y llamadas API
