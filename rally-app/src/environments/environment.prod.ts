// Producción: la API y el frontend salen del mismo servicio, así que se usa una ruta relativa (sin CORS)
export const environment = {
	conf: 'config/configD.json',
	api_url: '/api'
};
