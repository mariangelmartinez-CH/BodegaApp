# BodegaApp

Español | [English](#english)

Sinceramente, este es mi primer proyecto automatizando todo lo que he visto en estos 3 semestres de universidad. Es un proyecto pequeño, de uso familiar, para nuestro negocio (un abasto pequeño), hecho a través de herramientas de vibe coding. Mi agente fue Claude, y usé herramientas de punta como Vercel y Supabase.

Entiendo todo lo que hice, y gracias a las nuevas tecnologías pude hacerlo en muy poco tiempo, ya que lo requeríamos de urgencia. Por ahora cumple nuestras necesidades.

Es importante saber cómo funcionan las cosas para poder implementar las soluciones correctas, y es increíble poder automatizar el trabajo gracias al avance tecnológico. Sin embargo, las cosas hay que saber usarlas y darles un sentido.

## Qué hace la app

- **Inventario** por categorías, con lo que hay y lo que falta.
- **Conteo semanal:** se cuenta producto por producto y la app calcula lo que se vendió comparando con el conteo anterior.
- **Caja** de efectivo en pesos, con historial.
- **Fiados:** quién debe y cuánto, con pagos completos o por partes.
- **Pedidos** a distribuidoras, con fecha límite y estado de pago y de recepción.
- **Usuarios con permisos:** cada persona entra con su cuenta y solo puede hacer lo que le corresponde.
- **Tiempo real:** lo que se registra en un teléfono aparece en los demás sin recargar.
- **Instalable:** funciona como app en el teléfono, sin pasar por una tienda.

## Tecnología

React, TypeScript, Vite y Tailwind CSS en el frente. Supabase para la base de datos (PostgreSQL), el login y el tiempo real. Vercel para publicarla. Los datos se protegen con reglas de seguridad por fila en la base de datos, y el registro público está cerrado: las cuentas las crea la administradora.

## Cómo correrla

Necesitas Node 22 o superior y un proyecto propio de Supabase. Los archivos de `supabase/migrations` crean las tablas y los permisos; los productos y precios de mi negocio no están en el repositorio.

Copia `.env.example` como `.env`, escribe ahí la URL y la clave publicable de tu proyecto, y luego:

```bash
npm install
npm run dev
```

---

## English

Honestly, this is my first project automating everything I have learned in these 3 semesters of university. It is a small project for family use, for our business (a small grocery store), built with vibe coding tools. My agent was Claude, and I used cutting-edge tools like Vercel and Supabase.

I understand everything I did, and thanks to new technologies I was able to build it in very little time, since we needed it urgently. For now it meets our needs.

It is important to know how things work in order to implement the right solutions, and it is incredible to be able to automate work thanks to technological progress. However, you have to know how to use these things and give them a purpose.

### What the app does

- **Inventory** by category, showing what is in stock and what is missing.
- **Weekly count:** products are counted one by one and the app works out what was sold by comparing with the previous count.
- **Cash register** for cash in pesos, with history.
- **Customer credit:** who owes what, with full or partial payments.
- **Supplier orders**, with due date and payment and reception status.
- **Users with permissions:** each person signs in with their own account and can only do what their role allows.
- **Real time:** what is recorded on one phone shows up on the others without reloading.
- **Installable:** it works as an app on the phone, without going through a store.

### Tech stack

React, TypeScript, Vite and Tailwind CSS on the front end. Supabase for the database (PostgreSQL), authentication and real time. Vercel for deployment. Data is protected with row level security rules in the database, and public sign-up is disabled: accounts are created by the administrator.

### Running it

You need Node 22 or later and your own Supabase project. The files in `supabase/migrations` create the tables and permissions; the products and prices of my business are not in the repository.

Copy `.env.example` to `.env`, fill in your project's URL and publishable key, and then:

```bash
npm install
npm run dev
```
