---
title: Idempotencia en pagos y webhooks
description: Cómo evitar cobros dobles y pedidos duplicados cuando una petición o un evento llega más de una vez.
type: manual
tags: [idempotencia, pagos, webhooks, duplicados, reintentos, stripe, negocio]
technologies: [JavaScript, Node.js, SQL, n8n]
createdAt: 2026-10-12
related: [journal/cuando-un-webhook-llega-dos-veces, manual/apis/paginacion-y-limites-de-tasa, manual/n8n/orquestacion-y-manejo-de-errores]
references: [Stripe: peticiones idempotentes | https://docs.stripe.com/api/idempotent_requests, Stripe: recibir webhooks | https://docs.stripe.com/webhooks, IETF: encabezado Idempotency-Key | https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/, n8n: nodo Remove Duplicates | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.removeduplicates/]
---

## Problema que resuelve

Un cliente pulsa "Pagar", la conexión del móvil se corta y la app reintenta. ¿Se cobró una vez o dos? Una pasarela avisa por webhook de un pago aprobado, tu servidor tarda en responder y la pasarela **reenvía el mismo evento**: se crean dos pedidos y se despacha dos veces.

No es un caso raro. La mayoría de servicios de webhooks garantizan entrega **"al menos una vez"**, no "exactamente una vez": duplicar es parte del contrato. Una operación es **idempotente** si repetirla deja el sistema igual que hacerla una sola vez. Esa es la propiedad que necesitas.

```mindmap
Dónde aparecen los duplicados
- Reintentos del cliente :: la red falla y la app vuelve a enviar
  - Clave de idempotencia
- Webhooks reenviados :: entrega al menos una vez
  - Guardar el id del evento
- Doble clic :: dos envíos en el mismo segundo
  - Botón desactivado
  - Restricción única
- Reintentos automáticos :: Retry On Fail en n8n
  - Solo en pasos idempotentes
```

## Al enviar: clave de idempotencia

Cuando **tú** llamas a una API que crea algo (un cobro, una factura), envía una clave única por operación en el encabezado `Idempotency-Key`. Si la petición se repite con la misma clave, la API devuelve el resultado de la primera en lugar de repetirla. Stripe lo soporta; muchas pasarelas y APIs de facturación tienen un mecanismo equivalente (consulta su documentación).

```js
import { randomUUID } from 'node:crypto'

// La clave se genera UNA vez por operación de negocio y se guarda con el pedido,
// para reutilizarla en cada reintento de esa misma operación
const idempotencyKey = pedido.claveCobro ?? randomUUID()

const res = await fetch('https://api.pasarela.example/v1/cobros', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.PASARELA_API_KEY}`,
    'Content-Type': 'application/json',
    'Idempotency-Key': idempotencyKey,
  },
  body: JSON.stringify({ monto: pedido.total, moneda: 'COP', referencia: pedido.id }),
})
```

El error más común es generar la clave **dentro** de la función de reintento: cada intento lleva una clave nueva y la protección desaparece.

## Al recibir: registrar los eventos procesados

Cuando **otro** te avisa por webhook, cada evento trae un identificador (`evt_…`). Guárdalo en una tabla con clave primaria y procesa solo si la inserción es nueva:

```sql
CREATE TABLE eventos_procesados (
  id VARCHAR(100) PRIMARY KEY,
  recibido_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

```js
// Express + mysql2. El webhook ya fue verificado con la firma del proveedor.
app.post('/webhooks/pagos', async (req, res) => {
  const evento = req.body
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [r] = await conn.execute('INSERT IGNORE INTO eventos_procesados (id) VALUES (?)', [evento.id])
    if (r.affectedRows === 0) {
      await conn.rollback()
      return res.sendStatus(200) // ya lo procesamos: respondemos OK para que no lo reenvíe
    }
    await marcarPedidoComoPagado(conn, evento.data.referencia)
    await conn.commit()
    res.sendStatus(200)
  } catch (err) {
    await conn.rollback()
    res.sendStatus(500) // el proveedor reintentará más tarde
  } finally {
    conn.release()
  }
})
```

Por qué así:

- **La inserción y el efecto van en la misma transacción.** Si marcar el pedido falla, el registro del evento también se deshace y el reintento del proveedor podrá procesarlo.
- **La clave primaria hace el trabajo.** Dos copias que llegan a la vez no pueden insertarse ambas; comprobar con un `SELECT` previo sí deja pasar las dos.
- **Responder 200 al duplicado.** Un error haría que el proveedor siga reenviándolo.

## Y si además el efecto es idempotente, mejor

"Marcar el pedido como pagado" es idempotente por naturaleza si se escribe así:

```sql
UPDATE pedidos SET estado = 'pagado', pagado_en = NOW()
WHERE id = ? AND estado = 'pendiente';
```

Repetirlo no cambia nada. "Sumar 1 al inventario vendido" no lo es: repetirlo descuadra. Prefiere operaciones que fijan un estado a operaciones que suman o restan.

## En n8n

- Guarda el id del evento en una tabla (MySQL, Postgres) con clave primaria y usa la misma lógica: si la inserción falla por duplicado, termina el flujo.
- El nodo **Remove Duplicates** puede descartar items ya vistos en ejecuciones anteriores. Sirve para casos sencillos, pero una restricción única en tu base de datos es más fiable con ejecuciones simultáneas.
- Activa **Retry On Fail** solo en nodos idempotentes. Reintentar un "crear factura" sin clave de idempotencia es como pulsar "Pagar" dos veces.

## Errores frecuentes

- **Nueva clave en cada reintento.** La clave identifica la operación, no el intento.
- **Comprobar con SELECT y luego insertar.** Entre las dos sentencias cabe otra copia del evento.
- **Responder después del trabajo pesado.** Si procesar tarda más que el tiempo límite del proveedor, este reintenta mientras aún trabajas. Registra, responde rápido y procesa en segundo plano.
- **Ignorar la firma.** Sin verificar la firma del webhook, cualquiera puede enviarte un "pago aprobado" falso.
