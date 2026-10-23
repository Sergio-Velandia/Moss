/**
 * Datos del sitio. Las páginas legales y el pie de página leen estos valores.
 */
export const site = {
  name: 'Moss — Digital Garden',
  portfolioUrl: 'https://sergio-velandia.dev/mi-portafolio/',
  repoUrl: 'https://github.com/Sergio-Velandia/Moss',
  /** Sitio hermano con los flujos de n8n listos para copiar. Única fuente de esta URL en Moss. */
  nexusUrl: 'https://sergio-velandia.dev/Moss-Nexus/',
  ownerName: 'Sergio Andres Ramirez Velandia',
  contactEmail: 'contacto@sergio-velandia.dev',
  country: 'Colombia',
  legalUpdatedAt: '2026-10-22',
  /**
   * Formularios de «Propón una idea» (API REST de EmailJS). Los tres valores son públicos por diseño de EmailJS:
   * viajan al navegador. El destino se configura en la plantilla de EmailJS. Si falta alguno, el formulario
   * avisa de que el envío no está activo.
   */
  emailjs: { serviceId: 'service_ykyb3t9', templateId: 'template_qn6edjb', publicKey: '0arvWc2vnvpI6rFgd' },
}
