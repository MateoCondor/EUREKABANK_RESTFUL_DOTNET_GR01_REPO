# Guía de Pruebas de la API Eurekabank (.NET)

Este documento proporciona un paso a paso detallado para probar los endpoints de la API RESTful de Eurekabank (.NET). Puedes usar **Postman**, **Insomnia**, **cURL** o la extensión **REST Client** o **Thunder Client** de VS Code.

> [!NOTE]
> Asumiremos que el servidor se está ejecutando localmente. Si inicias el proyecto con el comando `dotnet run`, asegúrate de revisar la consola para ver en qué puerto está escuchando (por lo general `https://localhost:7143` o `http://localhost:5246`). Reemplaza `{{baseUrl}}` en los siguientes ejemplos por tu URL.

---

## 1. Comprobar el estado del servidor (Health Check)

Verifica que el servidor esté levantado y respondiendo.

- **Método:** `GET`
- **Endpoint:** `{{baseUrl}}/`

**Respuesta esperada (200 OK):**
```json
{
  "name": "EUREKABANK REST API",
  "status": "UP",
  "loginEndpoint": "/auth/login"
}
```

---

## 2. Autenticación (Login)

La base de datos se inicializa automáticamente con un usuario administrador por defecto (`AuthDataSeeder`). Inicia sesión para obtener un token JWT.

- **Método:** `POST`
- **Endpoint:** `{{baseUrl}}/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "username": "MONSTER",
  "password": "MONSTER9"
}
```

**Respuesta esperada (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "username": "MONSTER",
  "role": "ADMIN"
}
```

---

## 3. Configuración de Parámetros del Sistema

Antes de realizar transacciones, debemos configurar los parámetros del sistema (comisiones, límites) que son validados por la lógica de negocio.

### Crear comisión de transferencia (Transfer Fee)
- **Método:** `POST`
- **Endpoint:** `{{baseUrl}}/parameters`
- **Body:**
```json
{
  "key": "transfer.fee.percentage",
  "value": "2.5",
  "description": "Comisión estándar para transferencias (%)"
}
```

### Crear límite diario de retiro
- **Método:** `POST`
- **Endpoint:** `{{baseUrl}}/parameters`
- **Body:**
```json
{
  "key": "withdraw.daily.limit",
  "value": "1000",
  "description": "Límite máximo de retiro por día"
}
```

### Crear saldo mínimo de cuenta
- **Método:** `POST`
- **Endpoint:** `{{baseUrl}}/parameters`
- **Body:**
```json
{
  "key": "account.min.balance",
  "value": "10",
  "description": "Saldo mínimo requerido en la cuenta"
}
```

---

## 4. Crear Clientes (y Usuarios asociados)

Para realizar transacciones, necesitamos clientes. Al crear un cliente, se creará automáticamente su usuario de acceso.

### Crear Cliente 1 (Origen)
- **Método:** `POST`
- **Endpoint:** `{{baseUrl}}/clients`
- **Body:**
```json
{
  "name": "Juan Perez",
  "dni": "1712345678",
  "email": "juan.perez@email.com",
  "phone": "0991234567",
  "status": "ACTIVE",
  "username": "jperez",
  "password": "password123"
}
```

### Crear Cliente 2 (Destino)
- **Método:** `POST`
- **Endpoint:** `{{baseUrl}}/clients`
- **Body:**
```json
{
  "name": "Maria Gomez",
  "dni": "1787654321",
  "email": "maria.gomez@email.com",
  "phone": "0987654321",
  "status": "ACTIVE",
  "username": "mgomez",
  "password": "password123"
}
```

> [!IMPORTANT]
> Toma nota de la propiedad `"id"` en las respuestas. Asumiremos para los siguientes pasos que Juan tiene `id: 1` y María `id: 2`.

---

## 5. Crear Cuentas

Ahora crearemos una cuenta para cada cliente usando sus IDs de cliente.

### Cuenta para Cliente 1 (Juan)
- **Método:** `POST`
- **Endpoint:** `{{baseUrl}}/accounts`
- **Body:**
```json
{
  "clientId": 1,
  "type": "SAVINGS"
}
```

### Cuenta para Cliente 2 (María)
- **Método:** `POST`
- **Endpoint:** `{{baseUrl}}/accounts`
- **Body:**
```json
{
  "clientId": 2,
  "type": "CURRENT"
}
```

> [!IMPORTANT]
> Las cuentas se crearán con un saldo de `0` y un número de cuenta generado automáticamente (12 dígitos). Toma nota de los IDs de las cuentas devueltos (ej. Cuenta de Juan es `id: 1` y Cuenta de María es `id: 2`).

---

## 6. Flujo de Transacciones

Ahora simularemos el flujo del dinero a través de las operaciones transaccionales.

### Paso A: Depósito Inicial
Depositamos dinero en la cuenta de Juan (Cuenta ID: 1).
- **Método:** `POST`
- **Endpoint:** `{{baseUrl}}/transactions/deposit`
- **Body:**
```json
{
  "accountId": 1,
  "amount": 500.00,
  "description": "Depósito inicial de apertura"
}
```

> [!TIP]
> **Comprobación:** Puedes hacer una petición `GET {{baseUrl}}/accounts/1/balance` para verificar que el saldo de Juan es ahora `500.00`.

### Paso B: Retiro
Juan retira parte del dinero (Cuenta ID: 1).
- **Método:** `POST`
- **Endpoint:** `{{baseUrl}}/transactions/withdraw`
- **Body:**
```json
{
  "accountId": 1,
  "amount": 100.00,
  "description": "Retiro en ventanilla"
}
```

> [!WARNING]
> **Comprobación de errores:** Intenta hacer otro retiro pero por la cantidad de `1000.00`. Deberías recibir un error HTTP 400 `Bad Request` con el mensaje indicando que se ha superado el límite diario (1000) o que los fondos son insuficientes.

### Paso C: Transferencia
Juan transfiere dinero a María (De la Cuenta 1 a la Cuenta 2).
- **Método:** `POST`
- **Endpoint:** `{{baseUrl}}/transactions/transfer`
- **Body:**
```json
{
  "sourceAccountId": 1,
  "targetAccountId": 2,
  "amount": 100.00,
  "transferType": "CREDIT",
  "description": "Pago mensualidad"
}
```

> [!NOTE]
> **Análisis de la transacción:** Al ser un "CREDIT" sin parámetro de comisión específico para crédito, tomará el parámetro genérico que configuramos del 2.5%. 
> - A Juan se le debitará de su cuenta `100.00` + `2.50` (comisión) = `102.50`.
> - María recibirá exactamente `100.00` en su cuenta.
> 
> Puedes validar esto con las rutas `GET {{baseUrl}}/accounts/1/balance` y `GET {{baseUrl}}/accounts/2/balance`.

### Paso D: Historial de Transacciones
Finalmente, podemos revisar el libro mayor o historial de transacciones de la cuenta de Juan (Cuenta ID: 1).
- **Método:** `GET`
- **Endpoint:** `{{baseUrl}}/transactions/account/1`

**Respuesta esperada:** Deberías obtener un JSON que es una lista (`Array`) ordenado de manera descendente (por fecha) que incluya:
1. La transferencia (tipo `TRANSFER`).
2. El retiro (tipo `WITHDRAW`).
3. El depósito inicial (tipo `DEPOSIT`).
